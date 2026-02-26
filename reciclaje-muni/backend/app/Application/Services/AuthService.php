<?php

namespace App\Application\Services;

use App\Infrastructure\DAO\UsuarioDAO;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(private UsuarioDAO $usuarioDAO) {}

    public function login(string $email, string $password): array
    {
        $user = $this->usuarioDAO->buscarPorEmail($email);

        if (!$user || !Hash::check($password, $user->password_hash)) {
            throw new \Exception("Credenciales inválidas");
        }

        $token = $user->createToken('api_token')->plainTextToken;

        return [
            'token' => $token,
            'usuario' => [
                'id' => $user->id,
                'nombre' => $user->nombre,
                'email' => $user->email,
                'rol' => $user->rol?->nombre
            ]
        ];
    }
}
