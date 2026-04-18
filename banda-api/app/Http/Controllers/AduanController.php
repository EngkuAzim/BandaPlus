<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Aduan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB; 

class AduanController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'jenis_kerosakan' => 'required|string|max:255',
            'id_zon' => 'required|integer', 
            'alamat_lokasi' => 'required|string|max:255',
            'keterangan_aduan' => 'nullable|string',
            'gambar_bukti' => 'required|image|mimes:jpeg,png,jpg|max:5048',
        ]);

        $imagePath = $request->file('gambar_bukti')->store('aduan_images', 'public');

        // Generate Custom Primary Key (ADU-2026-0001)
        $year = Carbon::now()->format('Y');
        $lastAduan = Aduan::where('id_aduan', 'like', "ADU-{$year}-%")->orderBy('id_aduan', 'desc')->first();
        $newNumber = $lastAduan ? str_pad(intval(substr($lastAduan->id_aduan, -4)) + 1, 4, '0', STR_PAD_LEFT) : '0001';
        $id_aduan = "ADU-{$year}-{$newNumber}";

        $lat = $request->input('lat');
        $lng = $request->input('lng');
        $lokasi_gps = ($lat && $lng) ? DB::raw("ST_PointFromText('POINT({$lng} {$lat})')") : null;

        $aduan = Aduan::create([
            'id_aduan' => $id_aduan,
            'id_pengguna' => $request->user()->id,
            'id_zon' => $request->id_zon, 
            'jenis_kerosakan' => $request->jenis_kerosakan,
            'alamat_lokasi' => $request->alamat_lokasi,
            'keterangan_aduan' => $request->keterangan_aduan,
            'lokasi_gps' => $lokasi_gps,
            'gambar_bukti' => $imagePath,
            'status' => 'Baru'
        ]);

        return response()->json([
            'message' => 'Aduan berjaya dihantar!',
            'aduan' => $aduan
        ], 201);
    }

    public function getStats(Request $request)
    {
        $userId = $request->user()->id;

        $baru = Aduan::where('id_pengguna', $userId)->where('status', 'Baru')->count();
        $diproses = Aduan::where('id_pengguna', $userId)->where('status', 'Dalam Tindakan')->count();
        $selesai = Aduan::where('id_pengguna', $userId)->where('status', 'Selesai')->count();

        return response()->json([
            'baru' => $baru,
            'diproses' => $diproses,
            'selesai' => $selesai
        ]);
    }

    public function getUserAduan(Request $request)
    {
        // Explicitly select only the columns you need for the frontend
        $aduans = Aduan::select('id_aduan', 'jenis_kerosakan', 'gambar_bukti', 'alamat_lokasi', 'status', 'tarikh_lapor')
                       ->where('id_pengguna', $request->user()->id)
                       ->orderBy('tarikh_lapor', 'desc')
                       ->get();

        return response()->json($aduans);
    }

    // --- 5. ADMIN: DAPATKAN SEMUA ADUAN ---
    public function getAllAduanAdmin(Request $request)
    {
        // Pastikan hanya pentadbir boleh akses
        if ($request->user()->peranan !== 'pentadbir') {
            return response()->json(['message' => 'Akses Ditolak'], 403);
        }

        // ✅ KEMAS KINI: Tambah 'id_jabatan' ke dalam senarai yang ditarik dari pangkalan data
        $aduans = Aduan::select(
            'id_aduan', 'id_pengguna', 'id_zon', 'id_jabatan', 'jenis_kerosakan', 
            'gambar_bukti', 'keterangan_aduan', 'alamat_lokasi', 
            'status', 'tarikh_lapor', 'maklum_balas',
            DB::raw('ST_Y(lokasi_gps) as lat'), 
            DB::raw('ST_X(lokasi_gps) as lng')
        )
        ->with('pengguna:id,name,no_telefon') 
        ->orderBy('tarikh_lapor', 'desc')
        ->get();

        return response()->json($aduans);
    }

    public function updateStatusAduan(Request $request, $id_aduan)
    {
        if ($request->user()->peranan !== 'pentadbir') {
            return response()->json(['message' => 'Akses Ditolak'], 403);
        }

        // ✅ KEMAS KINI: Tambah validasi untuk membenarkan 'id_jabatan' diterima dari frontend
        $request->validate([
            'status' => 'required|string',
            'maklum_balas' => 'nullable|string',
            'id_jabatan' => 'nullable|string' // Boleh null jika status ditukar kepada 'Ditolak'
        ]);

        $aduan = Aduan::where('id_aduan', $id_aduan)->firstOrFail();
        
        // ✅ KEMAS KINI: Simpan nilai 'id_jabatan' ke dalam pangkalan data
        $aduan->update([
            'status' => $request->status,
            'maklum_balas' => $request->maklum_balas,
            'id_jabatan' => $request->id_jabatan
        ]);

        return response()->json(['message' => 'Aduan berjaya dikemaskini!', 'aduan' => $aduan]);
    }

    // --- 7. ADMIN & PEGAWAI: STATISTIK PAPAN PEMUKA KESELURUHAN ---
    public function getAdminDashboardStats(Request $request)
    {
        $peranan = $request->user()->peranan;
        
        // Hanya pentadbir dan pegawai boleh akses
        if (!in_array($peranan, ['pentadbir', 'pegawai'])) {
            return response()->json(['message' => 'Akses Ditolak'], 403);
        }

        // Kira statistik seluruh sistem BANDA+
        return response()->json([
            'jumlah_keseluruhan' => Aduan::count(),
            'baru' => Aduan::where('status', 'Baru')->count(),
            'diproses' => Aduan::where('status', 'Dalam Tindakan')->count(),
            'selesai' => Aduan::where('status', 'Selesai')->count(),
            'ditolak' => Aduan::where('status', 'Ditolak')->count(),
        ]);
    }
}