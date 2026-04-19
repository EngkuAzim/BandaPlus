<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aduan;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AduanAdminController extends Controller
{
    /**
     * Get aduan list.
     * - Pentadbir  → semua aduan
     * - Pegawai    → hanya aduan yang id_jabatan sepadan dengan jabatan pegawai itu
     *
     * Route: GET /api/admin/aduan   (pentadbir)
     * Route: GET /api/pegawai/aduan (pegawai)
     */
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Aduan::select(
                'id_aduan', 'id_pengguna', 'id_zon', 'id_jabatan',
                'jenis_kerosakan', 'gambar_bukti', 'keterangan_aduan',
                'alamat_lokasi', 'status', 'tarikh_lapor', 'maklum_balas',
                DB::raw('ST_Y(lokasi_gps) as lat'),
                DB::raw('ST_X(lokasi_gps) as lng')
            )
            ->with('pengguna:id,name,no_telefon')
            ->orderBy('tarikh_lapor', 'desc');

        // Pegawai hanya boleh lihat aduan dari jabatan mereka
        if ($user->peranan === 'pegawai' && $user->id_jabatan) {
            $query->where('id_jabatan', $user->id_jabatan);
        }

        return response()->json($query->get());
    }

    /**
     * Update status and maklum balas of an aduan.
     * Route: PUT /api/admin/aduan/{id}
     */
    public function updateStatus(Request $request, $id_aduan)
    {
        $request->validate([
            'status'       => 'required|in:Baru,Dalam Tindakan,Selesai,Ditolak',
            'maklum_balas' => 'nullable|string|max:2000',
            'id_jabatan'   => 'nullable|string|exists:jabatans,id_jabatan',
        ]);

        $aduan = Aduan::where('id_aduan', $id_aduan)->firstOrFail();

        $aduan->update([
            'status'       => $request->status,
            'maklum_balas' => $request->maklum_balas,
            'id_jabatan'   => $request->id_jabatan,
        ]);

        return response()->json([
            'message' => 'Aduan berjaya dikemaskini!',
            'aduan'   => $aduan
        ]);
    }

    /**
     * Dashboard statistics.
     * - Pentadbir → stat keseluruhan sistem
     * - Pegawai   → stat hanya untuk jabatan mereka
     *
     * Route: GET /api/admin/dashboard/stats   (pentadbir)
     * Route: GET /api/pegawai/dashboard/stats (pegawai)
     */
    public function getStats(Request $request)
    {
        $user      = $request->user();
        $isPegawai = $user->peranan === 'pegawai' && $user->id_jabatan;

        $now           = CarbonImmutable::now();
        $lastMonthDate = $now->subMonth();

        // Base query — scoped to jabatan if pegawai, else everything
        $base = function () use ($user, $isPegawai) {
            $q = Aduan::query();
            if ($isPegawai) {
                $q->where('id_jabatan', $user->id_jabatan);
            }
            return $q;
        };

        $getChange = function (string $status) use ($now, $lastMonthDate, $base) {
            $query = $base();
            if ($status !== 'semua') {
                $query->where('status', $status);
            }

            $current  = (clone $query)
                ->whereMonth('tarikh_lapor', $now->month)
                ->whereYear('tarikh_lapor',  $now->year)
                ->count();

            $previous = (clone $query)
                ->whereMonth('tarikh_lapor', $lastMonthDate->month)
                ->whereYear('tarikh_lapor',  $lastMonthDate->year)
                ->count();

            if ($previous === 0) {
                return $current > 0 ? 100 : 0;
            }
            return round((($current - $previous) / $previous) * 100);
        };

        return response()->json([
            'jumlah_keseluruhan' => $base()->count(),
            'perubahan_jumlah'   => $getChange('semua'),

            'baru'               => $base()->where('status', 'Baru')->count(),
            'perubahan_baru'     => $getChange('Baru'),

            'diproses'           => $base()->where('status', 'Dalam Tindakan')->count(),
            'perubahan_diproses' => $getChange('Dalam Tindakan'),

            'selesai'            => $base()->where('status', 'Selesai')->count(),
            'perubahan_selesai'  => $getChange('Selesai'),

            'ditolak'            => $base()->where('status', 'Ditolak')->count(),
        ]);
    }
}
