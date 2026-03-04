<?php

namespace App\Application\Services;

use App\Repositories\CamionRepository;

class CamionService
{
    private CamionRepository $repo;

    public function __construct(CamionRepository $repo)
    {
        $this->repo = $repo;
    }

    public function all()
    {
        return $this->repo->all();
    }

    public function create(array $data)
    {
        return $this->repo->create($data);
    }

    public function update($id, array $data)
    {
        return $this->repo->update($id, $data);
    }

    public function delete($id)
    {
        return $this->repo->delete($id);
    }
}
