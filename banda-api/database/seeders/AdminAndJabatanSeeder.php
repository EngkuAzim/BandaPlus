<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminAndJabatanSeeder extends Seeder
{
    public function run(): void
    {
        // ---- Default Pentadbir Account ----
        User::firstOrCreate(
            ['email' => 'admin@bandaplus.gov.my'],
            [
                'name'       => 'Pentadbir BANDA+',
                'password'   => Hash::make('Admin@1234'),
                'peranan'    => 'pentadbir',
                'no_telefon' => '0123456789',
            ]
        );

        // ---- Default Pegawai Account (Jabatan Kejuruteraan) ----
        User::firstOrCreate(
            ['email' => 'pegawai@bandaplus.gov.my'],
            [
                'name'        => 'Pegawai Jabatan',
                'password'    => Hash::make('Pegawai@1234'),
                'peranan'     => 'pegawai',
                'no_telefon'  => '0198765432',
                'id_jabatan'  => 'J01',   // Jabatan Kejuruteraan
            ]
        );

        // ---- Second Pegawai (Jabatan Landskap) ----
        User::firstOrCreate(
            ['email' => 'sarah@bandaplus.gov.my'],
            [
                'name'        => 'Pegawai Sarah',
                'password'    => Hash::make('Sarah@1234'),
                'peranan'     => 'pegawai',
                'no_telefon'  => '0197654321',
                'id_jabatan'  => 'J02',   // Jabatan Landskap
            ]
        );

        // ---- Default Kontraktor Account ----
        User::firstOrCreate(
            ['email' => 'kontraktor@bandaplus.gov.my'],
            [
                'name'       => 'Bina Teguh Enterprise',
                'password'   => Hash::make('Kontraktor@1234'),
                'peranan'    => 'kontraktor',
                'no_telefon' => '0187654321',
            ]
        );

        // ---- Jabatan Data ----
        $jabatans = [
            ['id_jabatan' => 'J01', 'nama_jabatan' => 'Jabatan Kejuruteraan',      'bajet_tahunan' => 500000.00, 'baki_semasa' => 500000.00],
            ['id_jabatan' => 'J02', 'nama_jabatan' => 'Jabatan Landskap',          'bajet_tahunan' => 300000.00, 'baki_semasa' => 300000.00],
            ['id_jabatan' => 'J03', 'nama_jabatan' => 'Jabatan Elektrik',          'bajet_tahunan' => 200000.00, 'baki_semasa' => 200000.00],
            ['id_jabatan' => 'J04', 'nama_jabatan' => 'Jabatan Pembetungan',       'bajet_tahunan' => 150000.00, 'baki_semasa' => 150000.00],
            ['id_jabatan' => 'J05', 'nama_jabatan' => 'Jabatan Perkhidmatan Am',   'bajet_tahunan' => 100000.00, 'baki_semasa' => 100000.00],
        ];

        foreach ($jabatans as $jabatan) {
            Jabatan::firstOrCreate(['id_jabatan' => $jabatan['id_jabatan']], $jabatan);
        }

        $this->command->info('✅ Admin, Pegawai, Kontraktor, dan Jabatan berjaya dicipta.');
    }
}
