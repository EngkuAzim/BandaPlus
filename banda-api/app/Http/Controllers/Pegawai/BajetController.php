<?php

namespace App\Http\Controllers\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\ArahanKerja;
use App\Models\Jabatan;
use Illuminate\Http\Request;

class BajetController extends Controller
{
    /**
     * Return the budget summary and full transaction log for the
     * authenticated pegawai's jabatan.
     *
     * Route: GET /api/pegawai/bajet
     */
    public function index(Request $request)
    {
        $user    = $request->user();
        
        if (!$user->id_jabatan) {
            return response()->json(['message' => 'Akaun anda belum ditugaskan ke mana-mana jabatan. Sila hubungi Pentadbir.'], 400);
        }

        $jabatan = Jabatan::where('id_jabatan', $user->id_jabatan)->first();
        if (!$jabatan) {
            return response()->json(['message' => 'Maklumat jabatan tidak dijumpai dalam pangkalan data.'], 404);
        }

        // All arahan kerja for this jabatan = spending transactions
        $transaksi = ArahanKerja::with([
                'aduan:id_aduan,jenis_kerosakan,alamat_lokasi',
                'kontraktor:id,name,no_pengguna',
            ])
            ->where('id_jabatan', $jabatan->id_jabatan)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($ak) => [
                'id_arahan'            => $ak->id_arahan,
                'tarikh'               => $ak->created_at->format('d M Y'),
                'jenis_kerosakan'      => $ak->aduan->jenis_kerosakan  ?? '-',
                'alamat_lokasi'        => $ak->aduan->alamat_lokasi     ?? '-',
                'kontraktor'           => $ak->kontraktor->name         ?? '-',
                'no_pengguna_kontraktor' => $ak->kontraktor->no_pengguna ?? '-',
                'kos_anggaran'         => (float) $ak->kos_anggaran,
                'status_kerja'         => $ak->status_kerja,
            ]);

        $jumlah_dibelanjakan = $transaksi->sum('kos_anggaran');
        $peratus_penggunaan  = $jabatan->bajet_tahunan > 0
            ? round(($jumlah_dibelanjakan / $jabatan->bajet_tahunan) * 100, 1)
            : 0;

        return response()->json([
            'jabatan' => [
                'id_jabatan'    => $jabatan->id_jabatan,
                'nama_jabatan'  => $jabatan->nama_jabatan,
                'bajet_tahunan' => (float) $jabatan->bajet_tahunan,
                'baki_semasa'   => (float) $jabatan->baki_semasa,
            ],
            'ringkasan' => [
                'jumlah_dibelanjakan' => $jumlah_dibelanjakan,
                'peratus_penggunaan'  => $peratus_penggunaan,
                'bilangan_kerja'      => $transaksi->count(),
                'kerja_selesai'       => $transaksi->where('status_kerja', 'Selesai')->count(),
                'kerja_dalam_proses'  => $transaksi->where('status_kerja', 'Dalam Proses')->count(),
            ],
            'transaksi' => $transaksi->values(),
        ]);
    }
}
