<?php

namespace App\Application\Services;

use App\Models\Ciudadano;
use App\Models\DireccionCiudadano;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CiudadanoAuthService
{
    public function register(array $data)
    {
        return DB::transaction(function () use ($data) {
            $rolCiudadano = DB::table('reciclaje.rol')
                ->where('nombre', 'CIUDADANO')
                ->where('estado', 'ACTIVO')
                ->first();

            if (!$rolCiudadano) {
                throw ValidationException::withMessages([
                    'rol' => ['No existe el rol CIUDADANO en la base de datos.'],
                ]);
            }

            $idCalle = DB::table('reciclaje.calle')->orderBy('id')->value('id');

            $direccion = null;
            if (!empty($data['direccion']) && $idCalle) {
                $direccion = DireccionCiudadano::create([
                    'id_calle' => $idCalle,
                    'referencia' => $data['direccion'],
                ]);
            }

            $ciudadano = Ciudadano::create([
                'cui' => $data['cui'],
                'nombre' => $data['nombre'],
                'apellido' => $data['apellido'],
                'email' => $data['email'],
                'telefono' => $data['telefono'] ?? null,
                'id_direccion' => $direccion?->id,
            ]);

            $usuario = Usuario::create([
                'id_rol' => $rolCiudadano->id,
                'id_ciudadano' => $ciudadano->id,
                'nombre' => trim($data['nombre'] . ' ' . $data['apellido']),
                'email' => $data['email'],
                'password_hash' => Hash::make($data['password']),
            ]);

            $token = $usuario->createToken('ciudadano-token')->plainTextToken;

            return [
                'token' => $token,
                'usuario' => [
                    'id' => $usuario->id,
                    'nombre' => $usuario->nombre,
                    'email' => $usuario->email,
                    'rol' => 'CIUDADANO',
                    'id_ciudadano' => $ciudadano->id,
                ],
            ];
        });
    }

    public function login(array $data)
    {
        $usuario = Usuario::query()
            ->join('reciclaje.rol as r', 'r.id', '=', 'reciclaje.usuario.id_rol')
            ->select(
                'reciclaje.usuario.id',
                'reciclaje.usuario.id_ciudadano',
                'reciclaje.usuario.nombre',
                'reciclaje.usuario.email',
                'reciclaje.usuario.password_hash',
                'r.nombre as rol'
            )
            ->where('reciclaje.usuario.email', $data['email'])
            ->where('r.nombre', 'CIUDADANO')
            ->first();

        if (!$usuario || !Hash::check($data['password'], $usuario->password_hash)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciales incorrectas.'],
            ]);
        }

        $userModel = Usuario::findOrFail($usuario->id);
        $token = $userModel->createToken('ciudadano-token')->plainTextToken;

        return [
            'token' => $token,
            'usuario' => [
                'id' => $usuario->id,
                'nombre' => $usuario->nombre,
                'email' => $usuario->email,
                'rol' => $usuario->rol,
                'id_ciudadano' => $usuario->id_ciudadano,
            ],
        ];
    }
}
