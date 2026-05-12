<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    protected $fillable = [
        'brand',
        'model',
        'category',
        'image',
        'plate',
        'seats',
        'current_km',
        'operational',
        'next_inspection',
        'insurance_company',
        'insurance_type',
        'insurance_renewal',
        'responsible',
        'phone',
        'base',
    ];

    protected function casts(): array
    {
        return [
            'operational' => 'boolean',
            'next_inspection' => 'date',
            'insurance_renewal' => 'date',
        ];
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(MaintenanceRecord::class);
    }

    public function getNameAttribute(): string
    {
        return trim($this->brand . ' ' . $this->model);
    }

    protected $appends = ['name'];
}
