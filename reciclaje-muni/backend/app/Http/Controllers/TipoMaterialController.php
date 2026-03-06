<?php

namespace App\Http\Controllers;

use App\Application\Services\TipoMaterialService;

class TipoMaterialController extends Controller
{
    public function __construct(private TipoMaterialService $service) {}

    public function index()
    {
        return response()->json($this->service->list());
    }
}
