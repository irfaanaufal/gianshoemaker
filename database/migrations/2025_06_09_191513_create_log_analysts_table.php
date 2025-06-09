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
        Schema::create('log_analysts', function (Blueprint $table) {
            $table->id();
            $table->string('dirtiness_level')->nullable();
            $table->boolean('is_yellowing')->default(false);
            $table->string('recommended_treatment_slug')->nullable();
            $table->text('reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_analysts');
    }
};
