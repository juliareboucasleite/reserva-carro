<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = [
            [
                'brand' => 'Ford', 'model' => 'Trânsit', 'category' => 'van',
                'image' => 'ford-transit.webp',
                'plate' => '12-AB-34', 'seats' => 9, 'current_km' => 84210, 'operational' => true,
                'next_inspection' => '2026-08-12', 'insurance_company' => 'Fidelidade',
                'insurance_type' => 'Todos os riscos', 'insurance_renewal' => '2026-11-30',
                'responsible' => 'João Tavares', 'phone' => '+351 912 345 678', 'base' => 'Lisboa',
            ],
            [
                'brand' => 'VW', 'model' => 'Transporter', 'category' => 'van',
                'image' => 'vw-transporter.webp',
                'plate' => '45-CD-67', 'seats' => 8, 'current_km' => 122540, 'operational' => true,
                'next_inspection' => '2026-06-02', 'insurance_company' => 'Tranquilidade',
                'insurance_type' => 'Danos próprios', 'insurance_renewal' => '2026-07-15',
                'responsible' => 'Sofia Antunes', 'phone' => '+351 913 998 712', 'base' => 'Lisboa',
            ],
            [
                'brand' => 'Mitsubishi', 'model' => 'L400', 'category' => 'van',
                'image' => 'mitsubishi-l400.webp',
                'plate' => '78-EF-90', 'seats' => 6, 'current_km' => 198320, 'operational' => false,
                'next_inspection' => '2026-05-20', 'insurance_company' => 'Ageas',
                'insurance_type' => 'Responsabilidade civil', 'insurance_renewal' => '2026-12-01',
                'responsible' => 'Manuel Costa', 'phone' => '+351 916 221 045', 'base' => 'Porto',
            ],
            [
                'brand' => 'Opel', 'model' => 'Vivaro', 'category' => 'van',
                'image' => 'opel-vivaro.webp',
                'plate' => '11-GH-22', 'seats' => 9, 'current_km' => 56770, 'operational' => true,
                'next_inspection' => '2026-09-04', 'insurance_company' => 'Allianz',
                'insurance_type' => 'Todos os riscos', 'insurance_renewal' => '2027-01-10',
                'responsible' => 'Rita Lopes', 'phone' => '+351 917 553 380', 'base' => 'Lisboa',
            ],
            [
                'brand' => 'Opel', 'model' => 'Benfica', 'category' => 'car',
                'image' => 'opel-benfica.webp',
                'plate' => '33-IJ-44', 'seats' => 5, 'current_km' => 32100, 'operational' => true,
                'next_inspection' => '2026-10-18', 'insurance_company' => 'Fidelidade',
                'insurance_type' => 'Danos próprios', 'insurance_renewal' => '2026-08-22',
                'responsible' => 'Pedro Marques', 'phone' => '+351 919 042 116', 'base' => 'Faro',
            ],
            [
                'brand' => 'Autocarro', 'model' => 'Marcopolo Iveco', 'category' => 'bus',
                'image' => 'marcopolo-iveco.webp',
                'plate' => '55-KL-66', 'seats' => 55, 'current_km' => 412000, 'operational' => true,
                'next_inspection' => '2026-05-25', 'insurance_company' => 'Tranquilidade',
                'insurance_type' => 'Todos os riscos', 'insurance_renewal' => '2026-09-30',
                'responsible' => 'Carlos Ferreira', 'phone' => '+351 918 776 200', 'base' => 'Porto',
            ],
            [
                'brand' => 'Autocarro', 'model' => 'MAN', 'category' => 'bus',
                'image' => 'man-bus.webp',
                'plate' => '77-MN-88', 'seats' => 49, 'current_km' => 305880, 'operational' => true,
                'next_inspection' => '2026-07-10', 'insurance_company' => 'Ageas',
                'insurance_type' => 'Todos os riscos', 'insurance_renewal' => '2026-10-05',
                'responsible' => 'Inês Moreira', 'phone' => '+351 914 318 905', 'base' => 'Lisboa',
            ],
        ];

        foreach ($vehicles as $attributes) {
            Vehicle::updateOrCreate(['plate' => $attributes['plate']], $attributes);
        }
    }
}
