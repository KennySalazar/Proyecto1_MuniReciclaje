<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Application\Services\UsuarioService;

class UserController extends Controller
{
    public function __construct(private UsuarioService $service) {}

    public function index()
    {
        return response()->json($this->service->listarUsuarios());
    }

    public function rolesDisponibles()
    {
        return response()->json($this->service->listarRolesDisponibles());
    }

    public function ciudadanosRegistrados()
    {
        return response()->json($this->service->listarCiudadanos());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_rol' => ['required', 'integer'],
            'id_ciudadano' => ['nullable', 'integer'],
            'nombre' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:150'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $rol = DB::table('reciclaje.rol')
            ->where('id', $data['id_rol'])
            ->first();

        if (!$rol) {
            return response()->json(['message' => 'El rol seleccionado no existe.'], 422);
        }

        if ($rol->nombre === 'CIUDADANO') {
            return response()->json(['message' => 'El rol CIUDADANO no se crea desde este módulo.'], 422);
        }

        $emailExiste = DB::table('reciclaje.usuario')
            ->where('email', $data['email'])
            ->exists();

        if ($emailExiste) {
            return response()->json(['message' => 'El correo ya está registrado.'], 422);
        }

        $usuario = $this->service->crearUsuario($data);

        return response()->json($usuario, 201);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'id_rol' => ['required', 'integer'],
            'id_ciudadano' => ['nullable', 'integer'],
            'nombre' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:150'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $rol = DB::table('reciclaje.rol')
            ->where('id', $data['id_rol'])
            ->first();

        if (!$rol) {
            return response()->json(['message' => 'El rol seleccionado no existe.'], 422);
        }

        if ($rol->nombre === 'CIUDADANO') {
            return response()->json(['message' => 'El rol CIUDADANO no se gestiona desde este módulo.'], 422);
        }

        $emailExiste = DB::table('reciclaje.usuario')
            ->where('email', $data['email'])
            ->where('id', '<>', $id)
            ->exists();

        if ($emailExiste) {
            return response()->json(['message' => 'El correo ya está registrado por otro usuario.'], 422);
        }

        $usuario = $this->service->actualizarUsuario((int) $id, $data);

        return response()->json($usuario);
    }

    public function destroy($id)
    {
        $usuario = DB::table('reciclaje.usuario as u')
            ->join('reciclaje.rol as r', 'r.id', '=', 'u.id_rol')
            ->select('u.id', 'r.nombre as rol')
            ->where('u.id', $id)
            ->first();

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        if ($usuario->rol === 'CIUDADANO') {
            return response()->json(['message' => 'Los ciudadanos no se eliminan desde este módulo.'], 422);
        }

        $this->service->eliminarUsuario((int) $id);

        return response()->json([
            'message' => 'Usuario eliminado correctamente'
        ]);
    }

    public function operadores()
    {
        $operadores = DB::table('reciclaje.usuario as u')
            ->join('reciclaje.rol as r', 'r.id', '=', 'u.id_rol')
            ->where('r.nombre', 'OPERADOR')
            ->where('r.estado', 'ACTIVO')
            ->select(
                'u.id',
                'u.nombre',
                'u.email'
            )
            ->orderBy('u.nombre')
            ->get();

        return response()->json($operadores);
    }

    public function conductores()
    {
        return DB::table('reciclaje.usuario as u')
            ->join('reciclaje.rol as r', 'r.id', '=', 'u.id_rol')
            ->where('r.nombre', 'CONDUCTOR')
            ->select('u.id', 'u.nombre', 'u.email')
            ->orderBy('u.nombre')
            ->get();
    }
}
