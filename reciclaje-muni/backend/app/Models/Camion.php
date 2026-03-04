<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Camion extends Model
{
    protected $table = 'reciclaje.camion';
    protected $fillable = ['placa', 'capacidad_carga', 'estado'];
    public $timestamps = false;
}
