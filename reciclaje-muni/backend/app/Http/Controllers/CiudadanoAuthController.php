<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Application\Services\CiudadanoAuthService;

class CiudadanoAuthController extends Controller
{
    public function __construct(private CiudadanoAuthService $service) {}

    public function register(Request $request)
    {
        $data = $request->validate([
            'cui' => ['required', 'string', 'size:13', 'unique:ciudadano,cui'],
            'nombre' => ['required', 'string', 'max:120'],
            'apellido' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:150', 'unique:usuario,email'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'direccion' => ['nullable', 'string', 'max:250'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        return response()->json(
            $this->service->register($data),
            201
        );
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        return response()->json(
            $this->service->login($data)
        );
    }
}
