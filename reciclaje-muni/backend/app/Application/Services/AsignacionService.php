<?php

namespace App\Application\Services;

use App\Models\Camion;
use App\Models\Ruta;
use App\Models\Usuario;
use App\Repositories\AsignacionRepository;

class AsignacionService
{
    public function __construct(private AsignacionRepository $repo) {}

    public function list()
    {
        return $this->repo->all();
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
            throw new \Exception("El camión no está OPERATIVO.");
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

        return $this->repo->create([
            'id_camion' => $idCamion,
            'id_ruta' => $idRuta,
            'id_usuario_conductor' => $idConductor,
            'fecha' => $fecha,
            'estado' => 'PROGRAMADA',
        ]);
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
