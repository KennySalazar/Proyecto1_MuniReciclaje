<?php

namespace App\Application\Services;

use App\Infrastructure\DAO\RutaDAO;

class RutaService
{
    public function __construct(private RutaDAO $rutaDAO) {}

    public function listar(): array
    {
        return $this->rutaDAO->listRutas();
    }

    public function crear(array $data): array
    {

        $data['distancia_km'] = round((float)$data['distancia_km'], 2);

        return $this->rutaDAO->createRutaConCoordenadas($data);
    }
}
