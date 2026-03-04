<?php

namespace App\Http\Controllers;

use App\Application\Services\RutaService;
use Illuminate\Http\Request;

class RutaController extends Controller
{
    public function __construct(private RutaService $rutaService) {}

    public function index()
    {
        return response()->json($this->rutaService->listar());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'dias_asignados' => 'required|string|max:100',
            'horario' => 'required|string|max:50',
            'tipo_residuo' => 'required|in:ORGANICO,INORGANICO,MIXTO',
            'distancia_km' => 'required|numeric|min:0',
            'coordenadas' => 'required|array|min:2',
            'coordenadas.*.lat' => 'required|numeric',
            'coordenadas.*.lng' => 'required|numeric',
            'coordenadas.*.orden' => 'nullable|integer|min:1',
        ]);

        $created = $this->rutaService->crear($validated);
        return response()->json(['message' => 'Ruta creada', 'data' => $created], 201);
    }
}
