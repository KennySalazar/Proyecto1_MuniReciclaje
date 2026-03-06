<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Direccion;
use App\Application\Services\PuntoReciclajeService;

class PuntoReciclajeController extends Controller
{
    public function __construct(private PuntoReciclajeService $service) {}

    public function index()
    {
        return response()->json($this->service->list());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string'],
            'direccion' => ['required', 'string'],
            'latitud' => ['required', 'numeric'],
            'longitud' => ['required', 'numeric'],
            'capacidad_total_m3' => ['required', 'numeric'],
            'horario' => ['required', 'string'],
            'encargado' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) {
                    $existe = DB::table('reciclaje.usuario')
                        ->where('id', $value)
                        ->exists();

                    if (!$existe) {
                        $fail('El operador seleccionado no existe.');
                    }
                },
            ],
        ]);

        return DB::transaction(function () use ($data) {
            $direccion = Direccion::create([
                'id_calle' => 1,
                'referencia' => $data['direccion'],
            ]);

            $payload = [
                'nombre' => $data['nombre'],
                'latitud' => $data['latitud'],
                'longitud' => $data['longitud'],
                'capacidad_m3' => $data['capacidad_total_m3'],
                'horario_atencion' => $data['horario'],
                'id_usuario_encargado' => $data['encargado'],
                'id_direccion' => $direccion->id,
            ];

            $punto = $this->service->create($payload);

            return response()->json($punto, 201);
        });
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'nombre' => ['sometimes', 'string'],
            'direccion' => ['sometimes', 'string'],
            'latitud' => ['sometimes', 'numeric'],
            'longitud' => ['sometimes', 'numeric'],
            'capacidad_total_m3' => ['sometimes', 'numeric'],
            'horario' => ['sometimes', 'string'],
            'encargado' => [
                'sometimes',
                'integer',
                function ($attribute, $value, $fail) {
                    $existe = DB::table('reciclaje.usuario')
                        ->where('id', $value)
                        ->exists();

                    if (!$existe) {
                        $fail('El operador seleccionado no existe.');
                    }
                },
            ],
        ]);

        $payload = [];

        if (array_key_exists('nombre', $data)) {
            $payload['nombre'] = $data['nombre'];
        }

        if (array_key_exists('latitud', $data)) {
            $payload['latitud'] = $data['latitud'];
        }

        if (array_key_exists('longitud', $data)) {
            $payload['longitud'] = $data['longitud'];
        }

        if (array_key_exists('capacidad_total_m3', $data)) {
            $payload['capacidad_m3'] = $data['capacidad_total_m3'];
        }

        if (array_key_exists('horario', $data)) {
            $payload['horario_atencion'] = $data['horario'];
        }

        if (array_key_exists('encargado', $data)) {
            $payload['id_usuario_encargado'] = $data['encargado'];
        }

        return response()->json(
            $this->service->update($id, $payload)
        );
    }

    public function destroy($id)
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Punto verde eliminado'
        ]);
    }
}
