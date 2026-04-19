<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jabatan extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_jabatan';
    public $incrementing = false; // Kerana kita guna string 'J01', bukan nombor berangkai
    protected $keyType = 'string';

    protected $fillable = [
        'id_jabatan',
        'nama_jabatan',
        'bajet_tahunan',
        'baki_semasa',
    ];
}