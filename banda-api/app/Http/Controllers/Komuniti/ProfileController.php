<?php

namespace App\Http\Controllers\Komuniti;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Update the logged-in user's own profile.
     * Route: PUT /api/profil
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'no_telefon' => 'required|string|max:20',
            'alamat_1'   => 'nullable|string|max:255',
            'alamat_2'   => 'nullable|string|max:255',
            'poskod'     => 'nullable|string|max:5',
            'bandar'     => 'nullable|string|max:100',
            'negeri'     => 'nullable|string|max:100',
        ]);

        $user->update($request->only([
            'no_telefon',
            'alamat_1',
            'alamat_2',
            'poskod',
            'bandar',
            'negeri',
        ]));

        return response()->json([
            'message' => 'Profil berjaya dikemaskini.',
            'user'    => $user
        ]);
    }
}
