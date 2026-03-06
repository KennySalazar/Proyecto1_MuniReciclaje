<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contenedor extends Model
{
    protected $table = 'reciclaje.contenedor';
    public $timestamps = false;

    protected $fillable = [
        'id_punto_reciclaje',
        'id_tipo_material',
        'porcentaje',
        'nivel_actual',
        'capacidad_m3',
    ];

    public function tipoMaterial()
    {
        return $this->belongsTo(TipoMaterial::class, 'id_tipo_material');
    }
}
