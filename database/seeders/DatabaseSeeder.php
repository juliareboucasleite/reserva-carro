<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Ana Pereira',
                'email' => 'ana@empresa.pt',
                'password' => 'password123',
                'role' => 'driver',
                'team' => 'Operações Lisboa',
            ],
            [
                'name' => 'Rui Santos',
                'email' => 'rui@empresa.pt',
                'password' => 'password123',
                'role' => 'manager',
                'team' => 'Gestão de Frota',
            ],
            [
                'name' => 'Carla Mendes',
                'email' => 'carla@empresa.pt',
                'password' => 'password123',
                'role' => 'admin',
                'team' => 'Administração',
            ],
        ];

        foreach ($users as $attributes) {
            User::updateOrCreate(
                ['email' => $attributes['email']],
                [
                    ...$attributes,
                    'email_verified_at' => Carbon::now(),
                ]
            );
        }

        $this->call(VehicleSeeder::class);
    }
}
