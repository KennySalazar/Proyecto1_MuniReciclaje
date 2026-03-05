<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeneracionPunto extends Model
{
    protected $table = 'generacion_punto';
    public $timestamps = false;

    protected $fillable = [
        'id_generacion_dinamica',
        'lat',
        'lng',
        'peso_kg',
        'orden'
    ];
}
