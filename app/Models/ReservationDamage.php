<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ReservationDamage extends Model
{
    public const TYPES = ['scratch', 'dent', 'crack', 'clip'];
    public const SEVERITIES = ['low', 'high'];

    protected $fillable = [
        'reservation_id',
        'x',
        'y',
        'damage_type',
        'severity',
        'description',
        'photo_path',
        'cost',
        'response_message',
        'cost_set_by',
        'cost_set_at',
    ];

    protected function casts(): array
    {
        return [
            'x' => 'float',
            'y' => 'float',
            'cost' => 'decimal:2',
            'cost_set_at' => 'datetime',
        ];
    }

    protected $appends = ['photo_url'];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function costSetter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cost_set_by');
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? Storage::disk('public')->url($this->photo_path) : null;
    }
}
