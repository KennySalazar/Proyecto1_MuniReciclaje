<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RutaController;
use App\Http\Controllers\CamionController;
use App\Http\Controllers\AsignacionCamionRutaController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\GeneracionDinamicaController;

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


        Route::patch('/asignaciones/{id}/estado', [AsignacionCamionRutaController::class, 'updateEstado']);
        Route::get('/generaciones', [GeneracionDinamicaController::class, 'index']);
        Route::get('/generaciones/{id}', [GeneracionDinamicaController::class, 'show']);
        Route::post('/generaciones/generar', [GeneracionDinamicaController::class, 'generar']);
    });
});
