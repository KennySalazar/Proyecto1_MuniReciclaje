<?php

namespace App\Application\Services;

use Illuminate\Support\Facades\DB;

class MonitoreoService
{
    public function activas()
    {
        $rows = DB::table('reciclaje.recoleccion as r')
            ->join('reciclaje.asignacion_camion_ruta as a', 'a.id', '=', 'r.id_asignacion_camion_ruta')
            ->join('reciclaje.camion as c', 'c.id', '=', 'a.id_camion')
            ->join('reciclaje.ruta as ru', 'ru.id', '=', 'a.id_ruta')
            ->leftJoin('reciclaje.generacion_dinamica as g', 'g.id_asignacion_camion_ruta', '=', 'a.id')
            ->leftJoin('reciclaje.basura as b', 'b.id', '=', 'r.id_basura')
            ->whereIn('r.estado', ['PROGRAMADA', 'EN_PROCESO', 'COMPLETADA', 'INCOMPLETA'])
            ->orderBy('r.updated_at', 'desc')
            ->select([
                'r.id as id_recoleccion',
                'r.estado',
                'r.hora_inicio',
                'r.hora_fin',
                'r.observaciones',
                'r.incidencias',
                'r.lat_actual',
                'r.lng_actual',
                'r.punto_actual',
                'r.updated_at',

                'a.id as id_asignacion',
                'a.fecha',

                'c.id as camion_id',
                'c.placa as camion_placa',

                'ru.id as ruta_id',
                'ru.nombre as ruta_nombre',

                'g.cantidad_puntos as total_puntos',
                'g.total_basura as total_kg_estimado',

                'b.peso_toneladas as toneladas_reales',
            ])
            ->get();

        $mapped = $rows->map(function ($x) {
            $total = (int)($x->total_puntos ?? 0);
            $actual = (int)($x->punto_actual ?? 0);
            $pct = ($total > 0) ? round(min(100, max(0, ($actual / $total) * 100)), 1) : 0;

            $lat = $x->lat_actual;
            $lng = $x->lng_actual;

            if (($lat === null || $lng === null) && $x->id_asignacion) {
                $p0 = DB::table('reciclaje.generacion_punto as gp')
                    ->join('reciclaje.generacion_dinamica as gd', 'gd.id', '=', 'gp.id_generacion_dinamica')
                    ->where('gd.id_asignacion_camion_ruta', $x->id_asignacion)
                    ->orderBy('gp.orden', 'asc')
                    ->first(['gp.lat', 'gp.lng']);

                if ($p0) {
                    $lat = $p0->lat;
                    $lng = $p0->lng;
                }
            }

            $puntos = DB::table('reciclaje.generacion_punto as gp')
                ->join('reciclaje.generacion_dinamica as gd', 'gd.id', '=', 'gp.id_generacion_dinamica')
                ->where('gd.id_asignacion_camion_ruta', $x->id_asignacion)
                ->orderBy('gp.orden', 'asc')
                ->get(['gp.id', 'gp.lat', 'gp.lng', 'gp.peso_kg', 'gp.orden']);

            $incsArr = [];
            try {
                $incsArr = json_decode($x->incidencias ?: '[]', true);
                if (!is_array($incsArr)) $incsArr = [];
            } catch (\Throwable $e) {
                $incsArr = [];
            }

            $bloqueantesPend = array_values(array_filter($incsArr, function ($i) {
                return !empty($i['bloqueante']) && empty($i['resuelta']);
            }));

            return [
                'id_recoleccion' => $x->id_recoleccion,
                'estado' => $x->estado,

                'hora_inicio' => $x->hora_inicio,
                'hora_fin' => $x->hora_fin,
                'toneladas_reales' => $x->toneladas_reales,
                'observaciones' => $x->observaciones,

                'incidencias_count' => count($incsArr),
                'incidencias_bloqueantes_pend' => count($bloqueantesPend),

                'ruta' => ['id' => $x->ruta_id, 'nombre' => $x->ruta_nombre],
                'camion' => ['id' => $x->camion_id, 'placa' => $x->camion_placa],
                'asignacion' => ['id' => $x->id_asignacion, 'fecha' => $x->fecha],

                'progreso' => [
                    'punto_actual' => $actual,
                    'total_puntos' => $total,
                    'porcentaje' => $pct,
                ],

                'ubicacion' => ['lat' => $lat, 'lng' => $lng],
                'ultima_actualizacion' => $x->updated_at,
                'puntos' => $puntos,
            ];
        });

        return $mapped;
    }

    public function show(int $idRecoleccion)
    {
        return DB::table('reciclaje.recoleccion')
            ->where('id', $idRecoleccion)
            ->first();
    }

