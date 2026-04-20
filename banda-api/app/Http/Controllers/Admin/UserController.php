<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Get all users (pentadbir only).
     * Route: GET /api/admin/users
     */
    public function index()
    {
        $users = User::with('jabatan')->orderBy('created_at', 'desc')->get();
        return response()->json($users);
    }

    /**
     * Create a new user (pentadbir only).
     * Route: POST /api/admin/users
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users',
            'password'    => 'required|min:6',
            'peranan'     => 'required|in:komuniti,pentadbir,pegawai,kontraktor',
            'no_telefon'  => 'nullable|string|max:20',
            'id_jabatan'  => 'nullable|string|exists:jabatans,id_jabatan',
        ]);

        $user = User::create([
            'name'        => $request->name,
            'email'       => $request->email,
            'password'    => Hash::make($request->password),
            'peranan'     => $request->peranan,
            'no_telefon'  => $request->no_telefon,
            'id_jabatan'  => $request->id_jabatan,
        ]);

        return response()->json([
            'message' => 'Pengguna berjaya ditambah.',
            'user'    => $user
        ], 201);
    }

    /**
     * Update an existing user (pentadbir only).
     * Route: PUT /api/admin/users/{id}
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'       => 'sometimes|string|max:255',
            'email'      => 'sometimes|email|unique:users,email,' . $id,
            'peranan'    => 'sometimes|in:komuniti,pentadbir,pegawai,kontraktor',
            'no_telefon' => 'nullable|string|max:20',
            'password'   => 'nullable|string|min:6',
            'id_jabatan' => 'nullable|string|exists:jabatans,id_jabatan',
        ]);

        $data = $request->only(['name', 'email', 'peranan', 'no_telefon', 'id_jabatan']);

        if (!empty($request->password)) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Pengguna berjaya dikemaskini.',
            'user'    => $user
        ]);
    }

    /**
     * Delete a user (pentadbir only).
     * Route: DELETE /api/admin/users/{id}
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting own account
        if ($user->peranan === 'pentadbir') {
            $adminCount = User::where('peranan', 'pentadbir')->count();
            if ($adminCount <= 1) {
                return response()->json(['message' => 'Tidak boleh padam pentadbir terakhir.'], 422);
            }
        }

        $user->delete();
        return response()->json(['message' => 'Pengguna berjaya dipadam.']);
    }

    /**
     * Toggle active/inactive status.
     * Route: PATCH /api/admin/users/{id}/status
     */
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent admin from deactivating themselves
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Anda tidak boleh menyahaktifkan akaun anda sendiri.'], 403);
        }

        $user->status = $user->status === 'aktif' ? 'tidak_aktif' : 'aktif';
        $user->save();

        return response()->json([
            'message' => 'Status pengguna berjaya dikemaskini.', 
            'status' => $user->status
        ]);
    }
}
