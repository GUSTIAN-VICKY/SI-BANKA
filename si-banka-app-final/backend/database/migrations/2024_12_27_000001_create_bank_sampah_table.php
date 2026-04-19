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
        Schema::create('bank_sampah', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // "Bank Sampah RT 01/RW 02 Sukamaju"
            $table->string('rt', 10);
            $table->string('rw', 10);
            $table->string('kelurahan', 100)->nullable();
            $table->string('kecamatan', 100)->nullable();
            $table->string('kota', 100);
            $table->text('alamat')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Unique constraint untuk mencegah duplikasi lokasi
            $table->unique(['rt', 'rw', 'kelurahan', 'kecamatan', 'kota'], 'unique_location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_sampah');
    }
};
