<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AsignacionDenuncia extends Model
{
    protected $table = 'reciclaje.asignacion_denuncia';
    public $timestamps = false;

    protected $fillable = [
        'id_formulario',
        'id_cuadrilla',
        'fecha_programada',
        'recursos_estimados',
        'observacion',
    ];
}
