<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyLocalApiKey
{
    public function handle(Request $request, Closure $next)
    {
        $keyFromRequest = $request->header('X-API-KEY');
        $keyFromEnv = env('VITE_LOCAL_API_KEY');
        if (!$keyFromRequest || $keyFromRequest !== $keyFromEnv) {
            return response()->json(['message' => 'Unauthorized - Invalid API Key'], 401);
        }
        return $next($request);
    }
}
