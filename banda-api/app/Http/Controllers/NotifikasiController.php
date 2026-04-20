<?php

namespace App\Http\Controllers;

use App\Models\Notifikasi;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     * Route: GET /api/notifikasi
     */
    public function index(Request $request)
    {
        $unreadOnly = $request->query('unread') == '1';
        
        $query = Notifikasi::where('id_pengguna', $request->user()->id)
            ->orderBy('created_at', 'desc');
            
        if ($unreadOnly) {
            $query->where('status_baca', false);
        }

        $notifikasi = $query->limit(50)->get();
        
        return response()->json($notifikasi);
    }

    /**
     * Mark a notification as read.
     * Route: PUT /api/notifikasi/{id}/baca
     */
    public function markAsRead(Request $request, $id)
    {
        $notif = Notifikasi::where('id_pengguna', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();
            
        $notif->update(['status_baca' => true]);
        
        return response()->json(['message' => 'Notifikasi ditanda baca.']);
    }

    /**
     * Mark all notifications as read.
     * Route: PUT /api/notifikasi/baca-semua
     */
    public function markAllAsRead(Request $request)
    {
        Notifikasi::where('id_pengguna', $request->user()->id)
            ->where('status_baca', false)
            ->update(['status_baca' => true]);
            
        return response()->json(['message' => 'Semua notifikasi ditanda baca.']);
    }
}
