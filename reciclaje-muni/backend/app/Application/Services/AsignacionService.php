<?php

namespace App\Application\Services;

use App\Models\Camion;
use App\Models\Ruta;
use App\Models\Usuario;
use App\Models\Recoleccion;
use App\Repositories\AsignacionRepository;
use App\Application\Services\GeneracionDinamicaService;
use Illuminate\Support\Facades\DB;

class AsignacionService
{
    public function __construct(
        private AsignacionRepository $repo,
        private GeneracionDinamicaService $genService
    ) {}

    public function list()
    {
        // ✅ Enriquecido para el combobox (nombre ruta + placa + capacidad)
        return DB::table('reciclaje.asignacion_camion_ruta as a')
            ->join('reciclaje.ruta as r', 'r.id', '=', 'a.id_ruta')
            ->join('reciclaje.camion as c', 'c.id', '=', 'a.id_camion')
            ->leftJoin('reciclaje.usuario as u', 'u.id', '=', 'a.id_usuario_conductor') // si no tenés esta tabla, podés borrar este join
            ->select([
                'a.id',
                'a.id_camion',
                'a.id_ruta',
                'a.id_usuario_conductor',
                'a.fecha',
                'a.estado',

                // ruta
                'r.nombre as ruta_nombre',

                // camion
                'c.placa as camion_placa',
                'c.capacidad_carga as camion_capacidad',  // ⚠️ si tu columna se llama distinto, cambiala aquí
                'c.estado as camion_estado',

                // conductor (opcional)
                DB::raw("COALESCE(u.nombre, '') as conductor_nombre"),
            ])
            ->orderBy('a.fecha', 'desc')
            ->orderBy('a.id', 'desc')
            ->get();
    }

    public function create(array $data)
    {
        $idCamion = $data['id_camion'] ?? null;
        $idRuta = $data['id_ruta'] ?? null;
        $idConductor = $data['id_usuario_conductor'] ?? null;
        $fecha = $data['fecha'] ?? null;

        if (!$idCamion || !$idRuta || !$fecha) {
            throw new \Exception("id_camion, id_ruta y fecha son requeridos");
        }

        $camion = Camion::findOrFail($idCamion);
        if ($camion->estado !== 'OPERATIVO') {
            throw new \Exception("El camión no esta disponible");
        }

        Ruta::findOrFail($idRuta);

        if ($idConductor) {
            $conductor = Usuario::with('rol')->findOrFail($idConductor);
            if (!$conductor->rol || $conductor->rol->nombre !== 'CONDUCTOR') {
                throw new \Exception("El usuario seleccionado no es conductor (rol inválido).");
            }
        }

        if ($this->repo->existsAsignacionActivaEnFecha($idCamion, $fecha)) {
            throw new \Exception("Ese camión ya tiene una asignación activa en esa fecha.");
        }

        $asignacion = $this->repo->create([
            'id_camion' => $idCamion,
            'id_ruta' => $idRuta,
            'id_usuario_conductor' => $idConductor,
            'fecha' => $fecha,
            'estado' => 'PROGRAMADA',
        ]);
        Recoleccion::firstOrCreate(
            ['id_asignacion_camion_ruta' => $asignacion->id],
            [
                'estado' => 'PROGRAMADA',
                'hora_inicio' => null,
                'hora_fin' => null,
                'id_basura' => null,
                'observaciones' => null,
                'incidencias' => '[]',
                'lat_actual' => null,
                'lng_actual' => null,
                'punto_actual' => 0,
                'updated_at' => now(),
            ]
        );

        return $asignacion;
    }
    public function update($id, array $data)
    {
        $asig = $this->repo->findOrFail($id);

        $idCamion = $data['id_camion'] ?? $asig->id_camion;
        $idRuta = $data['id_ruta'] ?? $asig->id_ruta;
        $idConductor = array_key_exists('id_usuario_conductor', $data)
            ? $data['id_usuario_conductor']
            : $asig->id_usuario_conductor;

        $fecha = $data['fecha'] ?? $asig->fecha;

        $camion = Camion::findOrFail($idCamion);
        if ($camion->estado !== 'OPERATIVO') {
            throw new \Exception("El camión no está OPERATIVO.");
        }

        Ruta::findOrFail($idRuta);

        if ($idConductor) {
            $conductor = Usuario::with('rol')->findOrFail($idConductor);
            if (!$conductor->rol || $conductor->rol->nombre !== 'CONDUCTOR') {
                throw new \Exception("El usuario seleccionado no es conductor (rol inválido).");
            }
        }

        if ($this->repo->existsAsignacionActivaEnFechaExcept($id, $idCamion, $fecha)) {
            throw new \Exception("Ese camión ya tiene una asignación activa en esa fecha.");
        }

        return $this->repo->update($id, [
            'id_camion' => $idCamion,
            'id_ruta' => $idRuta,
            'id_usuario_conductor' => $idConductor,
            'fecha' => $fecha,
        ]);
    }

    public function updateEstado($id, string $estado)
    {
        $permitidos = ['PROGRAMADA', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'];
        if (!in_array($estado, $permitidos)) {
            throw new \Exception("Estado inválido.");
        }

        return $this->repo->update($id, ['estado' => $estado]);
    }

    public function delete($id)
    {
        $this->repo->delete($id);
        return true;
    }
}
