<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateMobileToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json([
                'message' => 'Token de autenticação em falta.',
            ], 401);
        }

        $user = User::where('mobile_api_token', hash('sha256', $token))->first();

        if (! $user) {
            return response()->json([
                'message' => 'Token de autenticação inválido.',
            ], 401);
        }

        $request->setUserResolver(static fn () => $user);

        return $next($request);
    }
}
