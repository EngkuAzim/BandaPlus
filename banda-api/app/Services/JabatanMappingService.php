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
            'Flash_Flood'     => ['id' => 'J05', 'sla' => 'Keutamaan 1 (Kecemasan)', 'tempoh' => 'Serta-merta / 1 Jam'],
            'Pothole'         => ['id' => 'J01', 'sla' => 'Keutamaan 1 (Kritikal)', 'tempoh' => '24 Jam - 3 Hari'],
            'Fallen_Tree'     => ['id' => 'J03', 'sla' => 'Keutamaan 1 (Kritikal)', 'tempoh' => '24 Jam'],
            'Illegal_Dumping' => ['id' => 'J02', 'sla' => 'Keutamaan 2 (Sederhana)', 'tempoh' => '14 Hari'],
            'Trash_In_Drain'  => ['id' => 'J02', 'sla' => 'Keutamaan 2 (Sederhana)', 'tempoh' => '14 Hari'],
            'Illegal_Ads'     => ['id' => 'J04', 'sla' => 'Keutamaan 3 (Rendah)', 'tempoh' => '30 - 90 Hari'],
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
