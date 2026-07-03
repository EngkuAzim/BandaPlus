<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AduanEvidence extends Model
{
    use HasFactory;

    protected $table = 'aduan_evidences';

    protected $fillable = [
        'id_aduan',
        'file_path',
        'file_type',
        'original_name',
    ];

    public function aduan()
    {
        return $this->belongsTo(Aduan::class, 'id_aduan', 'id_aduan');
    }
}
