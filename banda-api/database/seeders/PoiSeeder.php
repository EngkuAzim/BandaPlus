<?php

namespace Database\Seeders;

use App\Models\PointOfInterest;
use Illuminate\Database\Seeder;

class PoiSeeder extends Seeder
{
    /**
     * POI data will be added by Admin through the UI at /urus-poi.
     * This seeder intentionally left empty.
     */
    public function run(): void
    {
        // No data seeded — Admin will add POIs via the /urus-poi panel.
    }
}
