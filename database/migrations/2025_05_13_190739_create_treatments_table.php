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
        Schema::create('treatments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->string('picture');
            $table->double('price');
            $table->float('analyze')->nullable(); // Diisi dengan 0.1 untuk 10% atau 0.5 untuk 50%
            $table->boolean('is_yellow')->nullable();
            $table->text('description');
            $table->timestamps();
            $table->softDeletes();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('treatments');
    }
};
