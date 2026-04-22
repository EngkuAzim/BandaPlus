<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('peranan', 'pegawai')->first();
$aduan = App\Models\Aduan::withCount('anakAduan')
            ->with(['anakAduan'])
            ->whereNull('id_aduan_induk')
            ->get();
echo json_encode($aduan, JSON_PRETTY_PRINT);
