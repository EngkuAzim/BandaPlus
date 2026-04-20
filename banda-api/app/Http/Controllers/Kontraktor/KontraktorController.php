<?php

namespace App\Http\Controllers\Kontraktor;

use App\Http\Controllers\Controller;
use App\Models\ArahanKerja;
use Illuminate\Http\Request;

class KontraktorController extends Controller
{
    /**
     * Dashboard stats for the logged-in kontraktor.
     * Route: GET /api/kontraktor/dashboard/stats
     */
    public function getStats(Request $request)
    {
        $userId = $request->user()->id;

        return response()->json([
            'tugasan_baru'    => ArahanKerja::where('id_kontraktor', $userId)
                                             ->where('status_kerja', 'Dalam Proses')
                                             ->count(),
            'tugasan_selesai' => ArahanKerja::where('id_kontraktor', $userId)
                                             ->where('status_kerja', 'Selesai')
                                             ->count(),
        ]);
    }

    /**
     * List all work orders assigned to this kontraktor.
     * Route: GET /api/kontraktor/tugasan
     */
    public function getTugasan(Request $request)
    {
        $tugasan = ArahanKerja::with([
                'aduan:id_aduan,jenis_kerosakan,keterangan_aduan,alamat_lokasi,id_zon,gambar_bukti'
            ])
            ->where('id_kontraktor', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tugasan);
    }

    /**
     * Update the status of an assigned work order.
     * Route: PUT /api/kontraktor/tugasan/{id}
     */
    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status_kerja'    => 'required|in:Dalam Proses,Selesai',
            'nota_kontraktor' => 'nullable|string|max:1000',
        ]);

        $arahan = ArahanKerja::where('id_arahan', $id)
            ->where('id_kontraktor', $request->user()->id)
            ->firstOrFail();

        $arahan->update($request->only('status_kerja', 'nota_kontraktor'));

        // If selesai, cascade to parent aduan
        if ($request->status_kerja === 'Selesai') {
            $arahan->aduan()->update(['status' => 'Selesai']);
        }

        return response()->json([
            'message' => 'Status kerja dikemaskini.',
            'arahan'  => $arahan
        ]);
    }

    /**
     * Upload bukti selepas pembaikan (geo-fencing enforced on frontend).
     * Route: POST /api/kontraktor/tugasan/{id}/bukti
     */
    public function uploadBukti(Request $request, string $id)
    {
        $request->validate([
            'gambar_selepas' => 'required|image|mimes:jpeg,png,jpg|max:5048',
            'lat_kontraktor' => 'required|numeric',
            'lon_kontraktor' => 'required|numeric',
        ]);

        $arahan = ArahanKerja::where('id_arahan', $id)
            ->where('id_kontraktor', $request->user()->id)
            ->firstOrFail();

        // Validate 50m radius
        $aduan = \App\Models\Aduan::selectRaw("id_aduan, ST_Y(lokasi_gps) as lat, ST_X(lokasi_gps) as lon")
            ->where('id_aduan', $arahan->id_aduan)
            ->first();

        if ($aduan && $aduan->lat && $aduan->lon) {
            $jarak = $this->haversineDistance(
                (float) $request->lat_kontraktor, 
                (float) $request->lon_kontraktor, 
                (float) $aduan->lat, 
                (float) $aduan->lon
            );

            if ($jarak > 20000000) { // SEMENTARA: Ditukar kepada 20,000,000m (20,000km) untuk tujuan testing dari seluruh dunia. Tukar balik ke 50 (50m) untuk production.
                return response()->json(['message' => 'Lokasi tidak sah (lebih daripada 50m dari lokasi aduan)'], 422);
            }
        }

        $path = $request->file('gambar_selepas')->store('bukti_kerja', 'public');
        $arahan->update(['gambar_selepas' => $path]);

        return response()->json([
            'message' => 'Bukti pembaikan berjaya dimuat naik.',
            'path'    => $path
        ]);
    }

    /**
     * Tambah log kemajuan kerja (Timeline update)
     * Route: POST /api/kontraktor/tugasan/{id}/log
     */
    public function tambahLog(Request $request, string $id)
    {
        $request->validate([
            'nota' => 'required|string|max:1000',
            'audio' => 'nullable|file|mimes:webm,ogg,mp3,wav,m4a,aac,mp4|max:10240', // Support voice memo
        ]);

        $arahan = ArahanKerja::where('id_arahan', $id)
            ->where('id_kontraktor', $request->user()->id)
            ->firstOrFail();

        $logs = $arahan->log_kemajuan ?? [];
        
        $audioPath = null;
        if ($request->hasFile('audio')) {
            $audioPath = $request->file('audio')->store('bukti_audio', 'public');
        }

        $logs[] = [
            'tarikh' => now()->toIso8601String(),
            'nota'   => $request->nota,
            'audio'  => $audioPath
        ];

        $arahan->update(['log_kemajuan' => $logs]);

        return response()->json([
            'message' => 'Log kemajuan berjaya ditambah.',
            'log_kemajuan' => $logs
        ]);
    }

    /**
     * Calculate distance between two coordinates in meters
     */
    private function haversineDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // in meters
        
        $lat1 = deg2rad($lat1);
        $lon1 = deg2rad($lon1);
        $lat2 = deg2rad($lat2);
        $lon2 = deg2rad($lon2);

        $dLat = $lat2 - $lat1;
        $dLon = $lon2 - $lon1;

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos($lat1) * cos($lat2) *
             sin($dLon / 2) * sin($dLon / 2);
             
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }
}
