<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Application\Services\PortalPublicoService;

class PortalPublicoController extends Controller
{
    public function __construct(private PortalPublicoService $service) {}

    public function rutas(Request $request)
    {
        return response()->json(
            $this->service->rutasPublicas(
                $request->query('zona'),
                $request->query('colonia')
            )
        );
    }

    public function filtros()
    {
        return response()->json($this->service->filtros());
    }
}
