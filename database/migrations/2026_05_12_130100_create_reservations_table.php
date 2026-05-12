<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->string('team')->nullable();
            $table->string('trip');
            $table->date('date');
            $table->string('status')->default('pending');
            $table->string('driver')->nullable();
            $table->unsignedInteger('start_km')->nullable();
            $table->unsignedInteger('end_km')->nullable();
            $table->text('start_notes')->nullable();
            $table->text('end_notes')->nullable();
            $table->boolean('operational_confirmed')->nullable();
            $table->timestamps();

            $table->index(['status', 'date']);
            $table->index('vehicle_id');
            $table->index('requested_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
