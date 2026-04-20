<?php

namespace App\Services;

class PriorityScoreService
{
    /**
     * Calculate Priority Score
     * Formula: Skor_Akhir = (S_AI * 0.5) + (S_Lokasi * 0.3) + (S_Kluster * 0.2)
     */
    public function calculateScore(string $jenisKerosakan): array
    {
        // 1. S_AI (AI Score replacement)
        $sAi = $this->getAiScore($jenisKerosakan);
        
        // 2. S_Lokasi (Mock for now, usually based on proximity to schools/hospitals)
        $sLokasi = 60; 
        
        // 3. S_Kluster (Mock for now, usually based on heatmap density)
        $sKluster = 50;

        $skorAkhir = ($sAi * 0.5) + ($sLokasi * 0.3) + ($sKluster * 0.2);

        return [
            'skor' => round($skorAkhir),
            'label' => $this->getLabel($skorAkhir)
        ];
    }

    private function getAiScore(string $jenisKerosakan): int
    {
        $highRisk = ['Jalan Berlubang', 'Pokok Tumbang', 'Tanah Runtuh', 'Paip Pecah'];
        $mediumRisk = ['Lampu Jalan', 'Longkang Tersumbat', 'Fasiliti Rosak'];
        $lowRisk = ['Kutipan Sampah', 'Rumput Panjang', 'Vandalisme'];

        if (in_array($jenisKerosakan, $highRisk)) return 95;
        if (in_array($jenisKerosakan, $mediumRisk)) return 70;
        if (in_array($jenisKerosakan, $lowRisk)) return 40;
        
        return 50;
    }

    private function getLabel(float $skor): string
    {
        if ($skor >= 80) return 'Tinggi';
        if ($skor >= 50) return 'Sederhana';
        return 'Rendah';
    }
}
