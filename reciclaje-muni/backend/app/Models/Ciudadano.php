<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ciudadano extends Model
{
    protected $table = 'reciclaje.ciudadano';
    public $timestamps = false;

    protected $fillable = [
        'cui',
        'nombre',
        'apellido',
        'email',
        'telefono',
        'id_direccion',
    ];
}
