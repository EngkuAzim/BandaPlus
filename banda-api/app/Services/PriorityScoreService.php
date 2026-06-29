<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class PriorityScoreService
{
    /**
     * Calculate Priority Score
     * Formula: Skor_Akhir = (S_AI * 0.5) + (S_Lokasi * 0.3) + (S_Kluster * 0.2)
     */
    public function calculateScore(string $jenisKerosakan, ?float $lat = null, ?float $lng = null): array
    {
        // 1. S_AI (50%)
        $sAi = $this->getAiScore($jenisKerosakan);
        
        // 2. S_Lokasi (30%)
        $sLokasi = $this->getLokasiScore($lat, $lng);
        
        // 3. S_Kluster (20%)
        $sKluster = $this->getKlusterScore($jenisKerosakan, $lat, $lng);

        $skorAkhir = ($sAi * 0.5) + ($sLokasi * 0.3) + ($sKluster * 0.2);

        return [
            'skor' => round($skorAkhir),
            'label' => $this->getLabel($skorAkhir)
        ];
    }

    private function getAiScore(string $jenisKerosakan): int
    {
        $highRisk = ['Flash Flood', 'Flash_Flood', 'Pothole', 'Fallen Tree', 'Fallen_Tree'];
        $mediumRisk = ['Illegal Dumping', 'Illegal_Dumping', 'Trash In Drain', 'Trash_In_Drain'];
        
        if (in_array($jenisKerosakan, $highRisk)) return 100;
        if (in_array($jenisKerosakan, $mediumRisk)) return 70;
        
        return 40; // Fallback / Illegal_Ads
    }

    private function getLokasiScore(?float $lat, ?float $lng): int
    {
        if (!$lat || !$lng) return 40;

        // Fetch active POIs from DB with 5-min cache to avoid repeated queries
        $pois = \Illuminate\Support\Facades\Cache::remember('active_pois', 300, function () {
            return \App\Models\PointOfInterest::where('is_aktif', true)->get(['lat', 'lng']);
        });

        if ($pois->isEmpty()) return 40;

        $minDistance = PHP_FLOAT_MAX;
        foreach ($pois as $poi) {
            $distance = $this->haversine($lat, $lng, $poi->lat, $poi->lng);
            if ($distance < $minDistance) {
                $minDistance = $distance;
            }
        }

        if ($minDistance <= 500) return 100;
        if ($minDistance <= 1500) return 70;
        return 40;
    }

    private function getKlusterScore(string $jenisKerosakan, ?float $lat, ?float $lng): int
    {
        if (!$lat || !$lng) return 0;

        $radius = 500; // meters

        $sql = "
            SELECT COUNT(*) as cluster_count
            FROM aduans
            WHERE status IN ('Baru', 'Dalam Tindakan')
            AND jenis_kerosakan = ?
            AND lokasi_gps IS NOT NULL
            AND ( 6371000 * acos( cos( radians(?) ) *
              cos( radians( ST_Y(lokasi_gps) ) ) *
              cos( radians( ST_X(lokasi_gps) ) - radians(?) ) +
              sin( radians(?) ) *
              sin( radians( ST_Y(lokasi_gps) ) ) )
            ) <= ?
        ";

        $result = DB::select($sql, [$jenisKerosakan, $lat, $lng, $lat, $radius]);
        
        $count = !empty($result) ? $result[0]->cluster_count : 0;
        
        // Formula: (Count / 5) * 100
        $score = ($count / 5) * 100;
        
        return min(100, $score);
    }

    private function getLabel(float $skor): string
    {
        if ($skor >= 80) return 'SANGAT TINGGI';
        if ($skor >= 50) return 'SEDERHANA';
        return 'RENDAH';
    }

    private function haversine(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // meters
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }
}
