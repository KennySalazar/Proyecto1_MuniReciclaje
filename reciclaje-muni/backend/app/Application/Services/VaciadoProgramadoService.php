<?php

namespace App\Application\Services;

use App\Models\VaciadoProgramado;
use App\Models\NotificacionEstado;
use Illuminate\Support\Facades\DB;

class VaciadoProgramadoService
{
    public function list()
    {
        return DB::table('reciclaje.vaciado_programado as vp')
            ->join('reciclaje.contenedor as c', 'c.id', '=', 'vp.id_contenedor')
            ->join('reciclaje.tipo_material as tm', 'tm.id', '=', 'c.id_tipo_material')
            ->join('reciclaje.punto_reciclaje as pr', 'pr.id', '=', 'c.id_punto_reciclaje')
            ->leftJoin('reciclaje.usuario as u', 'u.id', '=', 'vp.id_usuario_responsable')
            ->select(
                'vp.id',
                'vp.id_contenedor',
                'vp.id_usuario_responsable',
                'vp.hora_fecha',
                'vp.estado',
                'vp.observacion',
                'tm.nombre_tipo',
                'pr.nombre as punto_verde',
                'u.nombre as responsable'
            )
            ->orderBy('vp.hora_fecha')
            ->get();
    }

    public function create(array $data)
    {
        return VaciadoProgramado::create($data);
    }

    public function updateEstado($id, $estado, $observacion = null)
    {
        return DB::transaction(function () use ($id, $estado, $observacion) {
            $v = VaciadoProgramado::findOrFail($id);
            $v->estado = $estado;

            if ($observacion !== null) {
                $v->observacion = $observacion;
            }

            $v->save();

            if ($estado === 'COMPLETADO') {
                NotificacionEstado::query()
                    ->where('id_contenedor', $v->id_contenedor)
                    ->where('leida_bool', false)
                    ->update([
                        'leida_bool' => true
                    ]);
            }

            return $v;
        });
    }
}
