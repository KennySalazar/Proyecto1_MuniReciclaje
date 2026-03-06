<?php

namespace App\Application\Services;

use App\Models\MaterialReciclaje;
use Illuminate\Support\Facades\DB;

class MaterialReciclajeService
{
    public function list()
    {
        return DB::table('reciclaje.material_reciclaje as mr')
            ->join('reciclaje.contenedor as c', 'c.id', '=', 'mr.id_contenedor')
            ->join('reciclaje.tipo_material as tm', 'tm.id', '=', 'c.id_tipo_material')
            ->join('reciclaje.punto_reciclaje as pr', 'pr.id', '=', 'c.id_punto_reciclaje')
            ->leftJoin('reciclaje.usuario as u', 'u.id', '=', 'mr.id_usuario_operador')
            ->select(
                'mr.id',
                'mr.id_ciudadano',
                'mr.id_usuario_operador',
                'mr.id_contenedor',
                'mr.cantidad',
                'mr.fecha_entrega',
                'mr.hora_entrega',
                DB::raw("COALESCE(mr.nombre_ciudadano, 'Ciudadano') as nombre_ciudadano"),
                'tm.id as id_tipo_material',
                'tm.nombre_tipo',
                'pr.id as id_punto_reciclaje',
                'pr.nombre as punto_verde',
                'u.nombre as operador'
            )
            ->orderByDesc('mr.fecha_entrega')
            ->orderByDesc('mr.hora_entrega')
            ->get();
    }

    public function create(array $data)
    {
        return MaterialReciclaje::create($data);
    }
}
