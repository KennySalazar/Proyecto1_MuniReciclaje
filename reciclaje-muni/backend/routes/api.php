<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RutaController;
use App\Http\Controllers\CamionController;
use App\Http\Controllers\AsignacionCamionRutaController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\GeneracionDinamicaController;
use App\Http\Controllers\RecoleccionController;
use App\Http\Controllers\MonitoreoController;
use App\Http\Controllers\ReportesController;
use App\Http\Controllers\PuntoReciclajeController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/conductores', [UsuarioController::class, 'conductores']);

    Route::middleware(['role:ADMIN,COORDINADOR'])->group(function () {
        Route::get('/camiones', [CamionController::class, 'index']);
        Route::post('/camiones', [CamionController::class, 'store']);
        Route::put('/camiones/{id}', [CamionController::class, 'update']);
        Route::patch('/camiones/{id}/estado', [CamionController::class, 'updateEstado']);
        Route::delete('/camiones/{id}', [CamionController::class, 'destroy']);
    });

    Route::middleware(['role:COORDINADOR'])->group(function () {
        Route::get('/rutas', [RutaController::class, 'index']);
        Route::post('/rutas', [RutaController::class, 'store']);

        Route::get('/asignaciones', [AsignacionCamionRutaController::class, 'index']);
        Route::post('/asignaciones', [AsignacionCamionRutaController::class, 'store']);


        Route::put('/asignaciones/{id}', [AsignacionCamionRutaController::class, 'update']);
        Route::delete('/asignaciones/{id}', [AsignacionCamionRutaController::class, 'destroy']);

        Route::get('/generaciones', [GeneracionDinamicaController::class, 'index']);
        Route::get('/generaciones/{id}', [GeneracionDinamicaController::class, 'show']);
        Route::post('/generaciones/generar', [GeneracionDinamicaController::class, 'generar']);

        Route::post('/recolecciones/iniciar', [RecoleccionController::class, 'iniciar']);
        Route::patch('/recolecciones/{id}/ping', [RecoleccionController::class, 'ping']);
        Route::post('/recolecciones/{id}/incidencias', [RecoleccionController::class, 'addIncidencia']);
        Route::patch('/recolecciones/{id}/finalizar', [RecoleccionController::class, 'finalizar']);
        Route::get('/recolecciones/{id}', [RecoleccionController::class, 'show']);
        Route::patch('/recolecciones/{id}/incidencias/{idx}/resolver', [RecoleccionController::class, 'resolverIncidencia']);
        Route::get('/monitoreo/activas', [MonitoreoController::class, 'activas']);
        Route::post('/monitoreo/{id}/simular', [MonitoreoController::class, 'simular']);

        Route::get('/reportes/estados', [ReportesController::class, 'estados']);
        Route::get('/reportes/basura-por-ruta', [ReportesController::class, 'basuraPorRuta']);
        Route::get('/reportes/camiones', [ReportesController::class, 'camiones']);
        Route::get('/reportes/incidencias', [ReportesController::class, 'incidencias']);
        Route::get('/reportes/eficiencia', [ReportesController::class, 'eficiencia']);
    });

    Route::middleware(['role:OPERADOR'])->group(function () {
        Route::get('/puntos-verdes', [PuntoReciclajeController::class, 'index']);
        Route::post('/puntos-verdes', [PuntoReciclajeController::class, 'store']);
        Route::put('/puntos-verdes/{id}', [PuntoReciclajeController::class, 'update']);
        Route::delete('/puntos-verdes/{id}', [PuntoReciclajeController::class, 'destroy']);
        Route::get('/usuarios/operadores', [UsuarioController::class, 'operadores']);
    });
});
