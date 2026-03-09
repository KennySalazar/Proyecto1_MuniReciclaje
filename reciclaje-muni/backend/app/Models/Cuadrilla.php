<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cuadrilla extends Model
{
    protected $table = 'reciclaje.cuadrilla';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'estado',
        'disponibilidad',
    ];
}
