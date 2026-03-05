<?php

namespace App\Repositories;

use App\Models\Recoleccion;

class RecoleccionRepository
{
    public function all()
    {
        return Recoleccion::orderBy('id', 'desc')->get();
    }

    public function byAsignacion($idAsignacion)
    {
        return Recoleccion::where('id_asignacion_camion_ruta', $idAsignacion)->first();
    }

    public function findOrFail($id)
    {
        return Recoleccion::findOrFail($id);
    }

    public function create(array $data)
    {
        return Recoleccion::create($data);
    }

    public function update($id, array $data)
    {
        $r = Recoleccion::findOrFail($id);
        $r->update($data);
        return $r->fresh();
    }
}
