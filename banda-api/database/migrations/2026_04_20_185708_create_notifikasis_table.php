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
        if (!Schema::hasTable('notifikasis')) {
            Schema::create('notifikasis', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('id_pengguna');
                $table->string('mesej', 500);
                $table->enum('jenis', ['tugasan', 'status', 'pengesahan', 'sistem'])->default('sistem');
                $table->boolean('status_baca')->default(false);
                $table->timestamps();
                $table->foreign('id_pengguna')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifikasis');
    }
};
