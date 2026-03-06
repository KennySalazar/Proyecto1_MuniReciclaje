<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Application\Services\ContenedorService;

class ContenedorController extends Controller
{
    public function __construct(private ContenedorService $service) {}

    public function index(Request $request)
    {
        return response()->json(
            $this->service->list($request->query('id_punto_reciclaje'))
        );
    }
}
