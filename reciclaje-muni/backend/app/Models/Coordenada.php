<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coordenada extends Model
{
    protected $table = 'reciclaje.coordenada';
    public $timestamps = false;

    protected $fillable = [
        'latitud',
        'longitud',
    ];
}
