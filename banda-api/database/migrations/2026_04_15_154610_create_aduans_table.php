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
        Schema::create('aduans', function (Blueprint $table) {
            // Kunci Primer
            $table->string('id_aduan', 15)->primary(); // e.g., "ADU-2026-0001"
            
            // Kunci Asing (Foreign Keys)
            // Nota: id_pengguna dikekalkan sebagai unsignedBigInteger untuk memastikan 
            // sistem log masuk sedia ada tidak terjejas.
            $table->unsignedBigInteger('id_pengguna'); 
            $table->integer('id_zon')->nullable(); 
            $table->string('id_aduan_induk', 15)->nullable(); 
            
            // Maklumat Kerosakan
            $table->string('jenis_kerosakan', 255); 
            $table->string('gambar_bukti', 255); 
            $table->text('keterangan_aduan')->nullable();
            $table->string('alamat_lokasi', 255)->nullable(); 
            
            // AI & Geo-Spatial Data
            $table->point('lokasi_gps')->nullable(); 
            $table->decimal('skor_ai', 5, 2)->nullable(); 
            $table->enum('label_prioriti', ['SANGAT TINGGI', 'SEDERHANA', 'RENDAH'])->nullable(); 
            
            // Status Tracking
            $table->enum('status', ['Baru', 'Dalam Tindakan', 'Selesai', 'Ditolak'])->default('Baru'); 
            
            // Tarikh & Masa
            $table->dateTime('tarikh_lapor')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            // Konfigurasi Hubungan (Relationships)
            $table->foreign('id_pengguna')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_aduan_induk')->references('id_aduan')->on('aduans')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aduans');
    }
};
