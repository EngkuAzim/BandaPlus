<?php

namespace App\Observers;

use App\Events\NotifikasiDihantar;
use App\Models\Notifikasi;

class NotifikasiObserver
{
    /**
     * Handle the Notifikasi "created" event.
     * Fires a WebSocket broadcast whenever a notification is inserted
     * into the database — regardless of which controller created it.
     */
    public function created(Notifikasi $notifikasi): void
    {
        broadcast(new NotifikasiDihantar($notifikasi->id_pengguna, $notifikasi));
    }
}
