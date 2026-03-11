<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Application\Services\DenunciaService;

class DenunciaController extends Controller
{
    public function __construct(private DenunciaService $service) {}

    public function catalogos()
    {
        return response()->json($this->service->catalogos());
    }

    public function storeCiudadano(Request $request)
    {
        $data = $request->validate([
            'descripcion' => ['required', 'string', 'max:300'],
            'id_tamano_basurero' => ['required', 'integer'],
            'latitud' => ['required', 'numeric'],
            'longitud' => ['required', 'numeric'],
            'foto' => ['nullable', 'image', 'max:4096'],
            'id_zona' => ['required', 'integer', 'exists:zona,id'],
        ]);

        return response()->json(
            $this->service->crearDenuncia($data, $request->user(), $request->file('foto')),
            201
        );
    }

    public function misDenuncias(Request $request)
    {
        return response()->json(
            $this->service->listarCiudadano($request->user()->id_ciudadano)
        );
    }

    public function index()
    {
        return response()->json($this->service->listarTodas());
    }

    public function show($id)
    {
        return response()->json($this->service->detalle($id));
    }

    public function cambiarEstado(Request $request, $id)
    {
        $data = $request->validate([
            'id_estado_denuncia' => ['required', 'integer'],
        ]);

        return response()->json(
            $this->service->cambiarEstado($id, $data['id_estado_denuncia'])
        );
    }

    public function asignarCuadrilla(Request $request)
    {
        $data = $request->validate([
            'id_formulario' => ['required', 'integer'],
            'id_cuadrilla' => ['required', 'integer'],
            'fecha_programada' => ['nullable', 'date'],
            'recursos_estimados' => ['nullable', 'string', 'max:250'],
            'observacion' => ['nullable', 'string', 'max:250'],
        ]);

        return response()->json(
            $this->service->asignarCuadrilla($data),
            201
        );
    }

    public function subirFoto(Request $request, $id)
    {
        $data = $request->validate([
            'tipo_foto' => ['required', 'string'],
            'foto' => ['required', 'image', 'max:4096'],
        ]);

        return response()->json(
            $this->service->subirFotoSeguimiento($id, $data['tipo_foto'], $request->file('foto')),
            201
        );
    }
}
