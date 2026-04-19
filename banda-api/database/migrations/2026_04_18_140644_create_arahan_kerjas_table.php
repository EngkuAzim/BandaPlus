<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('arahan_kerjas', function (Blueprint $table) {
            $table->string('id_arahan', 20)->primary(); // Contoh: AK-2026-001

            // Foreign Keys
            $table->string('id_aduan');
            $table->foreign('id_aduan')->references('id_aduan')->on('aduans')->onDelete('cascade');

            $table->unsignedBigInteger('id_kontraktor');
            $table->foreign('id_kontraktor')->references('id')->on('users')->onDelete('cascade');

            $table->string('id_jabatan'); // Jabatan yang melantik

            // Data Kerja
            $table->decimal('kos_anggaran', 10, 2);
            $table->string('gambar_selepas')->nullable(); // Gambar bukti geo-fencing
            $table->string('status_kerja')->default('Dalam Proses'); // Dalam Proses / Selesai / Ditolak (Jika luar Geo-fence)
            $table->text('nota_kontraktor')->nullable();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('arahan_kerjas');
    }
};