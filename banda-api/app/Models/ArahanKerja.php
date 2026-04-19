<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArahanKerja extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_arahan';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_arahan',
        'id_aduan',
        'id_kontraktor',
        'id_jabatan',
        'kos_anggaran',
        'gambar_selepas',
        'status_kerja',
        'nota_kontraktor'
    ];

    // Sambungan (Relationships)
    public function aduan()
    {
        return $this->belongsTo(Aduan::class, 'id_aduan', 'id_aduan');
    }

    public function kontraktor()
    {
        return $this->belongsTo(User::class, 'id_kontraktor', 'id');
    }
}