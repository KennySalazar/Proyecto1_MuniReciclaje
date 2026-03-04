<?php

namespace App\Repositories;

use App\Models\Camion;

class CamionRepository
{

    public function all()
    {
        return Camion::orderBy('id', 'desc')->get();
    }

    public function create(array $data)
    {
        return Camion::create($data);
    }

    public function update($id, array $data)
    {
        $camion = Camion::findOrFail($id);

        $camion->update($data);

        return $camion;
    }

    public function delete($id)
    {
        $camion = Camion::findOrFail($id);

        return $camion->delete();
    }
}
