<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservation_damages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained()->cascadeOnDelete();
            $table->decimal('x', 5, 4); // 0..1 fração horizontal sobre o SVG
            $table->decimal('y', 5, 4); // 0..1 fração vertical sobre o SVG
            $table->string('damage_type'); // scratch | dent | crack | clip
            $table->string('severity'); // low | high
            $table->text('description')->nullable();
            $table->string('photo_path')->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->text('response_message')->nullable();
            $table->foreignId('cost_set_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cost_set_at')->nullable();
            $table->timestamps();

            $table->index('reservation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_damages');
    }
};
