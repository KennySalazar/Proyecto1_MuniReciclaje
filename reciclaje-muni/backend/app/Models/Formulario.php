<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Formulario extends Model
{
    protected $table = 'reciclaje.formulario';
    public $timestamps = false;

    protected $fillable = [
        'id_basurero',
        'id_ciudadano',
        'id_estado_denuncia',
        'id_zona',
        'descripcion',
        'fecha_denuncia',
    ];
}
