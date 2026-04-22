<?php

namespace App\Http\Controllers\Komuniti;

use App\Http\Controllers\Controller;
use App\Models\Aduan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\PriorityScoreService;
use App\Services\JabatanMappingService;
use App\Services\ClusteringService;

class AduanController extends Controller
{
    /**
     * Submit a new aduan (komuniti).
     * Route: POST /api/aduan
     */
    public function store(Request $request)
    {
        $request->validate([
            'jenis_kerosakan'  => 'required|string|max:255',
            'id_zon'           => 'required|integer',
            'alamat_lokasi'    => 'required|string|max:255',
            'keterangan_aduan' => 'nullable|string',
            'gambar_bukti'     => 'required|image|mimes:jpeg,png,jpg|max:5048',
        ]);

        $imagePath = $request->file('gambar_bukti')->store('aduan_images', 'public');

        // Generate Custom Primary Key (ADU-2026-0001)
        $year      = Carbon::now()->format('Y');
        $lastAduan = Aduan::where('id_aduan', 'like', "ADU-{$year}-%")
                          ->orderBy('id_aduan', 'desc')
                          ->first();
        $newNumber = $lastAduan
            ? str_pad(intval(substr($lastAduan->id_aduan, -4)) + 1, 4, '0', STR_PAD_LEFT)
            : '0001';
        $id_aduan  = "ADU-{$year}-{$newNumber}";

        $lat       = $request->input('lat');
        $lng       = $request->input('lng');
        $lokasi_gps = ($lat && $lng)
            ? DB::raw("ST_PointFromText('POINT({$lng} {$lat})')")
            : null;

        // Calculate Priority Score
        $priorityService = new PriorityScoreService();
        $priorityResult = $priorityService->calculateScore($request->jenis_kerosakan);

        // Suggest Jabatan
        $jabatanService = new JabatanMappingService();
        $suggestedJabatan = $jabatanService->suggest($request->jenis_kerosakan);

        // Check for spatial clustering (Radius 20m)
        $clusteringService = new ClusteringService();
        $id_aduan_induk = null;
        if ($lat && $lng) {
            $id_aduan_induk = $clusteringService->findParentCluster(
                (float) $lat, 
                (float) $lng, 
                $request->jenis_kerosakan
            );
        }

        $aduan = Aduan::create([
            'id_aduan'         => $id_aduan,
            'id_pengguna'      => $request->user()->id,
            'id_zon'           => $request->id_zon,
            'id_jabatan'       => $suggestedJabatan === 'J00' ? null : $suggestedJabatan,
            'jenis_kerosakan'  => $request->jenis_kerosakan,
            'alamat_lokasi'    => $request->alamat_lokasi,
            'keterangan_aduan' => $request->keterangan_aduan,
            'lokasi_gps'       => $lokasi_gps,
            'gambar_bukti'     => $imagePath,
            'status'           => 'Baru',
            'skor_ai'          => $priorityResult['skor'],
            'label_prioriti'   => $priorityResult['label'],
            'id_aduan_induk'   => $id_aduan_induk,
        ]);

        return response()->json([
            'message' => 'Aduan berjaya dihantar!',
            'aduan'   => $aduan
        ], 201);
    }

    /**
     * Get stats for the logged-in komuniti user's own aduan.
     * Route: GET /api/dashboard/stats
     */
    public function getStats(Request $request)
    {
        $userId = $request->user()->id;

        return response()->json([
            'baru'     => Aduan::where('id_pengguna', $userId)->where('status', 'Baru')->count(),
            'diproses' => Aduan::where('id_pengguna', $userId)->where('status', 'Dalam Tindakan')->count(),
            'selesai'  => Aduan::where('id_pengguna', $userId)->where('status', 'Selesai')->count(),
        ]);
    }

    /**
     * Get all aduan submitted by the logged-in user.
     * Route: GET /api/aduan
     */
    public function getUserAduan(Request $request)
    {
        $aduans = Aduan::select('id_aduan', 'jenis_kerosakan', 'gambar_bukti', 'alamat_lokasi', 'status', 'tarikh_lapor')
                       ->where('id_pengguna', $request->user()->id)
                       ->orderBy('tarikh_lapor', 'desc')
                       ->get();

        return response()->json($aduans);
    }
}
