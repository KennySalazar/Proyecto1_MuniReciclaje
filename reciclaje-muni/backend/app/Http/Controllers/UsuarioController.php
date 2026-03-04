<?php

namespace App\Http\Controllers;

use App\Models\Usuario;

class UsuarioController extends Controller
{

    public function conductores()
    {
        return Usuario::whereHas('rol', function ($q) {
            $q->where('nombre', 'CONDUCTOR');
        })->get();
    }
}
