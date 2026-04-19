<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jabatan extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_jabatan';
    public $incrementing  = false;
    protected $keyType    = 'string';

    protected $fillable = [
        'id_jabatan',
        'nama_jabatan',
        'bajet_tahunan',
        'baki_semasa',
    ];

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    /**
     * Semua pegawai yang menjaga jabatan ini.
     */
    public function pegawai()
    {
        return $this->hasMany(User::class, 'id_jabatan', 'id_jabatan')
                    ->where('peranan', 'pegawai');
    }

    /**
     * Semua aduan yang dikategorikan di bawah jabatan ini.
     */
    public function aduans()
    {
        return $this->hasMany(Aduan::class, 'id_jabatan', 'id_jabatan');
    }

    /**
     * Semua arahan kerja yang dikeluarkan oleh jabatan ini.
     */
    public function arahanKerjas()
    {
        return $this->hasMany(ArahanKerja::class, 'id_jabatan', 'id_jabatan');
    }
}