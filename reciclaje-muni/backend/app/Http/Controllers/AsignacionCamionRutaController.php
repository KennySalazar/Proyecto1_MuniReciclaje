<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Application\Services\AsignacionService;

class AsignacionCamionRutaController extends Controller
{
    public function __construct(private AsignacionService $service) {}

    public function index()
    {
        return response()->json($this->service->list());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_camion' => ['required', 'integer'],
            'id_ruta' => ['required', 'integer'],
            'id_usuario_conductor' => ['nullable', 'integer'],
            'fecha' => ['required', 'date'],
        ]);

        return response()->json($this->service->create($data), 201);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'id_camion' => ['sometimes', 'integer'],
            'id_ruta' => ['sometimes', 'integer'],
            'id_usuario_conductor' => ['nullable', 'integer'],
            'fecha' => ['sometimes', 'date'],
        ]);

        return response()->json($this->service->update($id, $data));
    }

    public function destroy($id)
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Asignación eliminada'
        ]);
    }

    public function updateEstado(Request $request, $id)
    {
        $data = $request->validate([
            'estado' => ['required', 'string'],
        ]);

        return response()->json($this->service->updateEstado($id, $data['estado']));
    }
}
