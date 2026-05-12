<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('brand');
            $table->string('model');
            $table->string('category')->default('van');
            $table->string('image')->nullable();
            $table->string('plate')->unique();
            $table->unsignedSmallInteger('seats')->default(0);
            $table->unsignedInteger('current_km')->default(0);
            $table->boolean('operational')->default(true);
            $table->date('next_inspection')->nullable();
            $table->string('insurance_company')->nullable();
            $table->string('insurance_type')->nullable();
            $table->date('insurance_renewal')->nullable();
            $table->string('responsible')->nullable();
            $table->string('phone')->nullable();
            $table->string('base')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
