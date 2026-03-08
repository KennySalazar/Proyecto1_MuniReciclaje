<?php

namespace App\Application\Services;

use Illuminate\Support\Facades\DB;

class PortalPublicoService
{
    public function rutasPublicas($zonaId = null, $coloniaId = null)
    {
        $rows = DB::table('reciclaje.ruta as r')
            ->leftJoin('reciclaje.ruta_colonia as rc', 'rc.id_ruta', '=', 'r.id')
            ->leftJoin('reciclaje.colonia as c', 'c.id', '=', 'rc.id_colonia')
            ->leftJoin('reciclaje.zona as z', 'z.id', '=', 'c.id_zona')
            ->when($zonaId, fn($q) => $q->where('z.id', $zonaId))
            ->when($coloniaId, fn($q) => $q->where('c.id', $coloniaId))
            ->select(
                'r.id',
                'r.nombre',
                'r.distancia',
                'r.dias_asignados',
                'r.horario',
                'r.tipo_residuo',
                'c.id as colonia_id',
                'c.nombre as colonia_nombre',
                'z.id as zona_id',
                'z.nombre as zona_nombre'
            )
            ->orderBy('r.nombre')
            ->get();

        $grouped = [];

        foreach ($rows as $row) {
            if (!isset($grouped[$row->id])) {
                $coords = DB::table('reciclaje.ruta_coordenada as rc')
                    ->join('reciclaje.coordenada as co', 'co.id', '=', 'rc.id_coordenada')
                    ->where('rc.id_ruta', $row->id)
                    ->orderBy('co.orden')
                    ->get([
                        'co.id',
                        'co.latitud as lat',
                        'co.longitud as lng',
                        'co.orden'
                    ]);

                $grouped[$row->id] = [
                    'id' => $row->id,
                    'nombre' => $row->nombre,
                    'distancia' => $row->distancia,
                    'dias_asignados' => $row->dias_asignados,
                    'horario' => $row->horario,
                    'tipo_residuo' => $row->tipo_residuo,
                    'colonias' => [],
                    'zonas' => [],
                    'coordenadas' => $coords,
                ];
            }

            if ($row->colonia_id) {
                $yaColonia = collect($grouped[$row->id]['colonias'])->firstWhere('id', $row->colonia_id);
                if (!$yaColonia) {
                    $grouped[$row->id]['colonias'][] = [
                        'id' => $row->colonia_id,
                        'nombre' => $row->colonia_nombre,
                    ];
                }
            }

            if ($row->zona_id) {
                $yaZona = collect($grouped[$row->id]['zonas'])->firstWhere('id', $row->zona_id);
                if (!$yaZona) {
                    $grouped[$row->id]['zonas'][] = [
                        'id' => $row->zona_id,
                        'nombre' => $row->zona_nombre,
                    ];
                }
            }
        }

        return array_values($grouped);
    }

    public function filtros()
    {
        $zonas = DB::table('reciclaje.zona')
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        $colonias = DB::table('reciclaje.colonia')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'id_zona']);

        return [
            'zonas' => $zonas,
            'colonias' => $colonias,
        ];
    }
}
