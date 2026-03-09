<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificacionDenuncia extends Model
{
    protected $table = 'reciclaje.notificacion_denuncia';
    public $timestamps = false;

    protected $fillable = [
        'id_formulario',
        'fecha',
        'mensaje',
        'enviada_bool',
    ];
}
