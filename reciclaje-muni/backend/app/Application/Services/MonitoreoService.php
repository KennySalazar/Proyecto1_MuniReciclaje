<?php

namespace App\Application\Services;

use Illuminate\Support\Facades\DB;

class MonitoreoService
{
    /**
     * "Activas" = EN_PROCESO o PROGRAMADA (si querés ver las que aún no inician).
     * Si querés solo camiones andando: dejá solo EN_PROCESO.
     */

    public function activas()
    {
        $rows = DB::table('reciclaje.recoleccion as r')
            ->join('reciclaje.asignacion_camion_ruta as a', 'a.id', '=', 'r.id_asignacion_camion_ruta')
            ->join('reciclaje.camion as c', 'c.id', '=', 'a.id_camion')
            ->join('reciclaje.ruta as ru', 'ru.id', '=', 'a.id_ruta')
            ->leftJoin('reciclaje.generacion_dinamica as g', 'g.id_asignacion_camion_ruta', '=', 'a.id')
            ->leftJoin('reciclaje.basura as b', 'b.id', '=', 'r.id_basura')
            // ✅ AHORA INCLUYE FINALIZADAS E INCOMPLETAS
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

            // ✅ ubicación fallback: primer punto de la generación
            $lat = $x->lat_actual;
            $lng = $x->lng_actual;

            if (($lat === null || $lng === null) && $x->id_asignacion) {
                $p0 = DB::table('reciclaje.generacion_punto')
                    ->join('reciclaje.generacion_dinamica as gd', 'gd.id', '=', 'reciclaje.generacion_punto.id_generacion_dinamica')
                    ->where('gd.id_asignacion_camion_ruta', $x->id_asignacion)
                    ->orderBy('reciclaje.generacion_punto.orden', 'asc')
                    ->first(['reciclaje.generacion_punto.lat', 'reciclaje.generacion_punto.lng']);

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

            // incidencias
            $incsArr = [];
            try {
                $incsArr = json_decode($x->incidencias ?: '[]', true);
                if (!is_array($incsArr)) $incsArr = [];
            } catch (\Throwable $e) {
                $incsArr = [];
            }

            return [
                'id_recoleccion' => $x->id_recoleccion,
                'estado' => $x->estado,

                'hora_inicio' => $x->hora_inicio,
                'hora_fin' => $x->hora_fin,
                'toneladas_reales' => $x->toneladas_reales,
                'observaciones' => $x->observaciones,
                'incidencias_count' => count($incsArr),
                'incidencias' => $incsArr,

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

                // refrescar $rec local
                $rec->estado = 'EN_PROCESO';
                $rec->hora_inicio = $rec->hora_inicio ?: now();
            }

            // si ya terminó, no hacemos nada
            if (in_array($rec->estado, ['COMPLETADA', 'INCOMPLETA'])) {
                return $rec;
            }

            $actual = (int)($rec->punto_actual ?? 0);
            $next = min($total, $actual + 1);

            // buscar coordenada del punto next
            $punto = DB::table('reciclaje.generacion_punto')
                ->where('id_generacion_dinamica', $gen->id)
                ->where('orden', $next)
                ->first();

            // si no existe exacto por orden, tomamos el siguiente disponible
            if (!$punto) {
                $punto = DB::table('reciclaje.generacion_punto')
                    ->where('id_generacion_dinamica', $gen->id)
                    ->orderBy('orden')
                    ->skip(max(0, $next - 1))
                    ->first();
            }

            $lat = $punto?->lat ?? $rec->lat_actual;
            $lng = $punto?->lng ?? $rec->lng_actual;

            // actualizar avance + ubicación
            DB::table('reciclaje.recoleccion')->where('id', $idRecoleccion)->update([
                'punto_actual' => $next,
                'lat_actual' => $lat,
                'lng_actual' => $lng,
                'updated_at' => now(),
            ]);

            // ✅ si llegó al final -> FINALIZAR AUTOMÁTICO
            if ($next >= $total) {
                // toneladas reales: podés usar estimado o un random cercano
                $ton = round(((float)$gen->total_basura / 1000) * (0.90 + (lcg_value() * 0.20)), 2); // 90% - 110%

                $idBasura = DB::table('reciclaje.basura')->insertGetId([
                    'tipo_basura' => 'MIXTA', // si querés, lo derivamos de ruta->tipo_residuo
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
