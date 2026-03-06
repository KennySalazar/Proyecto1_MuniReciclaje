<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VaciadoProgramado extends Model
{
    protected $table = 'reciclaje.vaciado_programado';
    public $timestamps = false;

    protected $fillable = [
        'id_contenedor',
        'id_usuario_responsable',
        'hora_fecha',
        'estado',
        'observacion',
    ];
}
