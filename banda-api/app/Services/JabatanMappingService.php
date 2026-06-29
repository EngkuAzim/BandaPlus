<?php

namespace App\Services;

class JabatanMappingService
{
    /**
     * Map a single AI label to Jabatan, SLA, and Tempoh
     */
    public function mapLabel(?string $label): array
    {
        $map = [
            // English / Raw YOLOv8 labels
            'Pothole'         => ['id' => 'J01', 'sla' => 'Keutamaan 1 (Kritikal)', 'tempoh' => '24 Jam - 3 Hari'],
            'Flash Flood'     => ['id' => 'J01', 'sla' => 'Keutamaan 1 (Kecemasan)', 'tempoh' => 'Serta-merta / 1 Jam'],
            'Trash In Drain'  => ['id' => 'J01', 'sla' => 'Keutamaan 2 (Sederhana)', 'tempoh' => '14 Hari'],
            'Illegal Ads'     => ['id' => 'J01', 'sla' => 'Keutamaan 3 (Rendah)', 'tempoh' => '30 - 90 Hari'],
            'Fallen Tree'     => ['id' => 'J02', 'sla' => 'Keutamaan 1 (Kritikal)', 'tempoh' => '24 Jam'],
            'Illegal Dumping' => ['id' => 'J03', 'sla' => 'Keutamaan 2 (Sederhana)', 'tempoh' => '14 Hari'],
            'Stray Dog'       => ['id' => 'J03', 'sla' => 'Keutamaan 3 (Rendah)', 'tempoh' => '14 Hari'],
            
            // Malay labels (Actual values sent by frontend)
            'Jalan Berlubang'              => ['id' => 'J01', 'sla' => 'Keutamaan 1 (Kritikal)', 'tempoh' => '24 Jam - 3 Hari'],
            'Banjir'                       => ['id' => 'J01', 'sla' => 'Keutamaan 1 (Kecemasan)', 'tempoh' => 'Serta-merta / 1 Jam'],
            'Longkang Tersumbat/Pecah'     => ['id' => 'J01', 'sla' => 'Keutamaan 2 (Sederhana)', 'tempoh' => '14 Hari'],
            'Lampu Jalan Rosak'            => ['id' => 'J01', 'sla' => 'Keutamaan 3 (Rendah)', 'tempoh' => '30 - 90 Hari'],
            'Infrastruktur Awam'           => ['id' => 'J01', 'sla' => 'Keutamaan 3 (Rendah)', 'tempoh' => '30 - 90 Hari'],
            'Pokok Tumbang'                => ['id' => 'J02', 'sla' => 'Keutamaan 1 (Kritikal)', 'tempoh' => '24 Jam'],
            'Pembuangan Sampah Haram'      => ['id' => 'J03', 'sla' => 'Keutamaan 2 (Sederhana)', 'tempoh' => '14 Hari'],
            'Haiwan Liar'                  => ['id' => 'J03', 'sla' => 'Keutamaan 3 (Rendah)', 'tempoh' => '14 Hari'],
        ];

        // Fallback for empty, null, or unknown labels
        if (empty($label) || !array_key_exists($label, $map)) {
            return ['id' => 'J00', 'sla' => 'Perlu Semakan', 'tempoh' => 'TBD'];
        }

        return $map[$label];
    }

    /**
     * Map an array of labels. If empty, return fallback array.
     */
    public function mapLabels(array $labels): array
    {
        if (empty($labels)) {
            return [ $this->mapLabel(null) ];
        }

        $results = [];
        foreach ($labels as $label) {
            $results[] = array_merge(['label' => $label], $this->mapLabel($label));
        }

        return $results;
    }

    // Keeping suggest method for backward compatibility
    public function suggest(string $jenisKerosakan): string
    {
        return $this->mapLabel($jenisKerosakan)['id'];
    }
}
