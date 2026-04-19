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
                'aduan:id_aduan,jenis_kerosakan,alamat_lokasi,gambar_bukti'
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
        ]);

        $arahan = ArahanKerja::where('id_arahan', $id)
            ->where('id_kontraktor', $request->user()->id)
            ->firstOrFail();

        $path = $request->file('gambar_selepas')->store('bukti_kerja', 'public');
        $arahan->update(['gambar_selepas' => $path]);

        return response()->json([
            'message' => 'Bukti pembaikan berjaya dimuat naik.',
            'path'    => $path
        ]);
    }
}
