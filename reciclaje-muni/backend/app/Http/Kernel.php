<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * Global middleware (API).
     */
    protected $middleware = [
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    /**
     * Middleware groups.
     */
    protected $middlewareGroups = [
        'api' => [
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    /**
     * Route middleware aliases.
     */
    protected $middlewareAliases = [
        // auth:sanctum lo registra Sanctum/Laravel internamente
        'role' => \App\Http\Middleware\RoleMiddleware::class,
    ];
}
