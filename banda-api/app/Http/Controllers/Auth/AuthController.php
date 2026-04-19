<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users',
            'no_telefon' => 'required|string|max:20',
            'password'   => 'required|string|min:8',
        ]);

        $user = User::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'no_telefon' => $request->no_telefon,
            'password'   => Hash::make($request->password),
            // peranan defaults to 'komuniti' via migration
        ]);

        return response()->json([
            'message' => 'Pendaftaran berjaya!',
            'user'    => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Maklumat log masuk tidak sah.'
            ], 401);
        }

        $user  = User::with('jabatan:id_jabatan,nama_jabatan,baki_semasa,bajet_tahunan')
                     ->where('email', $request->email)
                     ->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Log masuk berjaya!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user
        ]);
    }

    public function logout(Request $request)
    {
        // Revoke the current token
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Log keluar berjaya.']);
    }
}
