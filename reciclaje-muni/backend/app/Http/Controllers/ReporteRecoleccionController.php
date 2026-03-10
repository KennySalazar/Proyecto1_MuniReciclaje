<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Application\Services\ReporteRecoleccionService;

class ReporteRecoleccionController extends Controller
{
    public function __construct(private ReporteRecoleccionService $service) {}

    public function porPeriodo(Request $request)
    {
        $tipo = $request->query('tipo', 'mes');
        return response()->json($this->service->porPeriodo($tipo));
    }

    public function porZona()
    {
        return response()->json($this->service->porZona());
    }

    public function porColonia()
    {
        return response()->json($this->service->porColonia());
    }

    public function porRuta()
    {
        return response()->json($this->service->porRuta());
    }

    public function comparativaMensual()
    {
        return response()->json($this->service->comparativaMensual());
    }

    public function comparativaAnual()
    {
        return response()->json($this->service->comparativaAnual());
    }
}
