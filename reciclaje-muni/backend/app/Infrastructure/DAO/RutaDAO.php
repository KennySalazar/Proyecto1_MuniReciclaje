<?php

namespace App\Infrastructure\DAO;

use Illuminate\Support\Facades\DB;

class RutaDAO
{
    public function listRutas(): array
    {
        $rutas = DB::table('reciclaje.ruta')
            ->select('id', 'nombre', 'distancia', 'dias_asignados', 'horario', 'tipo_residuo')
            ->orderBy('id', 'desc')
            ->get();


        $result = [];
        foreach ($rutas as $r) {
            $coords = DB::table('reciclaje.ruta_coordenada as rc')
                ->join('reciclaje.coordenada as c', 'c.id', '=', 'rc.id_coordenada')
                ->where('rc.id_ruta', $r->id)
                ->orderBy('c.orden')
                ->select('c.latitud', 'c.longitud', 'c.orden')
                ->get();

            $result[] = [
                'id' => $r->id,
                'nombre' => $r->nombre,
                'distancia' => $r->distancia,
                'dias_asignados' => $r->dias_asignados,
                'horario' => $r->horario,
                'tipo_residuo' => $r->tipo_residuo,
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
                'distancia' => $data['distancia_km'],     // NUMERIC(10,2)
                'dias_asignados' => $data['dias_asignados'],
                'horario' => $data['horario'],
                'tipo_residuo' => $data['tipo_residuo'],  // ENUM: ORGANICO/INORGANICO/MIXTO
            ]);

            // tipo_orden: tomamos la primera fila (la que contiene INICIO/INTERMEDIO/FIN)
            $tipoOrdenId = DB::table('reciclaje.tipo_orden')->orderBy('id')->value('id');
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

            return ['id' => $rutaId];
        });
    }
}
