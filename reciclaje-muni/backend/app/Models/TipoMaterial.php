<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoMaterial extends Model
{
    protected $table = 'reciclaje.tipo_material';
    public $timestamps = false;

    protected $fillable = [
        'nombre_tipo',
        'descripcion',
        'factor_kg_m3',
    ];
}
