<?php

namespace App\Application\Services;

use Illuminate\Support\Facades\DB;

class ContenedorService
{
    public function list($idPuntoReciclaje = null)
    {
        $q = DB::table('reciclaje.contenedor as c')
            ->join('reciclaje.tipo_material as tm', 'tm.id', '=', 'c.id_tipo_material')
            ->join('reciclaje.punto_reciclaje as pr', 'pr.id', '=', 'c.id_punto_reciclaje')
            ->leftJoin('reciclaje.notificacion_estado as ne', function ($join) {
                $join->on('ne.id_contenedor', '=', 'c.id')
                    ->whereRaw('ne.id = (
                        select ne2.id
                        from reciclaje.notificacion_estado ne2
                        where ne2.id_contenedor = c.id
                        order by ne2.fecha_hora desc
                        limit 1
                     )');
            })
            ->select(
                'c.id',
                'c.id_punto_reciclaje',
                'c.id_tipo_material',
                'c.porcentaje',
                'c.nivel_actual',
                'c.capacidad_m3',
                'tm.nombre_tipo',
                'tm.descripcion',
                'tm.factor_kg_m3',
                'pr.nombre as punto_verde',
                'ne.tipo_alerta',
                'ne.mensaje as ultima_alerta'
            )
            ->orderBy('pr.nombre')
            ->orderBy('tm.nombre_tipo');

        if ($idPuntoReciclaje) {
            $q->where('c.id_punto_reciclaje', $idPuntoReciclaje);
        }

        return $q->get();
    }
}
