<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArahanKerja extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_arahan';
    public $incrementing  = false;
    protected $keyType    = 'string';

    protected $fillable = [
        'id_arahan',
        'id_aduan',
        'id_kontraktor',
        'id_jabatan',
        'kos_anggaran',
        'tarikh_jangkaan_siap',  // added
        'nota_pegawai',          // added
        'gambar_selepas',
        'status_kerja',
        'nota_kontraktor',
    ];

    // ---- Relationships ----

    public function aduan()
    {
        return $this->belongsTo(Aduan::class, 'id_aduan', 'id_aduan');
    }

    public function kontraktor()
    {
        return $this->belongsTo(User::class, 'id_kontraktor', 'id');
    }

    public function jabatan()
    {
        return $this->belongsTo(Jabatan::class, 'id_jabatan', 'id_jabatan');
    }
}