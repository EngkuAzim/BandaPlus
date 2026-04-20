<?php

namespace App\Http\Controllers\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\ArahanKerja;
use App\Models\Aduan;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ArahanKerjaController extends Controller
{
    /**
     * Get all arahan kerja for pegawai's own jabatan.
     * Route: GET /api/pegawai/arahan-kerja
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = ArahanKerja::with([
                'aduan:id_aduan,jenis_kerosakan,alamat_lokasi,gambar_bukti,id_zon',
                'kontraktor:id,name',
                'jabatan:id_jabatan,nama_jabatan',
            ])
            ->orderBy('created_at', 'desc');

        // Filter by pegawai's jabatan
        if ($user->peranan === 'pegawai' && $user->id_jabatan) {
            $query->where('id_jabatan', $user->id_jabatan);
        }

        return response()->json($query->get());
    }

    /**
     * Get aduan assigned to pegawai's jabatan that DO NOT have an arahan kerja yet.
     * This replaces the broken status==='Baru' filter in ArahanKerja.jsx.
     * Route: GET /api/pegawai/aduan-pending
     */
    public function pendingAduan(Request $request)
    {
        $user = $request->user();

        // IDs of aduan that already have arahan kerja
        $sudahAda = ArahanKerja::pluck('id_aduan')->toArray();

        $query = Aduan::select(
                'id_aduan', 'id_jabatan', 'jenis_kerosakan',
                'alamat_lokasi', 'gambar_bukti', 'status', 'tarikh_lapor'
            )
            ->whereNotIn('id_aduan', $sudahAda)
            ->whereIn('status', ['Baru', 'Dalam Tindakan'])  // aduan yang sedang aktif
            ->orderBy('tarikh_lapor', 'desc');

        // Scope to pegawai's jabatan only
        if ($user->peranan === 'pegawai' && $user->id_jabatan) {
            $query->where('id_jabatan', $user->id_jabatan);
        }

        return response()->json($query->get());
    }

    /**
     * Get list of real contractors for the assignment form.
     * Route: GET /api/pegawai/kontraktor-list
     */
    public function getKontraktorList()
    {
        $kontraktors = \App\Models\User::select('id', 'name', 'no_pengguna')
            ->where('peranan', 'kontraktor')
            ->get();
        return response()->json($kontraktors);
    }

    /**
     * Assign a kontraktor to an aduan (creates arahan kerja).
     * Route: PUT /api/pegawai/aduan/{id_aduan}/tugaskan
     */
    public function tugaskan(Request $request, string $id_aduan)
    {
        $user = $request->user();

        $request->validate([
            'id_kontraktor'        => 'required|exists:users,id',
            'tarikh_jangkaan_siap' => 'required|date|after:today',
            'nota_pegawai'         => 'nullable|string|max:1000',
            'kos_anggaran'         => 'required|numeric|min:0',
        ]);

        $aduan = Aduan::where('id_aduan', $id_aduan)->firstOrFail();

        // Ensure the pegawai can only assign to aduan belonging to their department
        if ($user->peranan === 'pegawai' && $user->id_jabatan) {
            if ($aduan->id_jabatan !== $user->id_jabatan) {
                return response()->json(['message' => 'Anda tidak mempunyai akses ke aduan ini.'], 403);
            }
        }

        // Deduct from budget logic
        if ($aduan->id_jabatan) {
            $jabatan = \App\Models\Jabatan::where('id_jabatan', $aduan->id_jabatan)->first();
            if ($jabatan) {
                if ($jabatan->baki_semasa < $request->kos_anggaran) {
                    return response()->json([
                        'message' => 'Baki jabatan tidak mencukupi untuk kos kerja ini.'
                    ], 400); // 400 Bad Request
                }
                $jabatan->baki_semasa -= $request->kos_anggaran;
                $jabatan->save();
            }
        }

        // Generate AK ID: AK-2026-001
        $year = Carbon::now()->format('Y');
        $last = ArahanKerja::where('id_arahan', 'like', "AK-{$year}-%")
                            ->orderBy('id_arahan', 'desc')
                            ->first();
        $num  = $last
            ? str_pad(intval(substr($last->id_arahan, -3)) + 1, 3, '0', STR_PAD_LEFT)
            : '001';

        $arahan = ArahanKerja::create([
            'id_arahan'            => "AK-{$year}-{$num}",
            'id_aduan'             => $id_aduan,
            'id_kontraktor'        => $request->id_kontraktor,
            'id_jabatan'           => $aduan->id_jabatan,
            'kos_anggaran'         => $request->kos_anggaran,
            'tarikh_jangkaan_siap' => $request->tarikh_jangkaan_siap,
            'nota_pegawai'         => $request->nota_pegawai,
            'status_kerja'         => 'Dalam Proses',
        ]);

        // Update parent aduan status
        $aduan->update(['status' => 'Dalam Tindakan']);

        return response()->json([
            'message' => 'Arahan kerja berjaya dikeluarkan.',
            'arahan'  => $arahan
        ], 201);
    }

    /**
     * Tambah log / komen dari Pegawai
     * Route: POST /api/pegawai/arahan-kerja/{id}/log
     */
    public function tambahLog(Request $request, string $id)
    {
        $request->validate([
            'nota' => 'required|string|max:1000',
        ]);

        $arahan = ArahanKerja::where('id_arahan', $id)->firstOrFail();
        $logs = $arahan->log_kemajuan ?? [];
        
        $logs[] = [
            'tarikh' => now()->toIso8601String(),
            'nota'   => $request->nota,
            'role'   => 'pegawai'
        ];

        $arahan->update(['log_kemajuan' => $logs]);

        return response()->json([
            'message' => 'Komen berjaya ditambah.',
            'log_kemajuan' => $logs
        ]);
    }

    /**
     * Sahkan kerja oleh Pegawai (Validation workflow)
     * Route: PUT /api/pegawai/arahan-kerja/{id}/sahkan
     */
    public function sahkan(Request $request, string $id)
    {
        $request->validate([
            'lawatan_tapak' => 'required|boolean',
            'spesifikasi'   => 'required|boolean',
            'catatan'       => 'nullable|string|max:1000',
        ]);

        if (!$request->lawatan_tapak && !$request->spesifikasi) {
            return response()->json(['message' => 'Sila buat pengesahan sebelum menutup kes.'], 400);
        }

        $arahan = ArahanKerja::where('id_arahan', $id)->firstOrFail();
        
        // Log pengesahan
        $logs = $arahan->log_kemajuan ?? [];
        $notaPengesahan = "Kerja telah disemak dan DISAHKAN oleh Pegawai.";
        if ($request->catatan) {
            $notaPengesahan .= " Catatan: " . $request->catatan;
        }

        $logs[] = [
            'tarikh' => now()->toIso8601String(),
            'nota'   => $notaPengesahan,
            'role'   => 'pegawai',
            'tindakan' => 'pengesahan'
        ];

        $arahan->update([
            'status_kerja' => 'Disahkan',
            'log_kemajuan' => $logs
        ]);

        // Tutup Aduan Induk
        $arahan->aduan()->update(['status' => 'Selesai']);

        return response()->json([
            'message' => 'Kerja pembaikan telah disahkan dan aduan ditutup.',
            'arahan'  => $arahan
        ]);
    }
}
