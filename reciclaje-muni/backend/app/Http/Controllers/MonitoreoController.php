<?php

namespace App\Http\Controllers;

use App\Application\Services\MonitoreoService;

class MonitoreoController extends Controller
{
    public function __construct(private MonitoreoService $service) {}

    public function activas()
    {
        return response()->json($this->service->activas());
    }

    public function show($id)
    {
        return response()->json($this->service->show((int)$id));
    }

    public function simular($id)
    {
        return response()->json($this->service->simular((int)$id));
    }
}
