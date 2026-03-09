<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tamano extends Model
{
    protected $table = 'reciclaje.tamano';
    public $timestamps = false;

    protected $fillable = [
        'tipo_nombre',
        'descripcion',
    ];
}
