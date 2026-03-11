<?php

namespace App\Application\Services;

use Illuminate\Support\Facades\DB;

class ReportesDenunciasService
{
    public function resumen(): array
    {
        $atendidas = DB::table('reciclaje.formulario as f')
            ->join('reciclaje.estado_denuncia as ed', 'ed.id', '=', 'f.id_estado_denuncia')
            ->whereIn('ed.nombre_estado', ['ATENDIDA', 'CERRADA'])
            ->count();

        $pendientes = DB::table('reciclaje.formulario as f')
            ->join('reciclaje.estado_denuncia as ed', 'ed.id', '=', 'f.id_estado_denuncia')
            ->whereNotIn('ed.nombre_estado', ['ATENDIDA', 'CERRADA'])
            ->count();

        $total = $atendidas + $pendientes;

        return [
            'atendidas' => $atendidas,
            'pendientes' => $pendientes,
            'total' => $total,
        ];
    }

    public function tiempoPromedio(): array
    {
        $rows = DB::table('reciclaje.formulario as f')
            ->join('reciclaje.asignacion_denuncia as ad', 'ad.id_formulario', '=', 'f.id')
            ->join('reciclaje.estado_denuncia as ed', 'ed.id', '=', 'f.id_estado_denuncia')
            ->whereIn('ed.nombre_estado', ['ATENDIDA', 'CERRADA'])
            ->whereNotNull('ad.fecha_programada')
            ->selectRaw("
                AVG(
                    EXTRACT(DAY FROM (ad.fecha_programada::timestamp - f.fecha_denuncia::timestamp))
                ) as promedio_dias
            ")
            ->first();

        return [
            'promedio_dias' => round((float)($rows->promedio_dias ?? 0), 2),
        ];
    }

    public function porZona(): array
    {
        $rows = DB::table('reciclaje.formulario as f')
            ->leftJoin('reciclaje.zona as z', 'z.id', '=', 'f.id_zona')
            ->selectRaw("
            COALESCE(z.nombre, 'Sin zona') as zona,
            COUNT(f.id) as total_denuncias
        ")
            ->groupByRaw("COALESCE(z.nombre, 'Sin zona')")
            ->orderByRaw("COUNT(f.id) DESC")
            ->get();

        return $rows->map(fn($x) => [
            'zona' => $x->zona,
            'total_denuncias' => (int)$x->total_denuncias,
        ])->toArray();
    }
}
