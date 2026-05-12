<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservation_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained()->cascadeOnDelete();
            $table->string('phase'); // start | end
            $table->string('path');
            $table->string('mime')->nullable();
            $table->string('original_name')->nullable();
            $table->unsignedInteger('size')->default(0);
            $table->timestamps();

            $table->index(['reservation_id', 'phase']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_media');
    }
};
