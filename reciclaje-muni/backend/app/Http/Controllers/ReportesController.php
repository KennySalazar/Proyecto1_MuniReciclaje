<?php

namespace App\Http\Controllers;

use App\Application\Services\ReportesService;

class ReportesController extends Controller
{
    public function __construct(private ReportesService $service) {}

    public function estados()
    {
        return response()->json(['data' => $this->service->estados()]);
    }

    public function basuraPorRuta()
    {
        return response()->json(['data' => $this->service->basuraPorRuta()]);
    }

    public function camiones()
    {
        return response()->json(['data' => $this->service->camiones()]);
    }

    public function incidencias()
    {
        return response()->json(['data' => $this->service->incidencias()]);
    }

    public function eficiencia()
    {
        return response()->json(['data' => $this->service->eficiencia()]);
    }
}
