<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeneracionDinamica extends Model
{
    protected $table = 'generacion_dinamica';
    public $timestamps = false;

    protected $fillable = [
        'id_asignacion_camion_ruta',
        'id_basura',
        'cantidad_puntos',
        'total_basura',
        'tipo_densidad',
        'fecha_generacion',
        'fecha_dia_semana'
    ];

    public function puntos()
    {
        return $this->hasMany(GeneracionPunto::class, 'id_generacion_dinamica');
    }
}
