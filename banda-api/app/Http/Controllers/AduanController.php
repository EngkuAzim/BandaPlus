<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Aduan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB; // Needed for raw spatial queries

class AduanController extends Controller
{
    // --- 1. A helper function to auto-detect MPAJ zones based on coordinates ---
    private function autoDetectZone($lat, $lng)
    {
        if (!$lat || !$lng) return null;

        // Note: This is a placeholder algorithm. 
        // In reality, MPAJ has 24 zones. You can adjust these coordinates later.
        if ($lat > 3.1500 && $lng < 101.7600) {
            return 1; // e.g., Zon 1 (Taman Melawati)
        } elseif ($lat <= 3.1500 && $lng > 101.7500) {
            return 2; // e.g., Zon 2 (Ampang Jaya)
        } else {
            return 3; // e.g., Zon 3 (Pandan Indah)
        }
    }

    // --- 2. FUNCTION TO SAVE NEW ADUAN ---
    public function store(Request $request)
    {
        $request->validate([
            'jenis_kerosakan' => 'required|string|max:255',
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

        // --- NEW: AUTO-ZONING & SPATIAL DATA ---
        $lat = $request->input('lat');
        $lng = $request->input('lng');
        
        $zon_id = $this->autoDetectZone($lat, $lng);
        
        // MySQL requires Longitude first, then Latitude for ST_PointFromText
        $lokasi_gps = ($lat && $lng) ? DB::raw("ST_PointFromText('POINT({$lng} {$lat})')") : null;

        $aduan = Aduan::create([
            'id_aduan' => $id_aduan,
            'id_pengguna' => $request->user()->id,
            'id_zon' => $zon_id, // Auto-Assigned Zone!
            'jenis_kerosakan' => $request->jenis_kerosakan,
            'alamat_lokasi' => $request->alamat_lokasi,
            'keterangan_aduan' => $request->keterangan_aduan,
            'lokasi_gps' => $lokasi_gps, // Saved as a spatial point!
            'gambar_bukti' => $imagePath,
            'status' => 'Baru'
        ]);

        return response()->json([
            'message' => 'Aduan berjaya dihantar!',
            'aduan' => $aduan
        ], 201);
    }

    // --- 3. FUNCTION TO GET DASHBOARD STATS ---
    public function getStats(Request $request)
    {
        $userId = $request->user()->id;

        // Count how many aduan this user has in each category
        $baru = Aduan::where('id_pengguna', $userId)->where('status', 'Baru')->count();
        $diproses = Aduan::where('id_pengguna', $userId)->where('status', 'Dalam Tindakan')->count();
        $selesai = Aduan::where('id_pengguna', $userId)->where('status', 'Selesai')->count();

        return response()->json([
            'baru' => $baru,
            'diproses' => $diproses,
            'selesai' => $selesai
        ]);
    }
}