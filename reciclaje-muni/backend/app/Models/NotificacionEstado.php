<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificacionEstado extends Model
{
    protected $table = 'reciclaje.notificacion_estado';
    public $timestamps = false;

    protected $fillable = [
        'id_contenedor',
        'tipo_alerta',
        'fecha_hora',
        'mensaje',
        'leida_bool',
    ];
}
