<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaterialReciclaje extends Model
{
    protected $table = 'reciclaje.material_reciclaje';
    public $timestamps = false;

    protected $fillable = [
        'id_ciudadano',
        'id_usuario_operador',
        'id_contenedor',
        'cantidad',
        'fecha_entrega',
        'hora_entrega',
        'nombre_ciudadano',
    ];
}
