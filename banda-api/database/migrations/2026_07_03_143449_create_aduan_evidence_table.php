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
        Schema::create('aduan_evidences', function (Blueprint $table) {
            $table->id();
            $table->string('id_aduan');
            $table->string('file_path');
            $table->string('file_type');
            $table->string('original_name')->nullable();
            $table->timestamps();
            
            $table->foreign('id_aduan')->references('id_aduan')->on('aduans')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aduan_evidences');
    }
};
