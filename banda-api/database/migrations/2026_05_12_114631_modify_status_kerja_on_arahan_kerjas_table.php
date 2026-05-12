<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE arahan_kerjas MODIFY status_kerja ENUM('Dalam Proses','Selesai','Ditolak','Disahkan')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE arahan_kerjas MODIFY status_kerja ENUM('Dalam Proses','Selesai','Ditolak')");
    }
};
