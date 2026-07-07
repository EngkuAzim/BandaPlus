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

        // Check if user is active
        if ($user->status === 'tidak_aktif') {
            $request->user()->currentAccessToken()?->delete(); // just in case
            Auth::guard('web')->logout();
            return response()->json([
                'message' => 'Akaun anda telah dinyahaktifkan oleh Pentadbir.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Log masuk berjaya!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            $token = \Illuminate\Support\Str::random(64);

            \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'email' => $user->email,
                    'token' => $token,
                    'created_at' => now()
                ]
            );

            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            $resetUrl = $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

            if (env('APP_ENV') === 'local') {
                \Illuminate\Support\Facades\Log::info('Password reset link: ' . $resetUrl);
            } else {
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\PasswordResetMail($resetUrl));
            }
        }

        // Always return success to prevent email enumeration
        return response()->json([
            'message' => 'Jika e-mel ini wujud, pautan tetapan semula kata laluan telah dihantar.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $resetRecord = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'message' => 'Token tidak sah atau e-mel tidak sepadan.'
            ], 400);
        }

        // Check if token is older than 60 minutes
        if (\Carbon\Carbon::parse($resetRecord->created_at)->addMinutes(60)->isPast()) {
            \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'Sila minta pautan baharu, token ini telah tamat tempoh.'
            ], 400);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'Pengguna tidak dijumpai.'
            ], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Kata laluan berjaya dikemas kini.'
        ]);
    }

    public function logout(Request $request)
    {
        // Revoke the current token
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Log keluar berjaya.']);
    }
}
