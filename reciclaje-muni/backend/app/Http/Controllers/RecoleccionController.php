<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Application\Services\RecoleccionService;
use Illuminate\Support\Facades\Auth;

class RecoleccionController extends Controller
{
    public function __construct(private RecoleccionService $service) {}


    public function iniciar(Request $request)
    {
        $data = $request->validate([
            'id_asignacion' => ['required', 'integer'],
        ]);

        return response()->json($this->service->iniciar($data['id_asignacion']), 201);
    }


    public function ping(Request $request, $id)
    {
        $data = $request->validate([
            'lat_actual' => ['nullable', 'numeric'],
            'lng_actual' => ['nullable', 'numeric'],
            'punto_actual' => ['nullable', 'integer'],
        ]);

        return response()->json($this->service->ping($id, $data));
    }


    public function addIncidencia(Request $request, $id)
    {
        $data = $request->validate([
            'tipo' => ['required', 'string', 'max:50'],
            'detalle' => ['required', 'string', 'max:300'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
        ]);

        return response()->json($this->service->agregarIncidencia($id, $data));
    }


    public function finalizar(Request $request, $id)
    {
        $data = $request->validate([
            'estado' => ['required', 'in:COMPLETADA,INCOMPLETA'],
            'toneladas' => ['required', 'numeric', 'min:0'],
            'observaciones' => ['nullable', 'string', 'max:300'],
        ]);

        return response()->json($this->service->finalizar($id, $data));
    }
    public function show($id)
    {
        return response()->json(\App\Models\Recoleccion::findOrFail($id));
    }

    public function resolverIncidencia(Request $request, $id, $idx)
    {
        $data = $request->validate([
            'resolucion' => ['required', 'string', 'max:300'],
        ]);

        $rec = \App\Models\Recoleccion::findOrFail($id);
        $arr = json_decode($rec->incidencias ?: '[]', true);
        if (!is_array($arr)) $arr = [];

        $i = (int)$idx;
        if (!isset($arr[$i])) {
            return response()->json(['message' => 'Incidencia no existe'], 404);
        }

        $arr[$i]['resuelta'] = true;
        $arr[$i]['resuelta_en'] = now()->format('Y-m-d H:i:s');
        $arr[$i]['resuelta_por'] = optional(\Illuminate\Support\Facades\Auth::user())->email ?? 'COORDINADOR';
        $arr[$i]['resolucion'] = $data['resolucion'];

        $rec->incidencias = json_encode($arr);

        $hayBloqueantePend = false;
        foreach ($arr as $inc) {
            if (!empty($inc['bloqueante']) && empty($inc['resuelta'])) {
                $hayBloqueantePend = true;
                break;
            }
        }

        if (!$hayBloqueantePend && $rec->estado === 'INCOMPLETA') {
            $rec->estado = 'EN_PROCESO';

            if (!$rec->hora_inicio) $rec->hora_inicio = now();
        }

        $rec->updated_at = now();
        $rec->save();

        return response()->json($rec);
    }
}
