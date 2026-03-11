<?php

namespace App\Application\Services;

use App\Mail\EstadoDenunciaMail;
use App\Models\AsignacionDenuncia;
use App\Models\Basurero;
use App\Models\Coordenada;
use App\Models\Formulario;
use App\Models\Foto;
use App\Models\NotificacionDenuncia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class DenunciaService
{
    public function catalogos()
    {
        return [
            'tamanos' => DB::table('reciclaje.tamano')
                ->select('id', 'tipo_nombre', 'descripcion')
                ->orderBy('id')
                ->get(),

            'estados' => DB::table('reciclaje.estado_denuncia')
                ->select('id', 'nombre_estado')
                ->orderBy('id')
                ->get(),

            'cuadrillas' => DB::table('reciclaje.cuadrilla')
                ->where('estado', 'ACTIVA')
                ->select('id', 'nombre', 'estado', 'disponibilidad')
                ->orderBy('nombre')
                ->get(),

            'zonas' => DB::table('reciclaje.zona')
                ->select('id', 'nombre')
                ->orderBy('nombre')
                ->get(),
        ];
    }

    public function crearDenuncia(array $data, ?object $usuario, $fotoArchivo = null)
    {
        return DB::transaction(function () use ($data, $usuario, $fotoArchivo) {
            $estadoRecibida = DB::table('reciclaje.estado_denuncia')
                ->where('nombre_estado', 'RECIBIDA')
                ->first();

            $coordenada = Coordenada::create([
                'latitud' => $data['latitud'],
                'longitud' => $data['longitud'],
            ]);

            $basurero = Basurero::create([
                'id_coordenada' => $coordenada->id,
                'id_tamano_basurero' => $data['id_tamano_basurero'],
            ]);

            $formulario = Formulario::create([
                'id_basurero' => $basurero->id,
                'id_ciudadano' => $usuario?->id_ciudadano,
                'id_estado_denuncia' => $estadoRecibida->id,
                'id_zona' => $data['id_zona'],
                'descripcion' => $data['descripcion'],
                'fecha_denuncia' => now()->toDateString(),
            ]);

            if ($fotoArchivo) {
                $path = $fotoArchivo->store('denuncias', 'public');

                Foto::create([
                    'id_formulario' => $formulario->id,
                    'tipo_foto' => 'EVIDENCIA',
                    'ruta_archivo' => $path,
                    'fecha' => now()->toDateString(),
                ]);
            }

            NotificacionDenuncia::create([
                'id_formulario' => $formulario->id,
                'mensaje' => 'Denuncia recibida correctamente.',
                'enviada_bool' => false,
            ]);

            return $this->detalle($formulario->id);
        });
    }
    public function listarCiudadano($idCiudadano)
    {
        return DB::table('reciclaje.formulario as f')
            ->join('reciclaje.basurero as b', 'b.id', '=', 'f.id_basurero')
            ->leftJoin('reciclaje.coordenada as c', 'c.id', '=', 'b.id_coordenada')
            ->leftJoin('reciclaje.tamano as t', 't.id', '=', 'b.id_tamano_basurero')
            ->join('reciclaje.estado_denuncia as ed', 'ed.id', '=', 'f.id_estado_denuncia')
            ->leftJoin('reciclaje.asignacion_denuncia as ad', 'ad.id_formulario', '=', 'f.id')
            ->leftJoin('reciclaje.cuadrilla as cu', 'cu.id', '=', 'ad.id_cuadrilla')

            ->leftJoin('reciclaje.foto as fe', function ($join) {
                $join->on('fe.id_formulario', '=', 'f.id')
                    ->where('fe.tipo_foto', '=', 'EVIDENCIA');
            })
            ->leftJoin('reciclaje.foto as fa', function ($join) {
                $join->on('fa.id_formulario', '=', 'f.id')
                    ->where('fa.tipo_foto', '=', 'ANTES');
            })
            ->leftJoin('reciclaje.foto as fd', function ($join) {
                $join->on('fd.id_formulario', '=', 'f.id')
                    ->where('fd.tipo_foto', '=', 'DESPUES');
            })

            ->where('f.id_ciudadano', $idCiudadano)
            ->select(
                'f.id',
                'f.descripcion',
                'f.fecha_denuncia',
                'ed.nombre_estado',
                't.tipo_nombre as tamano',
                'c.latitud',
                'c.longitud',
                'cu.nombre as cuadrilla',
                'ad.fecha_programada',
                'ad.recursos_estimados',
                'ad.observacion',
                'fe.ruta_archivo as foto_evidencia',
                'fa.ruta_archivo as foto_antes',
                'fd.ruta_archivo as foto_despues'
            )
            ->orderByDesc('f.id')
            ->get();
    }

    public function listarTodas()
    {
        return DB::table('reciclaje.formulario as f')
            ->join('reciclaje.basurero as b', 'b.id', '=', 'f.id_basurero')
            ->leftJoin('reciclaje.coordenada as c', 'c.id', '=', 'b.id_coordenada')
            ->leftJoin('reciclaje.tamano as t', 't.id', '=', 'b.id_tamano_basurero')
            ->join('reciclaje.estado_denuncia as ed', 'ed.id', '=', 'f.id_estado_denuncia')
            ->leftJoin('reciclaje.ciudadano as ci', 'ci.id', '=', 'f.id_ciudadano')
            ->leftJoin('reciclaje.asignacion_denuncia as ad', 'ad.id_formulario', '=', 'f.id')
            ->leftJoin('reciclaje.cuadrilla as cu', 'cu.id', '=', 'ad.id_cuadrilla')

            ->leftJoin('reciclaje.foto as fe', function ($join) {
                $join->on('fe.id_formulario', '=', 'f.id')
                    ->where('fe.tipo_foto', '=', 'EVIDENCIA');
            })
            ->leftJoin('reciclaje.foto as fa', function ($join) {
                $join->on('fa.id_formulario', '=', 'f.id')
                    ->where('fa.tipo_foto', '=', 'ANTES');
            })
            ->leftJoin('reciclaje.foto as fd', function ($join) {
                $join->on('fd.id_formulario', '=', 'f.id')
                    ->where('fd.tipo_foto', '=', 'DESPUES');
            })

            ->select(
                'f.id',
                'f.descripcion',
                'f.fecha_denuncia',
                'ed.nombre_estado',
                't.tipo_nombre as tamano',
                'c.latitud',
                'c.longitud',
                'ci.nombre',
                'ci.apellido',
                'ci.email',
                'ci.telefono',
                'cu.nombre as cuadrilla',
                'ad.fecha_programada',
                'ad.recursos_estimados',
                'ad.observacion',
                'fe.ruta_archivo as foto_evidencia',
                'fa.ruta_archivo as foto_antes',
                'fd.ruta_archivo as foto_despues'
            )
            ->orderByDesc('f.id')
            ->get();
    }

    public function detalle($id)
    {
        $denuncia = DB::table('reciclaje.formulario as f')
            ->join('reciclaje.basurero as b', 'b.id', '=', 'f.id_basurero')
            ->leftJoin('reciclaje.coordenada as c', 'c.id', '=', 'b.id_coordenada')
            ->leftJoin('reciclaje.tamano as t', 't.id', '=', 'b.id_tamano_basurero')
            ->join('reciclaje.estado_denuncia as ed', 'ed.id', '=', 'f.id_estado_denuncia')
            ->leftJoin('reciclaje.ciudadano as ci', 'ci.id', '=', 'f.id_ciudadano')
            ->where('f.id', $id)
            ->select(
                'f.id',
                'f.id_ciudadano',
                'f.descripcion',
                'f.fecha_denuncia',
                'ed.nombre_estado',
                't.tipo_nombre as tamano',
                'c.latitud',
                'c.longitud',
                'ci.nombre',
                'ci.apellido',
                'ci.email',
                'ci.telefono'
            )
            ->first();

        $fotos = DB::table('reciclaje.foto')
            ->where('id_formulario', $id)
            ->select('id', 'tipo_foto', 'ruta_archivo', 'fecha')
            ->orderBy('id')
            ->get();

        $asignacion = DB::table('reciclaje.asignacion_denuncia as ad')
            ->join('reciclaje.cuadrilla as c', 'c.id', '=', 'ad.id_cuadrilla')
            ->where('ad.id_formulario', $id)
            ->select(
                'ad.id',
                'ad.fecha_programada',
                'ad.recursos_estimados',
                'ad.observacion',
                'c.nombre as cuadrilla'
            )
            ->orderByDesc('ad.id')
            ->first();

        return [
            'denuncia' => $denuncia,
            'fotos' => $fotos,
            'asignacion' => $asignacion,
        ];
    }

    public function cambiarEstado($idFormulario, $idEstado)
    {
        $estado = DB::table('reciclaje.estado_denuncia')
            ->where('id', $idEstado)
            ->first();

        DB::table('reciclaje.formulario')
            ->where('id', $idFormulario)
            ->update([
                'id_estado_denuncia' => $idEstado,
            ]);

        $mensaje = 'La denuncia cambió al estado: ' . $estado->nombre_estado;

        NotificacionDenuncia::create([
            'id_formulario' => $idFormulario,
            'mensaje' => $mensaje,
            'enviada_bool' => false,
        ]);

        $ciudadano = DB::table('reciclaje.formulario as f')
            ->leftJoin('reciclaje.ciudadano as c', 'c.id', '=', 'f.id_ciudadano')
            ->where('f.id', $idFormulario)
            ->select('c.email', 'c.nombre', 'c.apellido')
            ->first();

        if ($ciudadano && $ciudadano->email) {
            Mail::to($ciudadano->email)->send(
                new EstadoDenunciaMail(
                    'Actualización de denuncia ciudadana',
                    $mensaje
                )
            );

            DB::table('reciclaje.notificacion_denuncia')
                ->where('id_formulario', $idFormulario)
                ->where('mensaje', $mensaje)
                ->update(['enviada_bool' => true]);
        }

        return $this->detalle($idFormulario);
    }

    public function asignarCuadrilla(array $data)
    {
        return DB::transaction(function () use ($data) {
            $cuadrilla = DB::table('reciclaje.cuadrilla')
                ->where('id', $data['id_cuadrilla'])
                ->first();

            $asignacion = AsignacionDenuncia::create([
                'id_formulario' => $data['id_formulario'],
                'id_cuadrilla' => $data['id_cuadrilla'],
                'fecha_programada' => $data['fecha_programada'] ?? null,
                'recursos_estimados' => $data['recursos_estimados'] ?? null,
                'observacion' => $data['observacion'] ?? null,
            ]);

            $estadoAsignada = DB::table('reciclaje.estado_denuncia')
                ->where('nombre_estado', 'ASIGNADA')
                ->first();

            DB::table('reciclaje.formulario')
                ->where('id', $data['id_formulario'])
                ->update([
                    'id_estado_denuncia' => $estadoAsignada->id,
                ]);

            $mensaje = 'La denuncia fue asignada a la cuadrilla: ' . $cuadrilla->nombre;

            NotificacionDenuncia::create([
                'id_formulario' => $data['id_formulario'],
                'mensaje' => $mensaje,
                'enviada_bool' => false,
            ]);

            $ciudadano = DB::table('reciclaje.formulario as f')
                ->leftJoin('reciclaje.ciudadano as c', 'c.id', '=', 'f.id_ciudadano')
                ->where('f.id', $data['id_formulario'])
                ->select('c.email')
                ->first();

            if ($ciudadano && $ciudadano->email) {
                Mail::to($ciudadano->email)->send(
                    new EstadoDenunciaMail(
                        'Cuadrilla asignada a tu denuncia',
                        $mensaje
                    )
                );

                DB::table('reciclaje.notificacion_denuncia')
                    ->where('id_formulario', $data['id_formulario'])
                    ->where('mensaje', $mensaje)
                    ->update(['enviada_bool' => true]);
            }

            return $asignacion;
        });
    }

    public function subirFotoSeguimiento($idFormulario, string $tipoFoto, $archivo)
    {
        $path = $archivo->store('denuncias', 'public');

        return Foto::create([
            'id_formulario' => $idFormulario,
            'tipo_foto' => $tipoFoto,
            'ruta_archivo' => $path,
            'fecha' => now()->toDateString(),
        ]);
    }
}
