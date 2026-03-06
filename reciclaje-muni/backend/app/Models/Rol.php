<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    protected $table = 'reciclaje.rol';
    public $timestamps = false;

    protected $fillable = ['nombre', 'estado'];
}
