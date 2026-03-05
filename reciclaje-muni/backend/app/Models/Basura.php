<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Basura extends Model
{
    protected $table = 'basura';

    public $timestamps = false;

    protected $fillable = [
        'tipo_basura',
        'peso_toneladas',
    ];
}
