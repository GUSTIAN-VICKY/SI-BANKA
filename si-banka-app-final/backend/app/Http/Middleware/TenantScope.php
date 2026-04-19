<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * TenantScope Middleware
 * 
 * This middleware ensures that users can only access data
 * within their assigned Bank Sampah (tenant).
 * 
 * Super Admin Kota can access all data across all tenants.
 */
class TenantScope
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If not authenticated, let other middleware handle it
        if (!$user) {
            return $next($request);
        }

        // Super Admin Kota has unrestricted access
        if ($user->isSuperAdminKota()) {
            return $next($request);
        }

        // For other roles, verify they have a bank_sampah_id
        if (!$user->bank_sampah_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun Anda belum terhubung ke Bank Sampah manapun. Hubungi administrator.'
            ], 403);
        }

        // Allow the request to proceed
        // The controllers will handle the actual scoping of data
        return $next($request);
    }
}
