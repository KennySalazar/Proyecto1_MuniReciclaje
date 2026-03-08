<?php

namespace App\Application\Services;

use App\Infrastructure\DAO\RutaDAO;
use Illuminate\Support\Facades\DB;

class RutaService
{
    public function __construct(private RutaDAO $rutaDAO) {}

    public function listar(): array
    {
        return $this->rutaDAO->listRutas();
    }

    public function filtros(): array
    {
        $zonas = DB::table('reciclaje.zona')
            ->orderBy('nombre')
            ->get(['id', 'nombre'])
            ->toArray();

        $colonias = DB::table('reciclaje.colonia')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'id_zona'])
            ->toArray();

        return [
            'zonas' => $zonas,
            'colonias' => $colonias,
        ];
    }

    public function crear(array $data): array
    {
        $data['distancia_km'] = round((float)$data['distancia_km'], 2);

        if (empty($data['id_colonia'])) {
            throw new \Exception("La colonia es obligatoria.");
        }

        return $this->rutaDAO->createRutaConCoordenadas($data);
    }
}
