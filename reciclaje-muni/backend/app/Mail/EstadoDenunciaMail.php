<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class EstadoDenunciaMail extends Mailable
{
    public string $tituloCorreo;
    public string $mensajeTexto;

    public function __construct(string $tituloCorreo, string $mensajeTexto)
    {
        $this->tituloCorreo = $tituloCorreo;
        $this->mensajeTexto = $mensajeTexto;
    }

    public function build()
    {
        return $this->subject($this->tituloCorreo)
            ->view('emails.estado_denuncia');
    }
}
