<?php

namespace App\Http\Controllers;

use App\Application\Services\NotificacionEstadoService;

class NotificacionEstadoController extends Controller
{
    public function __construct(private NotificacionEstadoService $service) {}

    public function index()
    {
        return response()->json($this->service->list());
    }

    public function marcarLeida($id)
    {
        return response()->json(
            $this->service->marcarLeida($id)
        );
    }
}
