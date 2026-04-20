<?php

namespace App\Services;

class JabatanMappingService
{
    /**
     * Suggest a department based on the aduan type.
     */
    public function suggest(string $jenisKerosakan): string
    {
        // Default J00 (Sila Pilih Jabatan)
        $map = [
            'Jalan Berlubang'    => 'J01', // Kejuruteraan
            'Lampu Jalan'        => 'J01',
            'Tanah Runtuh'       => 'J01',
            'Paip Pecah'         => 'J01',
            'Kutipan Sampah'     => 'J02', // Sisa Pepejal
            'Longkang Tersumbat' => 'J02',
            'Pokok Tumbang'      => 'J03', // Landskap
            'Rumput Panjang'     => 'J03',
            'Fasiliti Rosak'     => 'J04', // Bangunan
            'Vandalisme'         => 'J04'
        ];
        
        return $map[$jenisKerosakan] ?? 'J00';
    }
}
