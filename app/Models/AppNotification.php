<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppNotification extends Model
{
    protected $table = 'app_notifications';

    public const TYPE_RESERVATION_REQUESTED = 'reservation_requested';
    public const TYPE_RESERVATION_APPROVED = 'reservation_approved';
    public const TYPE_RESERVATION_REJECTED = 'reservation_rejected';
    public const TYPE_RESERVATION_CHECKED_OUT = 'reservation_checked_out';
    public const TYPE_OPERATIONAL_CONFIRMATION_NEEDED = 'operational_confirmation_needed';
    public const TYPE_VEHICLE_NON_OPERATIONAL = 'vehicle_non_operational';
    public const TYPE_INSPECTION_DUE = 'inspection_due';
    public const TYPE_INSURANCE_DUE = 'insurance_due';

    protected $fillable = [
        'user_id',
        'type',
        'message',
        'vehicle_id',
        'reservation_id',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}
