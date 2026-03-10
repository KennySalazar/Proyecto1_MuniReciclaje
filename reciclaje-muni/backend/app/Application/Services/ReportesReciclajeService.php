<?php

namespace App\Application\Services;

use Illuminate\Support\Facades\DB;

class ReportesReciclajeService
{
    public function materialPorTipo()
    {
        return DB::table('reciclaje.material_reciclaje as mr')
            ->join('reciclaje.contenedor as c', 'c.id', '=', 'mr.id_contenedor')
            ->join('reciclaje.tipo_material as tm', 'tm.id', '=', 'c.id_tipo_material')
            ->select(
                'tm.id',
                'tm.nombre_tipo',
                DB::raw('COALESCE(SUM(mr.cantidad),0) as total_kg')
            )
            ->groupBy('tm.id', 'tm.nombre_tipo')
            ->orderByDesc('total_kg')
            ->get();
    }

    public function puntosVerdesActivos()
    {
        return DB::table('reciclaje.material_reciclaje as mr')
            ->join('reciclaje.contenedor as c', 'c.id', '=', 'mr.id_contenedor')
            ->join('reciclaje.punto_reciclaje as pr', 'pr.id', '=', 'c.id_punto_reciclaje')
            ->select(
                'pr.id',
                'pr.nombre',
                DB::raw('COUNT(mr.id) as total_entregas'),
                DB::raw('COALESCE(SUM(mr.cantidad),0) as total_kg')
            )
            ->groupBy('pr.id', 'pr.nombre')
            ->orderByDesc('total_kg')
            ->get();
    }

    public function tendenciasCiudadanas()
    {
        return DB::table('reciclaje.material_reciclaje as mr')
            ->select(
                'mr.fecha_entrega',
                DB::raw("
                COALESCE(NULLIF(TRIM(mr.nombre_ciudadano), ''), 'Ciudadano no identificado') as ciudadano
            "),
                DB::raw('COUNT(mr.id) as total_entregas'),
                DB::raw('COALESCE(SUM(mr.cantidad), 0) as total_kg')
            )
            ->groupBy('mr.fecha_entrega', 'mr.nombre_ciudadano')
            ->orderBy('mr.fecha_entrega')
            ->orderByDesc('total_kg')
            ->get();
    }

    public function comparativaMateriales()
    {
        return DB::table('reciclaje.material_reciclaje as mr')
            ->join('reciclaje.contenedor as c', 'c.id', '=', 'mr.id_contenedor')
            ->join('reciclaje.tipo_material as tm', 'tm.id', '=', 'c.id_tipo_material')
            ->select(
                'tm.nombre_tipo',
                DB::raw('COUNT(mr.id) as total_entregas'),
                DB::raw('COALESCE(SUM(mr.cantidad),0) as total_kg'),
                DB::raw('ROUND(COALESCE(AVG(mr.cantidad),0),2) as promedio_kg')
            )
            ->groupBy('tm.nombre_tipo')
            ->orderByDesc('total_kg')
            ->get();
    }
}
