<?php

namespace App\Infrastructure\DAO;

use Illuminate\Support\Facades\DB;

class RutaDAO
{
    public function listRutas(): array
    {
        $rutas = DB::table('reciclaje.ruta as r')
            ->leftJoin('reciclaje.ruta_colonia as rc', 'rc.id_ruta', '=', 'r.id')
            ->leftJoin('reciclaje.colonia as c', 'c.id', '=', 'rc.id_colonia')
            ->leftJoin('reciclaje.zona as z', 'z.id', '=', 'c.id_zona')
            ->select(
                'r.id',
                'r.nombre',
                'r.distancia',
                'r.dias_asignados',
                'r.horario',
                'r.tipo_residuo',
                'c.id as id_colonia',
                'c.nombre as colonia_nombre',
                'z.id as id_zona',
                'z.nombre as zona_nombre'
            )
            ->orderBy('r.id', 'desc')
            ->get();

        $result = [];
        foreach ($rutas as $r) {
            $coords = DB::table('reciclaje.ruta_coordenada as rc')
                ->join('reciclaje.coordenada as c', 'c.id', '=', 'rc.id_coordenada')
                ->where('rc.id_ruta', $r->id)
                ->orderBy('c.orden')
                ->select(
                    'c.latitud as lat',
                    'c.longitud as lng',
                    'c.orden'
                )
                ->get();

            $result[] = [
                'id' => $r->id,
                'nombre' => $r->nombre,
                'distancia' => $r->distancia,
                'dias_asignados' => $r->dias_asignados,
                'horario' => $r->horario,
                'tipo_residuo' => $r->tipo_residuo,
                'id_colonia' => $r->id_colonia,
                'colonia' => $r->colonia_nombre,
                'id_zona' => $r->id_zona,
                'zona' => $r->zona_nombre,
                'coordenadas' => $coords,
            ];
        }

        return $result;
    }

    public function createRutaConCoordenadas(array $data): array
    {
        return DB::transaction(function () use ($data) {

            $rutaId = DB::table('reciclaje.ruta')->insertGetId([
                'nombre' => $data['nombre'],
                'distancia' => $data['distancia_km'],
                'dias_asignados' => $data['dias_asignados'],
                'horario' => $data['horario'],
                'tipo_residuo' => $data['tipo_residuo'],
            ]);

            DB::table('reciclaje.ruta_colonia')->insert([
                'id_ruta' => $rutaId,
                'id_colonia' => $data['id_colonia'],
            ]);

            $tipoOrdenId = DB::table('reciclaje.tipo_orden')
                ->orderBy('id')
                ->value('id');

            if (!$tipoOrdenId) {
                throw new \RuntimeException("No existe registro en tipo_orden");
            }

            foreach ($data['coordenadas'] as $i => $p) {
                $coordId = DB::table('reciclaje.coordenada')->insertGetId([
                    'latitud' => $p['lat'],
                    'longitud' => $p['lng'],
                    'orden' => $p['orden'] ?? ($i + 1),
                ]);

                DB::table('reciclaje.ruta_coordenada')->insert([
                    'id_ruta' => $rutaId,
                    'id_tipo_orden' => $tipoOrdenId,
                    'id_coordenada' => $coordId,
                ]);
            }

            return [
                'id' => $rutaId,
                'id_colonia' => $data['id_colonia'],
            ];
        });
    }
}
