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

    public function operadores()
    {
        $operadores = Usuario::query()
            ->join('reciclaje.rol as r', 'r.id', '=', 'reciclaje.usuario.id_rol')
            ->where('r.nombre', 'OPERADOR')
            ->where('r.estado', 'ACTIVO')
            ->select(
                'reciclaje.usuario.id',
                'reciclaje.usuario.nombre',
                'reciclaje.usuario.email'
            )
            ->orderBy('reciclaje.usuario.nombre')
            ->get();

        return response()->json($operadores);
    }
}
