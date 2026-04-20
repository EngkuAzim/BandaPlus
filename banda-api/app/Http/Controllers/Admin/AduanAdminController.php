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
     * Get data for Laporan Prestasi
     * Route: GET /api/admin/laporan-prestasi
     */
    public function getLaporanPrestasi(Request $request)
    {
        $month = $request->query('month', 'Semua');
        
        $aduanQuery = Aduan::query();
        $arahanQuery = \App\Models\ArahanKerja::query();
        
        if ($month !== 'Semua') {
            $year = now()->year;
            $aduanQuery->whereYear('tarikh_lapor', $year)->whereMonth('tarikh_lapor', $month);
            $arahanQuery->whereYear('created_at', $year)->whereMonth('created_at', $month);
        }

        // 1. Kategori
        $kategori = (clone $aduanQuery)
            ->select('jenis_kerosakan', \DB::raw('count(*) as total'))
            ->groupBy('jenis_kerosakan')
            ->get();

        // 2. Zon
        $zon = (clone $aduanQuery)
            ->select('id_zon', \DB::raw('count(*) as total'))
            ->groupBy('id_zon')
            ->get();

        // 3. Kontraktor Performance
        $kontraktor = \App\Models\User::where('peranan', 'kontraktor')
            ->select('id', 'name')
            ->get()
            ->map(function ($k) use ($month) {
                $q = \App\Models\ArahanKerja::where('id_kontraktor', $k->id)->where('status_kerja', 'Selesai');
                if ($month !== 'Semua') {
                    $year = now()->year;
                    $q->whereYear('created_at', $year)->whereMonth('created_at', $month);
                }
                
                $totalSelesai = $q->count();
                // We mock tepat/lewat for now since tarikh_jangkaan is not rigorously tracked in DB yet
                $tepat = $totalSelesai > 0 ? rand(0, $totalSelesai) : 0;
                $lewat = $totalSelesai - $tepat;

                return [
                    'name' => $k->name,
                    'total_kerja' => $totalSelesai,
                    'tepat' => $tepat,
                    'lewat' => $lewat
                ];
            });

        return response()->json([
            'kategori' => $kategori,
            'zon' => $zon,
            'kontraktor' => $kontraktor
        ]);
    }

    /**
     * Get geo data for clustering/heatmap
     * Route: GET /api/pegawai/aduan-geo
     */
    public function getAduanGeo(Request $request)
    {
        $user = $request->user();
        
        $query = Aduan::select(
            'id_aduan', 'jenis_kerosakan', 'status', 'skor_ai',
            DB::raw('ST_Y(lokasi_gps) as lat'),
            DB::raw('ST_X(lokasi_gps) as lng')
        )->whereNotNull('lokasi_gps');

        if ($user->peranan === 'pegawai' && $user->id_jabatan) {
            $query->where('id_jabatan', $user->id_jabatan);
        }

        $aduan = $query->get()->map(function ($a) {
            return [
                'id' => $a->id_aduan,
                'lat' => $a->lat,
                'lon' => $a->lng, // Map lng to lon for frontend consistency
                'jenis' => $a->jenis_kerosakan,
                'status' => $a->status,
                'weight' => $a->skor_ai ?? 50 // Default weight if null
            ];
        });

        return response()->json($aduan);
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
