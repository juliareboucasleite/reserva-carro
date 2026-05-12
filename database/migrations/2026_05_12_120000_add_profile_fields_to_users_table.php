<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('surname')->nullable()->after('name');
            $table->string('country', 2)->nullable()->after('team');
            $table->string('nif', 32)->nullable()->after('country');
            $table->date('birthdate')->nullable()->after('nif');
            $table->string('phone', 32)->nullable()->after('birthdate');
            $table->boolean('newsletter_opt_in')->default(false)->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['surname', 'country', 'nif', 'birthdate', 'phone', 'newsletter_opt_in']);
        });
    }
};
