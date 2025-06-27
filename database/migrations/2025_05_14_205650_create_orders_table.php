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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('trx')->nullable();
            $table->foreignId('user_id')->nullable()->constrained();
            $table->foreignId('user_address_id')->nullable()->constrained();
            $table->string('custom_user')->nullable(); // Diisi apabila user yang order barang tidak memiliki akun atau yang datang langsung ke outlet
            $table->string('custom_phone')->nullable();
            $table->text('custom_address')->nullable();
            $table->string('custom_lat')->nullable();
            $table->string('custom_long')->nullable();
            $table->enum('service_method', ['antar jemput', 'antar', 'pickup'])->nullable();
            $table->enum('status', ['belum diambil', 'pending', 'pencucian', 'pengeringan', 'siap dikirim/diambil', 'dalam perjalanan', 'selesai'])->default('pending');
            $table->enum('payment_status', ['unpaid', 'paid'])->default('unpaid');
            $table->double('grand_total')->nullable();
            $table->decimal('distance_km')->nullable();
            $table->double('delivery_fee')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
