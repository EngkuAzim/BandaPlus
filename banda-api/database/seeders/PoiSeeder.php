<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PointOfInterest;

class PoiSeeder extends Seeder
{
    public function run(): void
    {
        $pois = [
            [
                'nama' => 'Hospital Ampang',
                'kategori' => 'Hospital',
                'lat' => 3.128166939305831,
                'lng' => 101.7634686826648,
            ],
            [
                'nama' => 'Balai Bomba Ampang',
                'kategori' => 'Bomba',
                'lat' => 3.1457546125133957,
                'lng' => 101.76322460164194,
            ],
            [
                'nama' => 'IPD AMPANG',
                'kategori' => 'Balai Polis',
                'lat' => 3.1316988731018696,
                'lng' => 101.76877261027877,
            ],
            [
                'nama' => 'Klinik Kesihatan Ampang',
                'kategori' => 'Klinik',
                'lat' => 3.1452945211095598,
                'lng' => 101.76135756436531,
            ],
            [
                'nama' => 'SK Ampang Campuran',
                'kategori' => 'Sekolah',
                'lat' => 3.133150955416193,
                'lng' => 101.76779522621631,
            ],
            [
                'nama' => 'SMK Bandar Baru Ampang',
                'kategori' => 'Sekolah',
                'lat' => 3.13715762223008,
                'lng' => 101.76841455084775,
            ]
        ];

        foreach ($pois as $poi) {
            PointOfInterest::updateOrCreate(
                ['nama' => $poi['nama']],
                [
                    'kategori' => $poi['kategori'],
                    'lat' => $poi['lat'],
                    'lng' => $poi['lng'],
                    'is_aktif' => true,
                ]
            );
        }
    }
}
