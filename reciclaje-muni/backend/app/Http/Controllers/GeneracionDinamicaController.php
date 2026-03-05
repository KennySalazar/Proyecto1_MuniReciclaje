<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Application\Services\GeneracionDinamicaService;

class GeneracionDinamicaController extends Controller
{
    public function __construct(private GeneracionDinamicaService $service) {}

    public function index()
    {
        return response()->json($this->service->list());
    }

    public function show($id)
    {
        return response()->json($this->service->get($id));
    }

    public function generar(Request $request)
    {
        $data = $request->validate([
            'id_asignacion_camion_ruta' => ['required', 'integer'],
        ]);

        return response()->json(
            $this->service->generar($data['id_asignacion_camion_ruta']),
            201
        );
    }
}
