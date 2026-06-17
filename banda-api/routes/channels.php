<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('admin-dashboard', function ($user) {
    $role = strtolower($user->peranan);
    return in_array($role, ['pentadbir', 'admin', 'pegawai']);
});

Broadcast::channel('kontraktor.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id && $user->peranan === 'Kontraktor';
});

Broadcast::channel('arahan-kerja.{id}', function ($user, $id) {
    // Basic check: only authenticated users can listen for now
    // In production, you would check if $user is the assigned Kontraktor or a Pegawai
    return true;
});
