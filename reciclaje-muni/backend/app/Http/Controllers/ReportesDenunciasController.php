<?php

namespace App\Http\Controllers;


use App\Application\Services\ReportesDenunciasService;

class ReportesDenunciasController extends Controller
{
    public function __construct(private ReportesDenunciasService $service) {}

    public function resumen()
    {
        return response()->json($this->service->resumen());
    }

    public function tiempoPromedio()
    {
        return response()->json($this->service->tiempoPromedio());
    }

    public function porZona()
    {
        return response()->json($this->service->porZona());
    }
}
