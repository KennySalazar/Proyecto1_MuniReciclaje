<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Direccion extends Model
{
    protected $table = 'reciclaje.direccion';

    protected $fillable = [
        'id_calle',
        'referencia',
    ];

    public $timestamps = false;
}
