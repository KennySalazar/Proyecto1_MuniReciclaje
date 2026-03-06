<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Application\Services\MaterialReciclajeService;

class MaterialReciclajeController extends Controller
{
    public function __construct(private MaterialReciclajeService $service) {}

    public function index()
    {
        return response()->json($this->service->list());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_punto_reciclaje' => ['required', 'integer'],
            'id_tipo_material' => ['required', 'integer'],
            'cantidad' => ['required', 'numeric', 'gt:0'],
            'fecha_entrega' => ['required', 'date'],
            'hora_entrega' => ['nullable', 'date_format:H:i'],
            'id_ciudadano' => ['nullable', 'integer'],
            'nombre_ciudadano' => ['required', 'string', 'max:150'],
        ]);

        $contenedor = DB::table('reciclaje.contenedor')
            ->where('id_punto_reciclaje', $data['id_punto_reciclaje'])
            ->where('id_tipo_material', $data['id_tipo_material'])
            ->first();

        if (!$contenedor) {
            return response()->json([
                'message' => 'No existe un contenedor configurado para ese punto verde y tipo de material.'
            ], 422);
        }
        $porcentaje = (float) $contenedor->porcentaje;
        $nivelActual = (float) $contenedor->nivel_actual;
        $capacidad = (float) $contenedor->capacidad_m3;

        if ($porcentaje >= 100) {
            return response()->json([
                'message' => 'El contenedor de ese tipo de material en ese punto verde ya está lleno. Debe vaciarse antes de registrar más material.'
            ], 422);
        }

        $tipoMaterial = DB::table('reciclaje.tipo_material')
            ->where('id', $data['id_tipo_material'])
            ->first();

        if (!$tipoMaterial || (float) $tipoMaterial->factor_kg_m3 <= 0) {
            return response()->json([
                'message' => 'El tipo de material no tiene factor de conversión configurado.'
            ], 422);
        }

        $espacioDisponible = $capacidad - $nivelActual;
        $volumenNuevo = (float) $data['cantidad'] * (float) $tipoMaterial->factor_kg_m3;

        if ($volumenNuevo > $espacioDisponible) {
            $maxKg = $espacioDisponible / (float) $tipoMaterial->factor_kg_m3;

            return response()->json([
                'message' => 'La cantidad ingresada supera la capacidad disponible del contenedor.',
                'max_kg_permitido' => round($maxKg, 2),
                'espacio_disponible_m3' => round($espacioDisponible, 2),
            ], 422);
        }

        $payload = [
            'id_ciudadano' => $data['id_ciudadano'] ?? null,
            'id_usuario_operador' => Auth::id(),
            'id_contenedor' => $contenedor->id,
            'cantidad' => $data['cantidad'],
            'fecha_entrega' => $data['fecha_entrega'],
            'hora_entrega' => $data['hora_entrega'] ?? null,
            'nombre_ciudadano' => $data['nombre_ciudadano'],
        ];

        return response()->json(
            $this->service->create($payload),
            201
        );
    }
}
