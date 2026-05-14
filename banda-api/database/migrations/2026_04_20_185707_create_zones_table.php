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
        if (!Schema::hasTable('zones')) {
            Schema::create('zones', function (Blueprint $table) {
                $table->id('id_zon');
                $table->string('nama_zon', 50);
                $table->polygon('sempadan_geo')->nullable();
                $table->string('nama_ahli_majlis', 255)->nullable();
                $table->string('email_rasmi', 100)->nullable();
                $table->string('notel_ahli_majlis', 15)->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zones');
    }
};
