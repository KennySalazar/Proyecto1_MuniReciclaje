<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DireccionCiudadano extends Model
{
    protected $table = 'reciclaje.direccion';
    public $timestamps = false;

    protected $fillable = [
        'id_calle',
        'referencia',
    ];
}
