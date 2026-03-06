<?php

namespace App\Application\Services;

use App\Models\TipoMaterial;

class TipoMaterialService
{
    public function list()
    {
        return TipoMaterial::orderBy('nombre_tipo')->get();
    }
}
