<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('jabatans', function (Blueprint $table) {
            // Menggunakan string ('J01', 'J02') sebagai Primary Key
            $table->string('id_jabatan', 10)->primary(); 
            $table->string('nama_jabatan');
            $table->decimal('bajet_tahunan', 15, 2)->default(0);
            $table->decimal('baki_semasa', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('jabatans');
    }
};