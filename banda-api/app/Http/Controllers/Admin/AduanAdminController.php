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
                'id_aduan', 'id_pengguna', 'id_zon', 'id_jabatan', 'id_aduan_induk',
                'jenis_kerosakan', 'gambar_bukti', 'keterangan_aduan',
                'alamat_lokasi', 'status', 'tarikh_lapor', 'maklum_balas',
                'skor_ai', 'label_prioriti', 'ai_predictions',
                DB::raw('ST_Y(lokasi_gps) as lat'),
                DB::raw('ST_X(lokasi_gps) as lng')
            )
            ->withCount('anakAduan')
            ->with(['anakAduan' => function($q) {
                $q->select('id_aduan', 'id_aduan_induk', 'jenis_kerosakan', 'alamat_lokasi', 'status', 'tarikh_lapor', 'skor_ai', 'label_prioriti', 'ai_predictions');
            }])
            ->with('pengguna:id,name,no_telefon')
            ->orderBy('tarikh_lapor', 'desc');

        // Pegawai hanya boleh lihat aduan dari jabatan mereka dan disembunyikan aduan anak
        if ($user->peranan === 'pegawai') {
            $query->whereNull('id_aduan_induk'); // Jangan tunjuk aduan anak kepada pegawai
            if ($user->id_jabatan) {
                $query->where('id_jabatan', $user->id_jabatan);
            }
        }

        return response()->json($query->paginate(20));
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
            ->orderByDesc('total')
            ->get();

        // 2. Zon
        $zon = (clone $aduanQuery)
            ->select('id_zon', \DB::raw('count(*) as total'))
            ->whereNotNull('id_zon')
            ->groupBy('id_zon')
            ->orderByDesc('total')
            ->get();

        // 3. Kontraktor Performance (real tepat/lewat)
        $kontraktor = \App\Models\User::where('peranan', 'kontraktor')
            ->select('id', 'name')
            ->get()
            ->map(function ($k) use ($month) {
                $baseQ = \App\Models\ArahanKerja::where('id_kontraktor', $k->id);
                if ($month !== 'Semua') {
                    $year = now()->year;
                    $baseQ->whereYear('created_at', $year)->whereMonth('created_at', $month);
                }
                $jumlah = (clone $baseQ)->count();
                $selesai = (clone $baseQ)->whereIn('status_kerja', ['Selesai', 'Disahkan'])->count();
                $dalamProses = (clone $baseQ)->where('status_kerja', 'Dalam Proses')->count();
                // Tepat = finished before/on due date, Lewat = finished after due date
                $tepat = (clone $baseQ)->whereIn('status_kerja', ['Selesai', 'Disahkan'])
                    ->whereNotNull('tarikh_jangkaan_siap')
                    ->whereColumn('updated_at', '<=', 'tarikh_jangkaan_siap')
                    ->count();
                $lewat = $selesai - $tepat;
                if ($lewat < 0) $lewat = 0;

                return [
                    'name'          => $k->name,
                    'jumlah'        => $jumlah,
                    'total_kerja'   => $selesai,
                    'dalam_proses'  => $dalamProses,
                    'tepat'         => $tepat,
                    'lewat'         => $lewat
                ];
            });

        // 4. Ringkasan / Summary
        $jumlah = (clone $aduanQuery)->count();
        $baru = (clone $aduanQuery)->where('status', 'Baru')->count();
        $dalamTindakan = (clone $aduanQuery)->where('status', 'Dalam Tindakan')->count();
        $selesai = (clone $aduanQuery)->where('status', 'Selesai')->count();
        $ditolak = (clone $aduanQuery)->where('status', 'Ditolak')->count();
        $kluster = (clone $aduanQuery)->whereNotNull('id_aduan_induk')->count();

        // 5. Trend Bulanan (Last 12 months)
        $now = CarbonImmutable::now();
        $trendBulanan = [];
        for ($i = 11; $i >= 0; $i--) {
            $d = $now->subMonths($i);
            $bulanAduan = Aduan::whereMonth('tarikh_lapor', $d->month)->whereYear('tarikh_lapor', $d->year)->count();
            $bulanSelesai = Aduan::where('status', 'Selesai')->whereMonth('tarikh_lapor', $d->month)->whereYear('tarikh_lapor', $d->year)->count();
            $trendBulanan[] = [
                'name'    => $d->format('M Y'),
                'aduan'   => $bulanAduan,
                'selesai' => $bulanSelesai
            ];
        }

        // 6. Status Distribution for pie chart
        $statusDistribusi = [
            ['name' => 'Baru',             'value' => $baru],
            ['name' => 'Dalam Tindakan',   'value' => $dalamTindakan],
            ['name' => 'Selesai',          'value' => $selesai],
            ['name' => 'Ditolak',          'value' => $ditolak],
        ];

        return response()->json([
            'kategori'          => $kategori,
            'zon'               => $zon,
            'kontraktor'        => $kontraktor,
            'ringkasan'         => [
                'jumlah'        => $jumlah,
                'baru'          => $baru,
                'dalam_tindakan'=> $dalamTindakan,
                'selesai'       => $selesai,
                'ditolak'       => $ditolak,
                'kluster'       => $kluster,
            ],
            'trend_bulanan'     => $trendBulanan,
            'status_distribusi' => $statusDistribusi,
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
            'id_aduan', 'jenis_kerosakan', 'status', 'skor_ai', 'id_aduan_induk', 'alamat_lokasi', 'gambar_bukti', 'label_prioriti',
            DB::raw('ST_Y(lokasi_gps) as lat'),
            DB::raw('ST_X(lokasi_gps) as lng')
        )
        ->withCount('anakAduan')
        ->with(['anakAduan' => function($q) {
            $q->select('id_aduan', 'id_aduan_induk', 'jenis_kerosakan', 'status', 'label_prioriti', 'alamat_lokasi');
        }])
        ->whereNotNull('lokasi_gps')
        ->whereNull('id_aduan_induk'); // Hanya ambil parent

        if ($user->peranan === 'pegawai' && $user->id_jabatan) {
            $query->where('id_jabatan', $user->id_jabatan);
        }

        $aduan = $query->get()->map(function ($a) {
            return [
                'id' => $a->id_aduan,
                'lat' => $a->lat,
                'lon' => $a->lng,
                'jenis' => $a->jenis_kerosakan,
                'status' => $a->status,
                'weight' => $a->skor_ai ?? 50,
                'gambar_bukti' => $a->gambar_bukti,
                'anak_aduan_count' => $a->anak_aduan_count,
                'anak_aduan' => $a->anakAduan,
                'label_prioriti' => $a->label_prioriti,
                'alamat_lokasi' => $a->alamat_lokasi
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

        // Analytics: Trend Bulanan (Last 6 Months)
        $trendBulanan = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = $now->subMonths($i);
            $count = (clone $base())
                ->whereMonth('tarikh_lapor', $monthDate->month)
                ->whereYear('tarikh_lapor', $monthDate->year)
                ->count();
            $trendBulanan[] = [
                'name' => $monthDate->format('M'),
                'jumlah' => $count
            ];
        }

        // Analytics: Taburan Jenis Kerosakan
        $taburanKerosakan = (clone $base())
            ->selectRaw('jenis_kerosakan as name, count(*) as value')
            ->groupBy('jenis_kerosakan')
            ->orderByDesc('value')
            ->limit(5)
            ->get();

        // Analytics: Taburan Zon
        $taburanZon = (clone $base())
            ->selectRaw('id_zon as name, count(*) as value')
            ->whereNotNull('id_zon')
            ->groupBy('id_zon')
            ->orderByDesc('value')
            ->limit(5)
            ->get();

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

            // New Analytics Data
            'trend_bulanan'      => $trendBulanan,
            'taburan_kerosakan'  => $taburanKerosakan,
            'taburan_zon'        => $taburanZon,
        ]);
    }
}
