<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstadoDenuncia extends Model
{
    protected $table = 'reciclaje.estado_denuncia';
    public $timestamps = false;

    protected $fillable = [
        'nombre_estado',
    ];
}
