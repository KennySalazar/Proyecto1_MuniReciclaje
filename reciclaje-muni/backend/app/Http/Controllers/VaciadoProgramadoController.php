<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Application\Services\VaciadoProgramadoService;

class VaciadoProgramadoController extends Controller
{
    public function __construct(private VaciadoProgramadoService $service) {}

    public function index()
    {
        return response()->json($this->service->list());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_contenedor' => ['required', 'integer'],
            'id_usuario_responsable' => ['nullable', 'integer'],
            'hora_fecha' => ['required', 'date'],
            'estado' => ['nullable', 'string'],
            'observacion' => ['nullable', 'string', 'max:250'],
        ]);

        return response()->json(
            $this->service->create([
                'id_contenedor' => $data['id_contenedor'],
                'id_usuario_responsable' => $data['id_usuario_responsable'] ?? null,
                'hora_fecha' => $data['hora_fecha'],
                'estado' => $data['estado'] ?? 'PENDIENTE',
                'observacion' => $data['observacion'] ?? null,
            ]),
            201
        );
    }

    public function updateEstado(Request $request, $id)
    {
        $data = $request->validate([
            'estado' => ['required', 'string'],
            'observacion' => ['nullable', 'string', 'max:250'],
        ]);

        return response()->json(
            $this->service->updateEstado($id, $data['estado'], $data['observacion'] ?? null)
        );
    }
}
