<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recoleccion extends Model
{
    protected $table = 'reciclaje.recoleccion';
    public $timestamps = false;

    protected $fillable = [
        'id_asignacion_camion_ruta',
        'estado',
        'hora_inicio',
        'hora_fin',
        'id_basura',
        'observaciones',
        'incidencias',
        'lat_actual',
        'lng_actual',
        'punto_actual',
        'updated_at',
    ];

    public function asignacion()
    {
        return $this->belongsTo(AsignacionCamionRuta::class, 'id_asignacion_camion_ruta');
    }
}
