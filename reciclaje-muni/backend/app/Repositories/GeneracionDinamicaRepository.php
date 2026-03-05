<?php

namespace App\Repositories;

use App\Models\GeneracionDinamica;
use App\Models\GeneracionPunto;
use Illuminate\Support\Facades\DB;

class GeneracionDinamicaRepository
{
    public function list()
    {
        return GeneracionDinamica::orderBy('id', 'desc')->get();
    }

    public function findOrFail($id)
    {
        return GeneracionDinamica::with('puntos')->findOrFail($id);
    }

    public function create(array $data)
    {
        return GeneracionDinamica::create($data);
    }

    public function deleteByAsignacion($idAsignacion)
    {
        GeneracionDinamica::where('id_asignacion_camion_ruta', $idAsignacion)->delete();
    }

    public function insertPuntos($idGen, array $puntos)
    {
        foreach ($puntos as $i => $p) {
            GeneracionPunto::create([
                'id_generacion_dinamica' => $idGen,
                'lat' => $p['lat'],
                'lng' => $p['lng'],
                'peso_kg' => $p['kg'],
                'orden' => $i + 1,
            ]);
        }
    }

    public function promedioHistoricoKgPorPunto($idRuta)
    {
        return DB::table('generacion_dinamica as g')
            ->join('asignacion_camion_ruta as a', 'a.id', '=', 'g.id_asignacion_camion_ruta')
            ->where('a.id_ruta', $idRuta)
            ->whereNotNull('g.total_basura')
            ->where('g.cantidad_puntos', '>', 0)
            ->avg(DB::raw('g.total_basura / g.cantidad_puntos'));
    }
}
