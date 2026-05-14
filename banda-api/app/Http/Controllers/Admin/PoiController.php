<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PointOfInterest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PoiController extends Controller
{
    /**
     * List all POIs.
     * Route: GET /api/admin/pois
     */
    public function index()
    {
        $pois = PointOfInterest::orderBy('kategori')->orderBy('nama')->get();
        return response()->json($pois);
    }

    /**
     * Create a new POI.
     * Route: POST /api/admin/pois
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama'     => 'required|string|max:255',
            'kategori' => 'required|in:hospital,balai_polis,sekolah,bomba,lain',
            'lat'      => 'required|numeric|between:-90,90',
            'lng'      => 'required|numeric|between:-180,180',
        ]);

        $poi = PointOfInterest::create([
            'nama'     => $request->nama,
            'kategori' => $request->kategori,
            'lat'      => $request->lat,
            'lng'      => $request->lng,
            'is_aktif' => true,
        ]);

        Cache::forget('active_pois');

        return response()->json([
            'message' => "POI '{$poi->nama}' berjaya ditambah.",
            'poi'     => $poi,
        ], 201);
    }

    /**
     * Toggle active status.
     * Route: PATCH /api/admin/pois/{poi}/toggle
     */
    public function toggle(PointOfInterest $poi)
    {
        $poi->update(['is_aktif' => !$poi->is_aktif]);
        Cache::forget('active_pois');

        return response()->json([
            'message'  => $poi->is_aktif ? "POI '{$poi->nama}' telah diaktifkan." : "POI '{$poi->nama}' telah dinyahaktifkan.",
            'is_aktif' => $poi->is_aktif,
        ]);
    }

    /**
     * Delete a POI permanently.
     * Route: DELETE /api/admin/pois/{poi}
     */
    public function destroy(PointOfInterest $poi)
    {
        $nama = $poi->nama;
        $poi->delete();
        Cache::forget('active_pois');

        return response()->json(['message' => "POI '{$nama}' berjaya dipadam."]);
    }
}
