<?php
// Check database state - run with: php artisan-free check_db.php
// Actually run as: php -r "require 'vendor/autoload.php'; ..."
// Simpler: use artisan tinker-style

use Illuminate\Support\Facades\DB;

$users = DB::table('users')->select('id','name','email','peranan','id_jabatan')->get();
echo "=== USERS ===\n";
foreach ($users as $u) {
    echo "id={$u->id} | {$u->name} | {$u->peranan} | jabatan=" . ($u->id_jabatan ?? 'NULL') . "\n";
}

echo "\n=== JABATAN ===\n";
$jabatans = DB::table('jabatans')->select('id_jabatan','nama_jabatan')->get();
foreach ($jabatans as $j) {
    echo "{$j->id_jabatan} | {$j->nama_jabatan}\n";
}

echo "\n=== PEGAWAI → JABATAN LINK ===\n";
$pegawai = DB::table('users')->where('peranan','pegawai')->get(['id','name','id_jabatan']);
foreach ($pegawai as $p) {
    $jab = DB::table('jabatans')->where('id_jabatan', $p->id_jabatan)->first();
    $jabNama = $jab ? $jab->nama_jabatan : 'TIADA JABATAN (NULL!)';
    echo "Pegawai: {$p->name} (id={$p->id}) → {$jabNama}\n";
}
