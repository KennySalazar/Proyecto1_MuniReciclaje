<?php

namespace App\Application\Services;

use App\Models\AsignacionCamionRuta;
use App\Models\Basura;
use App\Models\Ruta;
use App\Repositories\RecoleccionRepository;

class RecoleccionService
{
    public function __construct(private RecoleccionRepository $repo) {}

    public function iniciar($idAsignacion)
    {
        $asig = AsignacionCamionRuta::findOrFail($idAsignacion);

        $rec = $this->repo->byAsignacion($asig->id);

        if ($rec) {

            if ($rec->estado === 'PROGRAMADA') {
                return $this->repo->update($rec->id, [
                    'estado' => 'EN_PROCESO',
                    'hora_inicio' => $rec->hora_inicio ?? now(),
                    'updated_at' => now(),
                ]);
            }
            return $rec;
        }

        return $this->repo->create([
            'id_asignacion_camion_ruta' => $asig->id,
            'estado' => 'EN_PROCESO',
            'hora_inicio' => now(),
            'hora_fin' => null,
            'id_basura' => null,
            'observaciones' => null,
            'incidencias' => '[]',
            'lat_actual' => null,
            'lng_actual' => null,
            'punto_actual' => 0,
            'updated_at' => now(),
        ]);
    }

    public function finalizar($idRecoleccion, array $data)
    {
        $rec = $this->repo->findOrFail($idRecoleccion);

        $estadoFinal = $data['estado'] ?? 'COMPLETADA';
        if (!in_array($estadoFinal, ['COMPLETADA', 'INCOMPLETA'])) {
            throw new \Exception("Estado final inválido");
        }

        $toneladas = floatval($data['toneladas'] ?? 0);
        if ($toneladas < 0) throw new \Exception("Toneladas inválidas");

        // tipo basura basado en tipo_residuo de la ruta
        $asig = AsignacionCamionRuta::findOrFail($rec->id_asignacion_camion_ruta);
        $ruta = Ruta::findOrFail($asig->id_ruta);

        $tipoBasura = match ($ruta->tipo_residuo) {
            'ORGANICO' => 'ORGANICA',
            'INORGANICO' => 'INORGANICA',
            'MIXTO' => 'MIXTA',
            default => 'MIXTA'
        };

        $basura = Basura::create([
            'tipo_basura' => $tipoBasura,
            'peso_toneladas' => round($toneladas, 2),
        ]);

        return $this->repo->update($rec->id, [
            'estado' => $estadoFinal,
            'hora_fin' => now(),
            'id_basura' => $basura->id,
            'observaciones' => $data['observaciones'] ?? null,
            'updated_at' => now(),
        ]);
    }

    public function agregarIncidencia($idRecoleccion, array $inc)
    {
        $rec = $this->repo->findOrFail($idRecoleccion);

        $arr = json_decode($rec->incidencias ?: '[]', true);
        if (!is_array($arr)) $arr = [];

        $arr[] = [
            'tipo' => $inc['tipo'] ?? 'OTRA',
            'detalle' => $inc['detalle'] ?? '',
            'fecha' => now()->format('Y-m-d H:i:s'),
            'lat' => $inc['lat'] ?? null,
            'lng' => $inc['lng'] ?? null,
        ];

        return $this->repo->update($rec->id, [
            'incidencias' => json_encode($arr),
            'updated_at' => now(),
        ]);
    }

    public function ping($idRecoleccion, array $data)
    {
        return $this->repo->update($idRecoleccion, [
            'lat_actual' => $data['lat_actual'] ?? null,
            'lng_actual' => $data['lng_actual'] ?? null,
            'punto_actual' => $data['punto_actual'] ?? null,
            'updated_at' => now(),
        ]);
    }
}
