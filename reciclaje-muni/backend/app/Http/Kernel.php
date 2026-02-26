<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $middleware = [];

    protected $middlewareAliases = [
        'role' => \App\Http\Middleware\RoleMiddleware::class,
    ];

    protected $middlewareGroups = [
        'web' => [ /* ... */],
        'api' => [ /* ... */],
    ];
}