    public function simular(int $idRecoleccion)
    {
        return DB::transaction(function () use ($idRecoleccion) {

            $rec = DB::table('reciclaje.recoleccion')
                ->where('id', $idRecoleccion)
                ->lockForUpdate()
                ->first();

            if (!$rec) throw new \Exception("Recolección no existe");


            if (in_array($rec->estado, ['COMPLETADA'])) return $rec;


            if ($rec->estado === 'INCOMPLETA') {
                throw new \Exception("Recolección pausada por incidencias. Resolve la incidencia para continuar.");
            }

            // traer asignación + generación
            $asig = DB::table('reciclaje.asignacion_camion_ruta')->where('id', $rec->id_asignacion_camion_ruta)->first();
            $gen  = DB::table('reciclaje.generacion_dinamica')->where('id_asignacion_camion_ruta', $asig->id)->first();
            if (!$gen) throw new \Exception("No hay generación dinámica para esta asignación.");

            $total = (int)($gen->cantidad_puntos ?? 0);
            if ($total <= 0) throw new \Exception("La generación no tiene puntos.");

            // si estaba PROGRAMADA, pasa a EN_PROCESO y set hora_inicio
            if ($rec->estado === 'PROGRAMADA') {
                DB::table('reciclaje.recoleccion')->where('id', $idRecoleccion)->update([
                    'estado' => 'EN_PROCESO',
                    'hora_inicio' => $rec->hora_inicio ?: now(),
                    'updated_at' => now(),
                ]);
                $rec->estado = 'EN_PROCESO';
                $rec->hora_inicio = $rec->hora_inicio ?: now();
            }


            // probabilidad de incidencia 
            $prob = 0.01;
            $saleIncidencia = (lcg_value() < $prob);


            $catalogo = [
                ['tipo' => 'TRAFICO', 'bloqueante' => false, 'detalle' => 'Tráfico fuerte, avance lento'],
                ['tipo' => 'LLUVIA', 'bloqueante' => false, 'detalle' => 'Lluvia fuerte en la zona'],
                ['tipo' => 'ACCIDENTE', 'bloqueante' => false, 'detalle' => 'Accidente cerca de la ruta, desvío temporal'],
                ['tipo' => 'CAMINO_CERRADO', 'bloqueante' => true, 'detalle' => 'Calle cerrada por obra municipal'],
                ['tipo' => 'BLOQUEO', 'bloqueante' => true, 'detalle' => 'Bloqueo temporal en el acceso'],
                ['tipo' => 'FALTA_COMBUSTIBLE', 'bloqueante' => true, 'detalle' => 'Falta combustible, el camión se detuvo'],
                ['tipo' => 'CAMION_AVERIADO', 'bloqueante' => true, 'detalle' => 'Problema mecánico, requiere revisión'],
            ];

            $incs = json_decode($rec->incidencias ?: '[]', true);
            if (!is_array($incs)) $incs = [];

            if ($saleIncidencia) {
                $pick = $catalogo[(int)floor(lcg_value() * count($catalogo))];

                $yaHayBloqueante = false;
                foreach ($incs as $i) {
                    if (!empty($i['bloqueante']) && empty($i['resuelta'])) {
                        $yaHayBloqueante = true;
                        break;
                    }
                }

                if ($yaHayBloqueante && $pick['bloqueante']) {

                    $pick = ['tipo' => 'TRAFICO', 'bloqueante' => false, 'detalle' => 'Demora leve por tráfico'];
                }

                $incs[] = [
                    'tipo' => $pick['tipo'],
                    'detalle' => $pick['detalle'],
                    'fecha' => now()->format('Y-m-d H:i:s'),
                    'lat' => $rec->lat_actual,
                    'lng' => $rec->lng_actual,
                    'bloqueante' => $pick['bloqueante'],
                    'resuelta' => false,
                ];

                // guardar incidencia
                DB::table('reciclaje.recoleccion')->where('id', $idRecoleccion)->update([
                    'incidencias' => json_encode($incs),
                    'updated_at' => now(),
                ]);


                if ($pick['bloqueante']) {
                    DB::table('reciclaje.recoleccion')->where('id', $idRecoleccion)->update([
                        'estado' => 'INCOMPLETA',
                        'updated_at' => now(),
                    ]);

                    return DB::table('reciclaje.recoleccion')->where('id', $idRecoleccion)->first();
                }
            }


            $actual = (int)($rec->punto_actual ?? 0);
            $next = min($total, $actual + 1);


            $punto = DB::table('reciclaje.generacion_punto')
                ->where('id_generacion_dinamica', $gen->id)
                ->where('orden', $next)
                ->first();

            $lat = $punto?->lat ?? $rec->lat_actual;
            $lng = $punto?->lng ?? $rec->lng_actual;

            DB::table('reciclaje.recoleccion')->where('id', $idRecoleccion)->update([
                'punto_actual' => $next,
                'lat_actual' => $lat,
                'lng_actual' => $lng,
                'updated_at' => now(),
            ]);


            if ($next >= $total) {
                $ton = round(((float)$gen->total_basura / 1000) * (0.90 + (lcg_value() * 0.20)), 2);

                $idBasura = DB::table('reciclaje.basura')->insertGetId([
                    'tipo_basura' => 'MIXTA',
                    'peso_toneladas' => $ton,
                ]);

                DB::table('reciclaje.recoleccion')->where('id', $idRecoleccion)->update([
                    'estado' => 'COMPLETADA',
                    'hora_fin' => now(),
                    'id_basura' => $idBasura,
                    'updated_at' => now(),
                ]);
            }

            return DB::table('reciclaje.recoleccion')->where('id', $idRecoleccion)->first();
        });
    }
}
