<?php

namespace App\Application\Services;

use App\Models\PuntoReciclaje;
use Illuminate\Support\Facades\DB;

class PuntoReciclajeService
{
    public function list()
    {
        return DB::table('reciclaje.punto_reciclaje as pr')
            ->leftJoin('reciclaje.direccion as d', 'd.id', '=', 'pr.id_direccion')
            ->leftJoin('reciclaje.usuario as u', 'u.id', '=', 'pr.id_usuario_encargado')
            ->select(
                'pr.id',
                'pr.nombre',
                'pr.latitud',
                'pr.longitud',
                'pr.capacidad_m3',
                'pr.horario_atencion',
                'pr.id_usuario_encargado',
                'u.nombre as nombre_encargado',
                'u.email as email_encargado',
                'd.referencia as direccion'
            )
            ->orderBy('pr.nombre')
            ->get();
    }

    public function get($id)
    {
        return PuntoReciclaje::findOrFail($id);
    }

    public function create($data)
    {
        $punto = PuntoReciclaje::create($data);

        $tiposMaterial = DB::table('reciclaje.tipo_material')
            ->select('id')
            ->get();

        $cantidadTipos = $tiposMaterial->count();

        if ($cantidadTipos > 0) {
            $capacidadPorContenedor = round(((float) $punto->capacidad_m3) / $cantidadTipos, 2);
        } else {
            $capacidadPorContenedor = 0;
        }

        $contenedores = [];

        foreach ($tiposMaterial as $tipo) {
            $contenedores[] = [
                'id_punto_reciclaje' => $punto->id,
                'id_tipo_material' => $tipo->id,
                'porcentaje' => 0,
                'nivel_actual' => 0,
                'capacidad_m3' => $capacidadPorContenedor,
            ];
        }

        if (!empty($contenedores)) {
            DB::table('reciclaje.contenedor')->insert($contenedores);
        }

        return $punto;
    }

    public function update($id, $data)
    {
        $p = PuntoReciclaje::findOrFail($id);
        $p->update($data);
        return $p;
    }

    public function delete($id)
    {
        $p = PuntoReciclaje::findOrFail($id);
        $p->delete();
    }
}
