<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reservation extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_CHECKED_IN = 'checked_in';
    public const STATUS_CHECKED_OUT = 'checked_out';

    protected $fillable = [
        'vehicle_id',
        'requested_by',
        'team',
        'trip',
        'date',
        'status',
        'driver',
        'start_km',
        'end_km',
        'start_notes',
        'end_notes',
        'operational_confirmed',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'operational_confirmed' => 'boolean',
            'start_km' => 'integer',
            'end_km' => 'integer',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function media(): HasMany
    {
        return $this->hasMany(ReservationMedia::class);
    }

    public function damages(): HasMany
    {
        return $this->hasMany(ReservationDamage::class);
    }
}
