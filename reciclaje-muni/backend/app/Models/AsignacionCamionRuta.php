<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AsignacionCamionRuta extends Model
{
    protected $table = 'reciclaje.asignacion_camion_ruta';
    protected $fillable = ['id_camion', 'id_ruta', 'id_usuario_conductor', 'fecha', 'estado'];
    public $timestamps = false;

    public function camion()
    {
        return $this->belongsTo(Camion::class, 'id_camion');
    }
    public function ruta()
    {
        return $this->belongsTo(Ruta::class, 'id_ruta');
    }
    public function conductor()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario_conductor');
    }
}
