<?php

namespace App\Application\Services;

use Illuminate\Support\Facades\DB;

class ReporteRecoleccionService
{
    public function porPeriodo(string $tipo): array
    {
        $tipo = strtolower($tipo);

        $expr = match ($tipo) {
            'dia' => "to_char(r.hora_fin::date, 'YYYY-MM-DD')",
            'semana' => "to_char(date_trunc('week', r.hora_fin), 'YYYY-MM-DD')",
            default => "to_char(date_trunc('month', r.hora_fin), 'YYYY-MM')",
        };

        $rows = DB::table('reciclaje.recoleccion as r')
            ->join('reciclaje.basura as b', 'b.id', '=', 'r.id_basura')
            ->whereIn('r.estado', ['COMPLETADA', 'INCOMPLETA'])
            ->whereNotNull('r.hora_fin')
            ->selectRaw("$expr as periodo, ROUND(SUM(COALESCE(b.peso_toneladas, 0)), 2) as total_toneladas")
            ->groupByRaw($expr)
            ->orderByRaw("$expr asc")
            ->get();

        return $rows->map(fn($x) => [
            'periodo' => $x->periodo,
            'total_toneladas' => (float) $x->total_toneladas,
        ])->toArray();
    }

    public function porZona(): array
    {
        $rows = DB::table('reciclaje.recoleccion as r')
            ->join('reciclaje.asignacion_camion_ruta as a', 'a.id', '=', 'r.id_asignacion_camion_ruta')
            ->join('reciclaje.ruta as ru', 'ru.id', '=', 'a.id_ruta')
            ->join('reciclaje.ruta_colonia as rc', 'rc.id_ruta', '=', 'ru.id')
            ->join('reciclaje.colonia as c', 'c.id', '=', 'rc.id_colonia')
            ->join('reciclaje.zona as z', 'z.id', '=', 'c.id_zona')
            ->join('reciclaje.basura as b', 'b.id', '=', 'r.id_basura')
            ->whereIn('r.estado', ['COMPLETADA', 'INCOMPLETA'])
            ->selectRaw("z.id, z.nombre as zona, ROUND(SUM(COALESCE(b.peso_toneladas,0)), 2) as total_toneladas")
            ->groupBy('z.id', 'z.nombre')
            ->orderBy('z.nombre')
            ->get();

        return $rows->map(fn($x) => [
            'id' => $x->id,
            'zona' => $x->zona,
            'total_toneladas' => (float) $x->total_toneladas,
        ])->toArray();
    }

    public function porColonia(): array
    {
        $rows = DB::table('reciclaje.recoleccion as r')
            ->join('reciclaje.asignacion_camion_ruta as a', 'a.id', '=', 'r.id_asignacion_camion_ruta')
            ->join('reciclaje.ruta as ru', 'ru.id', '=', 'a.id_ruta')
            ->join('reciclaje.ruta_colonia as rc', 'rc.id_ruta', '=', 'ru.id')
            ->join('reciclaje.colonia as c', 'c.id', '=', 'rc.id_colonia')
            ->join('reciclaje.zona as z', 'z.id', '=', 'c.id_zona')
            ->join('reciclaje.basura as b', 'b.id', '=', 'r.id_basura')
            ->whereIn('r.estado', ['COMPLETADA', 'INCOMPLETA'])
            ->selectRaw("c.id, c.nombre as colonia, z.nombre as zona, ROUND(SUM(COALESCE(b.peso_toneladas,0)), 2) as total_toneladas")
            ->groupBy('c.id', 'c.nombre', 'z.nombre')
            ->orderBy('c.nombre')
            ->get();

        return $rows->map(fn($x) => [
            'id' => $x->id,
            'colonia' => $x->colonia,
            'zona' => $x->zona,
            'total_toneladas' => (float) $x->total_toneladas,
        ])->toArray();
    }

    public function porRuta(): array
    {
        $rows = DB::table('reciclaje.recoleccion as r')
            ->join('reciclaje.asignacion_camion_ruta as a', 'a.id', '=', 'r.id_asignacion_camion_ruta')
            ->join('reciclaje.ruta as ru', 'ru.id', '=', 'a.id_ruta')
            ->join('reciclaje.basura as b', 'b.id', '=', 'r.id_basura')
            ->whereIn('r.estado', ['COMPLETADA', 'INCOMPLETA'])
            ->selectRaw("ru.id, ru.nombre as ruta, ROUND(SUM(COALESCE(b.peso_toneladas,0)), 2) as total_toneladas, COUNT(r.id) as total_recolecciones")
            ->groupBy('ru.id', 'ru.nombre')
            ->orderBy('ru.nombre')
            ->get();

        return $rows->map(fn($x) => [
            'id' => $x->id,
            'ruta' => $x->ruta,
            'total_toneladas' => (float) $x->total_toneladas,
            'total_recolecciones' => (int) $x->total_recolecciones,
        ])->toArray();
    }

    public function comparativaMensual(): array
    {
        $rows = DB::table('reciclaje.recoleccion as r')
            ->join('reciclaje.basura as b', 'b.id', '=', 'r.id_basura')
            ->whereIn('r.estado', ['COMPLETADA', 'INCOMPLETA'])
            ->whereNotNull('r.hora_fin')
            ->selectRaw("
                EXTRACT(YEAR FROM r.hora_fin) as anio,
                EXTRACT(MONTH FROM r.hora_fin) as mes,
                ROUND(SUM(COALESCE(b.peso_toneladas,0)), 2) as total_toneladas
            ")
            ->groupByRaw("EXTRACT(YEAR FROM r.hora_fin), EXTRACT(MONTH FROM r.hora_fin)")
            ->orderByRaw("EXTRACT(YEAR FROM r.hora_fin), EXTRACT(MONTH FROM r.hora_fin)")
            ->get();

        return $rows->map(fn($x) => [
            'anio' => (int) $x->anio,
            'mes' => (int) $x->mes,
            'total_toneladas' => (float) $x->total_toneladas,
        ])->toArray();
    }

    public function comparativaAnual(): array
    {
        $rows = DB::table('reciclaje.recoleccion as r')
            ->join('reciclaje.basura as b', 'b.id', '=', 'r.id_basura')
            ->whereIn('r.estado', ['COMPLETADA', 'INCOMPLETA'])
            ->whereNotNull('r.hora_fin')
            ->selectRaw("
                EXTRACT(YEAR FROM r.hora_fin) as anio,
                ROUND(SUM(COALESCE(b.peso_toneladas,0)), 2) as total_toneladas
            ")
            ->groupByRaw("EXTRACT(YEAR FROM r.hora_fin)")
            ->orderByRaw("EXTRACT(YEAR FROM r.hora_fin)")
            ->get();

        return $rows->map(fn($x) => [
            'anio' => (int) $x->anio,
            'total_toneladas' => (float) $x->total_toneladas,
        ])->toArray();
    }
}
