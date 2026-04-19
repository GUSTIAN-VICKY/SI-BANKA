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
        Schema::create('update_log', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->date('date')->nullable();
            $table->string('itemId');
            $table->string('itemName');
            $table->string('changeType');
            $table->decimal('oldValue', 10, 2);
            $table->decimal('newValue', 10, 2);
            $table->string('admin');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('update_log');
    }
};
