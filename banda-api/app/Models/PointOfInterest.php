<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PointOfInterest extends Model
{
    protected $fillable = ['nama', 'kategori', 'lat', 'lng', 'is_aktif'];

    protected $casts = [
        'is_aktif' => 'boolean',
        'lat'      => 'float',
        'lng'      => 'float',
    ];
}
