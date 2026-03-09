<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Foto extends Model
{
    protected $table = 'reciclaje.foto';
    public $timestamps = false;

    protected $fillable = [
        'id_formulario',
        'tipo_foto',
        'ruta_archivo',
        'fecha',
    ];
}
