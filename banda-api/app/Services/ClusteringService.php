<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class ClusteringService
{
    /**
     * Checks if there's an existing active Aduan within $radius meters of the same type.
     * Returns the ID of the parent Aduan if found, otherwise null.
     */
    public function findParentCluster(float $lat, float $lon, string $jenisKerosakan, int $radius = 500): ?string
    {
        // Haversine formula to find the closest active aduan of the same type within $radius meters
        $sql = "
            SELECT id_aduan,
            ( 6371000 * acos( cos( radians(?) ) *
              cos( radians( ST_Y(lokasi_gps) ) ) *
              cos( radians( ST_X(lokasi_gps) ) - radians(?) ) +
              sin( radians(?) ) *
              sin( radians( ST_Y(lokasi_gps) ) ) )
            ) AS distance
            FROM aduans
            WHERE status IN ('Baru', 'Dalam Tindakan')
            AND id_aduan_induk IS NULL
            AND jenis_kerosakan = ?
            AND lokasi_gps IS NOT NULL
            HAVING distance <= ?
            ORDER BY distance ASC
            LIMIT 1
        ";

        $result = DB::select($sql, [$lat, $lon, $lat, $jenisKerosakan, $radius]);

        if (!empty($result)) {
            return $result[0]->id_aduan;
        }

        return null;
    }
}
