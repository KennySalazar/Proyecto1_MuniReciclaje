<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Basurero extends Model
{
    protected $table = 'reciclaje.basurero';
    public $timestamps = false;

    protected $fillable = [
        'id_coordenada',
        'id_tamano_basurero',
    ];
}
