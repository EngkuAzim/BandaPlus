<?php

namespace App\Http\Controllers\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\Jabatan;

class JabatanController extends Controller
{
    /**
     * Return all jabatan for dropdown use.
     * Route: GET /api/pegawai/jabatan
     */
    public function index()
    {
        return response()->json(
            Jabatan::all(['id_jabatan', 'nama_jabatan', 'baki_semasa'])
        );
    }
}
