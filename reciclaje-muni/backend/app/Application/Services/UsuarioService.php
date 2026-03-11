<?php

namespace App\Application\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsuarioService
{
    public function listarUsuarios()
    {
        return DB::table('reciclaje.usuario as u')
            ->join('reciclaje.rol as r', 'r.id', '=', 'u.id_rol')
            ->leftJoin('reciclaje.ciudadano as c', 'c.id', '=', 'u.id_ciudadano')
            ->select(
                'u.id',
                'u.nombre',
                'u.email',
                'u.id_rol',
                'r.nombre as rol',
                'u.id_ciudadano',
                DB::raw("CASE 
                    WHEN c.id IS NOT NULL THEN CONCAT(c.nombre, ' ', c.apellido)
                    ELSE NULL
                END as ciudadano_relacionado")
            )
            ->where('r.nombre', '<>', 'CIUDADANO')
            ->orderBy('u.id')
            ->get();
    }

    public function listarRolesDisponibles()
    {
        return DB::table('reciclaje.rol')
            ->select('id', 'nombre')
            ->where('estado', 'ACTIVO')
            ->where('nombre', '<>', 'CIUDADANO')
            ->orderBy('nombre')
            ->get();
    }

    public function listarCiudadanos()
    {
        return DB::table('reciclaje.ciudadano as c')
            ->leftJoin('reciclaje.direccion as d', 'd.id', '=', 'c.id_direccion')
            ->select(
                'c.id',
                'c.cui',
                'c.nombre',
                'c.apellido',
                'c.email',
                'c.telefono',
                'd.referencia as direccion'
            )
            ->orderBy('c.id')
            ->get();
    }

    public function crearUsuario(array $data)
    {
        $id = DB::table('reciclaje.usuario')->insertGetId([
            'id_rol' => $data['id_rol'],
            'id_ciudadano' => $data['id_ciudadano'] ?? null,
            'nombre' => $data['nombre'],
            'email' => $data['email'],
            'password_hash' => Hash::make($data['password']),
        ]);

        return $this->buscarUsuario($id);
    }

    public function actualizarUsuario(int $id, array $data)
    {
        $payload = [
            'id_rol' => $data['id_rol'],
            'nombre' => $data['nombre'],
            'email' => $data['email'],
        ];

        if (array_key_exists('id_ciudadano', $data)) {
            $payload['id_ciudadano'] = $data['id_ciudadano'];
        }

        if (!empty($data['password'])) {
            $payload['password_hash'] = Hash::make($data['password']);
        }

        DB::table('reciclaje.usuario')
            ->where('id', $id)
            ->update($payload);

        return $this->buscarUsuario($id);
    }

    public function eliminarUsuario(int $id)
    {
        DB::table('reciclaje.usuario')
            ->where('id', $id)
            ->delete();
    }

    public function buscarUsuario(int $id)
    {
        return DB::table('reciclaje.usuario as u')
            ->join('reciclaje.rol as r', 'r.id', '=', 'u.id_rol')
            ->leftJoin('reciclaje.ciudadano as c', 'c.id', '=', 'u.id_ciudadano')
            ->select(
                'u.id',
                'u.nombre',
                'u.email',
                'u.id_rol',
                'r.nombre as rol',
                'u.id_ciudadano',
                DB::raw("CASE 
                    WHEN c.id IS NOT NULL THEN CONCAT(c.nombre, ' ', c.apellido)
                    ELSE NULL
                END as ciudadano_relacionado")
            )
            ->where('u.id', $id)
            ->first();
    }
}
