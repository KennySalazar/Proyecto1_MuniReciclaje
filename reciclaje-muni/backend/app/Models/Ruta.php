<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ruta extends Model
{
    protected $table = 'reciclaje.ruta';

    protected $fillable = [
        'nombre',
        'distancia',
        'dias_asignados',
        'horario',
        'tipo_residuo'
    ];

    public $timestamps = false;
}
