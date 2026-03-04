<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Application\Services\CamionService;

class CamionController extends Controller
{

    private CamionService $service;

    public function __construct(CamionService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return response()->json($this->service->all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'placa' => 'required|string|max:20',
            'capacidad_carga' => 'required|numeric|min:0.1',
            'estado' => 'required|in:OPERATIVO,MANTENIMIENTO,FUERA_SERVICIO'
        ]);

        return response()->json($this->service->create($data));
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'placa' => 'sometimes|string|max:20',
            'capacidad_carga' => 'sometimes|numeric|min:0.1',
            'estado' => 'sometimes|in:OPERATIVO,MANTENIMIENTO,FUERA_SERVICIO'
        ]);

        return response()->json($this->service->update($id, $data));
    }

    public function destroy($id)
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Camion eliminado'
        ]);
    }

    public function updateEstado(Request $request, $id)
    {
        $data = $request->validate([
            'estado' => 'required|in:OPERATIVO,MANTENIMIENTO,FUERA_SERVICIO'
        ]);

        return response()->json($this->service->update($id, $data));
    }
}
