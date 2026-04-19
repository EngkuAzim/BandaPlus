<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add tarikh_jangkaan_siap and nota_pegawai to arahan_kerjas.
     * These fields are used by the Pegawai module when issuing work orders.
     */
    public function up(): void
    {
        Schema::table('arahan_kerjas', function (Blueprint $table) {
            $table->date('tarikh_jangkaan_siap')->nullable()->after('kos_anggaran');
            $table->text('nota_pegawai')->nullable()->after('tarikh_jangkaan_siap');
        });
    }

    public function down(): void
    {
        Schema::table('arahan_kerjas', function (Blueprint $table) {
            $table->dropColumn(['tarikh_jangkaan_siap', 'nota_pegawai']);
        });
    }
};
