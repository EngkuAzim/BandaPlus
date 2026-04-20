<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_pengguna',
        'mesej',
        'jenis',
        'status_baca',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_pengguna', 'id');
    }
}
