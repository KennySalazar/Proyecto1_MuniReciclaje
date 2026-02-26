<?php

namespace App\Infrastructure\DAO;

use App\Models\Usuario;

class UsuarioDAO
{
    public function buscarPorEmail(string $email): ?Usuario
    {
        return Usuario::with('rol')->where('email', $email)->first();
    }
}
