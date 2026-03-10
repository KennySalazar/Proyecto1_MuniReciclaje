<?php

namespace App\Http\Controllers;

use App\Application\Services\ReportesReciclajeService;

class ReportesReciclajeController extends Controller
{
    public function __construct(private ReportesReciclajeService $service) {}

    public function materialPorTipo()
    {
        return response()->json($this->service->materialPorTipo());
    }

    public function puntosVerdesActivos()
    {
        return response()->json($this->service->puntosVerdesActivos());
    }

    public function tendenciasCiudadanas()
    {
        return response()->json($this->service->tendenciasCiudadanas());
    }

    public function comparativaMateriales()
    {
        return response()->json($this->service->comparativaMateriales());
    }
}
