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
        Schema::table('aduans', function (Blueprint $table) {
            $table->string('detected_image_path', 255)->nullable()->after('gambar_bukti');
            $table->json('ai_predictions')->nullable()->after('skor_ai');
        });
        \DB::statement("ALTER TABLE aduans MODIFY COLUMN status ENUM('Baru', 'Dalam Tindakan', 'Selesai', 'Ditolak', 'verified') DEFAULT 'Baru'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \DB::statement("ALTER TABLE aduans MODIFY COLUMN status ENUM('Baru', 'Dalam Tindakan', 'Selesai', 'Ditolak') DEFAULT 'Baru'");
        Schema::table('aduans', function (Blueprint $table) {
            $table->dropColumn(['detected_image_path', 'ai_predictions']);
        });
    }
};
