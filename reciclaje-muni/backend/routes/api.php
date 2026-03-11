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
use App\Http\Controllers\TipoMaterialController;
use App\Http\Controllers\ContenedorController;
use App\Http\Controllers\MaterialReciclajeController;
use App\Http\Controllers\VaciadoProgramadoController;
use App\Http\Controllers\NotificacionEstadoController;
use App\Http\Controllers\PortalPublicoController;
use App\Http\Controllers\CiudadanoAuthController;
use App\Http\Controllers\DenunciaController;
use App\Http\Controllers\ReporteRecoleccionController;
use App\Http\Controllers\ReportesReciclajeController;
use App\Http\Controllers\ReportesDenunciasController;
use App\Http\Controllers\UserController;

Route::post('/login', [AuthController::class, 'login']);

Route::get('/portal-publico/rutas', [PortalPublicoController::class, 'rutas']);
Route::get('/portal-publico/filtros', [PortalPublicoController::class, 'filtros']);
Route::post('/ciudadanos/register', [CiudadanoAuthController::class, 'register']);
Route::post('/ciudadanos/login', [CiudadanoAuthController::class, 'login']);
Route::get('/denuncias/catalogos', [DenunciaController::class, 'catalogos']);
Route::get('/portal/puntos-verdes', [PuntoReciclajeController::class, 'index']);
Route::get('/portal/estadisticas', [PortalPublicoController::class, 'estadisticas']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/conductores', [UsuarioController::class, 'conductores']);

    // CIUDADADANOS
    Route::post('/ciudadano/denuncias', [DenunciaController::class, 'storeCiudadano']);
    Route::get('/ciudadano/denuncias', [DenunciaController::class, 'misDenuncias']);

    Route::get('/denuncias', [DenunciaController::class, 'index']);
    Route::get('/denuncias/{id}', [DenunciaController::class, 'show']);
    Route::patch('/denuncias/{id}/estado', [DenunciaController::class, 'cambiarEstado']);
    Route::post('/denuncias/asignar-cuadrilla', [DenunciaController::class, 'asignarCuadrilla']);
    Route::post('/denuncias/{id}/fotos', [DenunciaController::class, 'subirFoto']);

    Route::middleware(['role:ADMIN,COORDINADOR'])->group(function () {
        Route::get('/camiones', [CamionController::class, 'index']);
        Route::post('/camiones', [CamionController::class, 'store']);
        Route::put('/camiones/{id}', [CamionController::class, 'update']);
        Route::patch('/camiones/{id}/estado', [CamionController::class, 'updateEstado']);
        Route::delete('/camiones/{id}', [CamionController::class, 'destroy']);
    });

    Route::middleware(['role:ADMIN,COORDINADOR'])->group(function () {
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
        Route::get('/rutas/filtros', [RutaController::class, 'filtros']);
    });

    Route::middleware(['role:OPERADOR'])->group(function () {
        Route::get('/puntos-verdes', [PuntoReciclajeController::class, 'index']);
        Route::post('/puntos-verdes', [PuntoReciclajeController::class, 'store']);
        Route::put('/puntos-verdes/{id}', [PuntoReciclajeController::class, 'update']);
        Route::delete('/puntos-verdes/{id}', [PuntoReciclajeController::class, 'destroy']);
        Route::get('/usuarios/operadores', [UsuarioController::class, 'operadores']);
        Route::get('/tipos-material', [TipoMaterialController::class, 'index']);
        Route::get('/contenedores', [ContenedorController::class, 'index']);

        Route::get('/entregas-reciclaje', [MaterialReciclajeController::class, 'index']);
        Route::post('/entregas-reciclaje', [MaterialReciclajeController::class, 'store']);

        Route::get('/notificaciones-contenedor', [NotificacionEstadoController::class, 'index']);
        Route::patch('/notificaciones-contenedor/{id}/leer', [NotificacionEstadoController::class, 'marcarLeida']);
        Route::get('/vaciados-programados', [VaciadoProgramadoController::class, 'index']);
        Route::post('/vaciados-programados', [VaciadoProgramadoController::class, 'store']);
        Route::patch('/vaciados-programados/{id}/estado', [VaciadoProgramadoController::class, 'updateEstado']);
    });

    Route::middleware(['role:ADMIN,AUDITOR'])->group(function () {
        Route::get('/reportes/recoleccion/por-periodo', [ReporteRecoleccionController::class, 'porPeriodo']);
        Route::get('/reportes/recoleccion/por-zona', [ReporteRecoleccionController::class, 'porZona']);
        Route::get('/reportes/recoleccion/por-colonia', [ReporteRecoleccionController::class, 'porColonia']);
        Route::get('/reportes/recoleccion/por-ruta', [ReporteRecoleccionController::class, 'porRuta']);
        Route::get('/reportes/recoleccion/comparativa-mensual', [ReporteRecoleccionController::class, 'comparativaMensual']);
        Route::get('/reportes/recoleccion/comparativa-anual', [ReporteRecoleccionController::class, 'comparativaAnual']);

        Route::get('/reportes-reciclaje/material-por-tipo', [ReportesReciclajeController::class, 'materialPorTipo']);
        Route::get('/reportes-reciclaje/puntos-verdes-activos', [ReportesReciclajeController::class, 'puntosVerdesActivos']);
        Route::get('/reportes-reciclaje/tendencias-ciudadanas', [ReportesReciclajeController::class, 'tendenciasCiudadanas']);
        Route::get('/reportes-reciclaje/comparativa-materiales', [ReportesReciclajeController::class, 'comparativaMateriales']);

        Route::get('/reportes/denuncias/resumen', [ReportesDenunciasController::class, 'resumen']);
        Route::get('/reportes/denuncias/tiempo-promedio', [ReportesDenunciasController::class, 'tiempoPromedio']);
        Route::get('/reportes/denuncias/por-zona', [ReportesDenunciasController::class, 'porZona']);
    });

    Route::middleware(['role:ADMIN'])->group(function () {
        Route::get('/usuarios', [UserController::class, 'index']);
        Route::get('/usuarios/roles-disponibles', [UserController::class, 'rolesDisponibles']);
        Route::get('/usuarios/ciudadanos-registrados', [UserController::class, 'ciudadanosRegistrados']);
        Route::post('/usuarios', [UserController::class, 'store']);
        Route::put('/usuarios/{id}', [UserController::class, 'update']);
        Route::delete('/usuarios/{id}', [UserController::class, 'destroy']);
    });
});
