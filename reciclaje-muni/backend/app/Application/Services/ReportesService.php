<?php

namespace App\Application\Services;

use Illuminate\Support\Facades\DB;

class ReportesService
{
    public function estados(): array
    {
        $rows = DB::table('reciclaje.recoleccion')
            ->select('estado', DB::raw('COUNT(*)::int as total'))
            ->groupBy('estado')
            ->orderBy('estado')
            ->get();

        return $rows->map(fn($x) => [
            'estado' => $x->estado,
            'total' => (int)$x->total,
        ])->values()->all();
    }

    public function basuraPorRuta(): array
    {
        $rows = DB::table('reciclaje.recoleccion as r')
            ->join('reciclaje.asignacion_camion_ruta as a', 'a.id', '=', 'r.id_asignacion_camion_ruta')
            ->join('reciclaje.ruta as ru', 'ru.id', '=', 'a.id_ruta')
            ->leftJoin('reciclaje.basura as b', 'b.id', '=', 'r.id_basura')
            ->where('r.estado', 'COMPLETADA')
            ->select([
                'ru.nombre as ruta',
                DB::raw('COALESCE(SUM(b.peso_toneladas), 0)::float as total_toneladas')
            ])
            ->groupBy('ru.nombre')
            ->orderByDesc(DB::raw('COALESCE(SUM(b.peso_toneladas), 0)'))
            ->get();

        return $rows->map(fn($x) => [
            'ruta' => $x->ruta,
            'total_toneladas' => round((float)$x->total_toneladas, 2),
        ])->values()->all();
    }

    public function camiones(): array
    {
        $rows = DB::table('reciclaje.recoleccion as r')
            ->join('reciclaje.asignacion_camion_ruta as a', 'a.id', '=', 'r.id_asignacion_camion_ruta')
            ->join('reciclaje.camion as c', 'c.id', '=', 'a.id_camion')
            ->select([
                'c.placa',
                DB::raw('COUNT(*)::int as total_recolecciones'),
            ])
            ->groupBy('c.placa')
            ->orderByDesc(DB::raw('COUNT(*)'))
            ->get();

        return $rows->map(fn($x) => [
            'placa' => $x->placa,
            'total_recolecciones' => (int)$x->total_recolecciones,
        ])->values()->all();
    }

    public function incidencias(): array
    {
        $rows = DB::table('reciclaje.recoleccion')
            ->select(['id', 'incidencias'])
            ->whereNotNull('incidencias')
            ->get();

        $countByTipo = [];

        foreach ($rows as $r) {
            $arr = [];
            try {
                $arr = json_decode($r->incidencias ?: '[]', true);
                if (!is_array($arr)) $arr = [];
            } catch (\Throwable $e) {
                $arr = [];
            }

            foreach ($arr as $inc) {
                $tipo = strtoupper(trim((string)($inc['tipo'] ?? 'OTRA')));
                if ($tipo === '') $tipo = 'OTRA';
                $countByTipo[$tipo] = ($countByTipo[$tipo] ?? 0) + 1;
            }
        }
        arsort($countByTipo);

        $out = [];
        foreach ($countByTipo as $tipo => $total) {
            $out[] = ['tipo' => $tipo, 'total' => (int)$total];
        }

        return $out;
    }

    public function eficiencia(): array
    {
        $completadas = (int) DB::table('reciclaje.recoleccion')
            ->where('estado', 'COMPLETADA')
            ->count();

        $incompletas = (int) DB::table('reciclaje.recoleccion')
            ->where('estado', 'INCOMPLETA')
            ->count();

        return [
            'completadas' => $completadas,
            'incompletas' => $incompletas,
        ];
    }
}
