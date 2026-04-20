<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Zone extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_zon';
    
    protected $fillable = [
        'nama_zon',
        'sempadan_geo',
        'nama_ahli_majlis',
        'email_rasmi',
        'notel_ahli_majlis',
    ];

    public function aduan()
    {
        return $this->hasMany(Aduan::class, 'id_zon', 'id_zon');
    }
}
