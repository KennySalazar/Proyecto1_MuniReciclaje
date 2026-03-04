<?php

namespace App\Repositories;

use App\Models\AsignacionCamionRuta;

class AsignacionRepository
{
    public function all()
    {
        return AsignacionCamionRuta::with(['camion', 'ruta', 'conductor'])
            ->orderBy('fecha', 'desc')
            ->orderBy('id', 'desc')
            ->get();
    }

    public function existsAsignacionActivaEnFecha($idCamion, $fecha)
    {
        return AsignacionCamionRuta::where('id_camion', $idCamion)
            ->where('fecha', $fecha)
            ->whereIn('estado', ['PROGRAMADA', 'EN_PROCESO'])
            ->exists();
    }

    public function existsAsignacionActivaEnFechaExcept($id, $idCamion, $fecha)
    {
        return AsignacionCamionRuta::where('id_camion', $idCamion)
            ->where('fecha', $fecha)
            ->whereIn('estado', ['PROGRAMADA', 'EN_PROCESO'])
            ->where('id', '!=', $id)
            ->exists();
    }

    public function create(array $data)
    {
        return AsignacionCamionRuta::create($data);
    }

    public function findOrFail($id)
    {
        return AsignacionCamionRuta::findOrFail($id);
    }

    public function update($id, array $data)
    {
        $asig = AsignacionCamionRuta::findOrFail($id);
        $asig->update($data);
        return $asig->fresh(['camion', 'ruta', 'conductor']);
    }

    public function delete($id)
    {
        $asig = AsignacionCamionRuta::findOrFail($id);
        $asig->delete();
        return true;
    }
}
