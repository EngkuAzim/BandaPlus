<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aduan extends Model
{
    use HasFactory;

    // 1. Beritahu Laravel nama jadual dan Kunci Primer yang betul
    protected $table = 'aduans';
    protected $primaryKey = 'id_aduan';

    // 2. Beritahu Laravel ID ini adalah String (Varchar), bukan nombor auto-increment
    public $incrementing = false;
    protected $keyType = 'string';

    // 3. Pautkan 'created_at' Laravel kepada 'tarikh_lapor' secara automatik
    const CREATED_AT = 'tarikh_lapor';

    protected $fillable = [
        'id_aduan',
        'id_pengguna',
        'id_zon',
        'id_jabatan',
        'id_aduan_induk',
        'jenis_kerosakan',
        'gambar_bukti',
        'keterangan_aduan',
        'alamat_lokasi',
        'lokasi_gps',
        'skor_ai',
        'label_prioriti',
        'status',
        'maklum_balas'
    ];
    protected $hidden = [
        'lokasi_gps',
    ];

    public function pengguna()
    {
        return $this->belongsTo(User::class, 'id_pengguna');
    }

    public function aduanInduk()
    {
        return $this->belongsTo(Aduan::class, 'id_aduan_induk', 'id_aduan');
    }
}