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
        Schema::create('ai_scans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('image_path');
            $table->json('predictions')->nullable();
            $table->string('status')->default('pending'); // pending, completed, error
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_scans');
    }
};
