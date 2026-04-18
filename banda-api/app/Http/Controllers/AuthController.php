<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 1. Validate the incoming request
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'no_telefon' => 'required|string|max:20',
            'password' => 'required|string|min:8',
        ]);

        // 2. Create the user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'no_telefon' => $request->no_telefon,
            'password' => Hash::make($request->password),
            // 'peranan' will automatically default to 'komuniti' based on your migration
        ]);

        // 3. Return a success response
        return response()->json([
            'message' => 'Pendaftaran berjaya!',
            'user' => $user
        ], 201);
    }
    public function login(Request $request)
    {   
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json([
            'message' => 'Maklumat log masuk tidak sah.'
        ], 401);
    }

    $user = User::where('email', $request->email)->firstOrFail();
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Log masuk berjaya!',
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => $user
    ]);
    }
    public function updateProfile(Request $request)
    {
        $user = $request->user(); // Get the currently logged-in user

        // Validate the incoming data
        $request->validate([
            'no_telefon' => 'required|string',
            'alamat_1' => 'nullable|string',
            'alamat_2' => 'nullable|string',
            'poskod' => 'nullable|string|max:5',
            'bandar' => 'nullable|string',
            'negeri' => 'nullable|string',
        ]);

        // Update the user's records in the database
        $user->update($request->only([
            'no_telefon', 
            'alamat_1', 
            'alamat_2', 
            'poskod', 
            'bandar', 
            'negeri'
        ]));

        return response()->json([
            'message' => 'Profil berjaya dikemaskini', 
            'user' => $user
        ]);
    }
    // --- FUNGSI PENGURUSAN PENGGUNA ADMIN ---
    public function getAllUsers(Request $request)
    {
        if ($request->user()->peranan !== 'pentadbir') return response()->json(['message' => 'Akses Ditolak'], 403);
        // Tarik semua pengguna, susun dari yang terbaru
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json($users);
    }

    public function createUser(Request $request)
    {
        if ($request->user()->peranan !== 'pentadbir') return response()->json(['message' => 'Akses Ditolak'], 403);

        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'peranan' => 'required|string',
            'no_telefon' => 'nullable|string'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Hash::make($request->password),
            'peranan' => $request->peranan,
            'no_telefon' => $request->no_telefon
        ]);

        return response()->json(['message' => 'Pengguna ditambah', 'user' => $user]);
    }

    public function updateUser(Request $request, $id)
    {
        if ($request->user()->peranan !== 'pentadbir') return response()->json(['message' => 'Akses Ditolak'], 403);

        $user = User::findOrFail($id);
        
        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'peranan' => $request->peranan,
            'no_telefon' => $request->no_telefon
        ];

        // Jika admin masukkan password baru, kemaskininya
        if (!empty($request->password)) {
            $data['password'] = \Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(['message' => 'Pengguna dikemaskini', 'user' => $user]);
    }
}