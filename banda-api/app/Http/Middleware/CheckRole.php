<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     * Usage in routes: ->middleware('role:pentadbir')
     *                  ->middleware('role:pegawai,pentadbir')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user() || !in_array($request->user()->peranan, $roles)) {
            return response()->json([
                'message' => 'Akses Ditolak. Anda tidak mempunyai kebenaran untuk tindakan ini.'
            ], 403);
        }

        return $next($request);
    }
}
