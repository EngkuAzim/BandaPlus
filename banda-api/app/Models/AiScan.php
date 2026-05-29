<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AiScan extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'image_path',
        'predictions',
        'status',
    ];

    protected $casts = [
        'predictions' => 'array',
    ];
}
