<?php

namespace App\Application\Services;

use App\Models\AsignacionCamionRuta;
use App\Models\Ruta;
use App\Models\Basura;
use App\Repositories\GeneracionDinamicaRepository;
use Illuminate\Support\Facades\DB;

class GeneracionDinamicaService
{
    public function __construct(private GeneracionDinamicaRepository $repo) {}

    public function list()
    {
        return $this->repo->list();
    }

    public function get($id)
    {
        return $this->repo->findOrFail($id);
    }

    public function generar($idAsignacion)
    {
        $asig = AsignacionCamionRuta::findOrFail($idAsignacion);
        $ruta = Ruta::findOrFail($asig->id_ruta);

        //limpiar generacion si ya existia una
        $this->repo->deleteByAsignacion($asig->id);


        $cantidadPuntos = random_int(15, 30);


        $densidad = $this->inferirDensidad($ruta->tipo_residuo);

        //factor por dia  y fin de semana +
        $dow = date('N', strtotime($asig->fecha));
        $factorDia = ($dow >= 6) ? 1.50 : 1.0;

        //historico
        $promHistorico = $this->repo->promedioHistoricoKgPorPunto($ruta->id);
        $baseHistorico = $promHistorico ? floatval($promHistorico) : null;

        //armamos el polyline con los puntos 
        $coords = DB::table('ruta_coordenada as rc')
            ->join('coordenada as c', 'c.id', '=', 'rc.id_coordenada')
            ->where('rc.id_ruta', $ruta->id)
            ->orderByRaw('c.orden IS NULL, c.orden ASC, rc.id ASC')
            ->get(['c.latitud as lat', 'c.longitud as lng']);

        //si no hay coor, no generamos los puntos, pero guardamos esa generacion
        if ($coords->count() < 2) {
            return $this->repo->create([
                'id_asignacion_camion_ruta' => $asig->id,
                'id_basura' => null,
                'cantidad_puntos' => 0,
                'total_basura' => 0,
                'tipo_densidad' => $densidad,
                'fecha_generacion' => $asig->fecha,
                'fecha_dia_semana' => date('l', strtotime($asig->fecha)),
            ]);
        }

        //generamos los puntos de basura
        $puntos = $this->generarPuntosEnPolyline($coords->toArray(), $cantidadPuntos);


        $factorDens = match ($densidad) {
            'RESIDENCIAL' => 1.00,
            'COMERCIAL' => 1.10,
            'INDUSTRIAL' => 1.20,
            default => 1.00
        };

        $totalKg = 0;
        foreach ($puntos as &$p) {
            $kg = random_int(50, 500);

            // si hay historico, acercamos el calculo del valor
            if ($baseHistorico) {
                $kg = (0.65 * $kg) + (0.35 * $baseHistorico);
            }

            $kg = $kg * $factorDia * $factorDens;


            if ($kg < 50) $kg = 50;
            if ($kg > 650) $kg = 650;

            $p['kg'] = round($kg, 2);
            $totalKg += $p['kg'];
        }

        //creamos la basura
        $tipoBasura = $this->mapBasuraTipo($ruta->tipo_residuo);
        $basura = Basura::create([
            'tipo_basura' => $tipoBasura,
            'peso_toneladas' => round($totalKg / 1000, 2),
        ]);

        //generacion_dinamica
        $gen = $this->repo->create([
            'id_asignacion_camion_ruta' => $asig->id,
            'id_basura' => $basura->id,
            'cantidad_puntos' => $cantidadPuntos,
            'total_basura' => round($totalKg, 2),
            'tipo_densidad' => $densidad,
            'fecha_generacion' => $asig->fecha,
            'fecha_dia_semana' => $this->diaSemanaES($asig->fecha),
        ]);



        $this->repo->insertPuntos($gen->id, $puntos);

        return $this->repo->findOrFail($gen->id);
    }

    private function inferirDensidad($tipoResiduo)
    {
        return match ($tipoResiduo) {
            'ORGANICO' => 'RESIDENCIAL',
            'INORGANICO' => 'INDUSTRIAL',
            'MIXTO' => 'COMERCIAL',
            default => 'RESIDENCIAL'
        };
    }

    private function mapBasuraTipo($tipoResiduo)
    {
        return match ($tipoResiduo) {
            'ORGANICO' => 'ORGANICA',
            'INORGANICO' => 'INORGANICA',
            'MIXTO' => 'MIXTA',
            default => 'MIXTA'
        };
    }

    private function generarPuntosEnPolyline(array $coords, int $n)
    {

        $segments = [];
        $totalLen = 0.0;

        for ($i = 0; $i < count($coords) - 1; $i++) {
            $a = $coords[$i];
            $b = $coords[$i + 1];
            $len = $this->dist($a->lat, $a->lng, $b->lat, $b->lng);
            $segments[] = ['i' => $i, 'len' => $len];
            $totalLen += $len;
        }

        $pts = [];
        for ($k = 0; $k < $n; $k++) {
            $r = lcg_value() * $totalLen;
            $acc = 0.0;
            $segIndex = 0;

            foreach ($segments as $s) {
                $acc += $s['len'];
                if ($r <= $acc) {
                    $segIndex = $s['i'];
                    break;
                }
            }

            $a = $coords[$segIndex];
            $b = $coords[$segIndex + 1];
            $t = lcg_value();

            $lat = (float)$a->lat + $t * ((float)$b->lat - (float)$a->lat);
            $lng = (float)$a->lng + $t * ((float)$b->lng - (float)$a->lng);

            $pts[] = ['lat' => $lat, 'lng' => $lng, 'kg' => 0];
        }

        return $pts;
    }

    private function dist($lat1, $lon1, $lat2, $lon2)
    {
        // haversine (metros)
        $R = 6371000;
        $p1 = deg2rad($lat1);
        $p2 = deg2rad($lat2);
        $dp = deg2rad($lat2 - $lat1);
        $dl = deg2rad($lon2 - $lon1);

        $a = sin($dp / 2) ** 2 + cos($p1) * cos($p2) * sin($dl / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $R * $c;
    }

    private function diaSemanaES($fecha)
    {
        $en = date('l', strtotime($fecha));
        return match ($en) {
            'Monday' => 'Lunes',
            'Tuesday' => 'Martes',
            'Wednesday' => 'Miércoles',
            'Thursday' => 'Jueves',
            'Friday' => 'Viernes',
            'Saturday' => 'Sábado',
            'Sunday' => 'Domingo',
            default => $en
        };
    }
}
