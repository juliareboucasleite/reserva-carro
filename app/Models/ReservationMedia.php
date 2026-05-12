<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ReservationMedia extends Model
{
    protected $table = 'reservation_media';

    protected $fillable = [
        'reservation_id',
        'phase',
        'angle',
        'path',
        'mime',
        'original_name',
        'size',
    ];

    protected $appends = ['url'];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function getUrlAttribute(): ?string
    {
        return $this->path ? Storage::disk('public')->url($this->path) : null;
    }
}
