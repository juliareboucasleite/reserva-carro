<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use App\Models\ReservationMedia;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class PurgeReservationMedia extends Command
{
    protected $signature = 'media:purge {--days=30 : Idade em dias para purga}';

    protected $description = 'Apaga fotos/vídeo de reservas fechadas há mais de N dias';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoff = now()->subDays($days);

        $reservations = Reservation::where('status', Reservation::STATUS_CHECKED_OUT)
            ->where('updated_at', '<', $cutoff)
            ->pluck('id');

        $deleted = 0;
        ReservationMedia::whereIn('reservation_id', $reservations)
            ->chunkById(200, function ($items) use (&$deleted) {
                foreach ($items as $media) {
                    Storage::disk('public')->delete($media->path);
                    $media->delete();
                    $deleted++;
                }
            });

        $this->info("Apagados {$deleted} ficheiros de media (mais de {$days} dias).");
        return self::SUCCESS;
    }
}
