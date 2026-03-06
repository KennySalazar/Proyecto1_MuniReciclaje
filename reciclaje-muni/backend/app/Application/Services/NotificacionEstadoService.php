<?php

namespace App\Application\Services;

use App\Models\NotificacionEstado;
use Illuminate\Support\Facades\DB;

class NotificacionEstadoService
{
    public function list()
    {
        return DB::table('reciclaje.notificacion_estado as ne')
            ->join('reciclaje.contenedor as c', 'c.id', '=', 'ne.id_contenedor')
            ->join('reciclaje.tipo_material as tm', 'tm.id', '=', 'c.id_tipo_material')
            ->join('reciclaje.punto_reciclaje as pr', 'pr.id', '=', 'c.id_punto_reciclaje')
            ->select(
                'ne.id',
                'ne.id_contenedor',
                'ne.tipo_alerta',
                'ne.fecha_hora',
                'ne.mensaje',
                'ne.leida_bool',
                'tm.nombre_tipo',
                'pr.nombre as punto_verde'
            )
            ->where('ne.leida_bool', false)
            ->orderByDesc('ne.fecha_hora')
            ->get();
    }

    public function marcarLeida($id)
    {
        $n = NotificacionEstado::findOrFail($id);
        $n->leida_bool = true;
        $n->save();

        return $n;
    }
}
