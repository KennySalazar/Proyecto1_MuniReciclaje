<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PuntoReciclaje extends Model
{
    protected $table = 'reciclaje.punto_reciclaje';

    protected $fillable = [
        'nombre',
        'latitud',
        'longitud',
        'capacidad_m3',
        'horario_atencion',
        'id_usuario_encargado',
        'id_direccion'
    ];

    public $timestamps = false;
}
