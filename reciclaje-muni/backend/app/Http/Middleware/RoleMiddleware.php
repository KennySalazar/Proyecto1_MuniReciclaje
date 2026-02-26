<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user || !$user->rol) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if (!in_array($user->rol->nombre, $roles)) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        return $next($request);
    }
}
