
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'adminMuni') THEN
    CREATE ROLE "adminMuni" LOGIN PASSWORD 'muni123';
  END IF;
END$$;

SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'reciclajeDB';

DROP DATABASE IF EXISTS "reciclajeDB";

CREATE DATABASE "reciclajeDB"
       TEMPLATE = template1
       ENCODING = 'UTF8';

DROP SCHEMA IF EXISTS reciclaje CASCADE;
CREATE SCHEMA reciclaje;

SET search_path TO reciclaje;

-- ENUMS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_estado') THEN
    CREATE TYPE rol_estado AS ENUM ('ACTIVO', 'INACTIVO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_camion') THEN
    CREATE TYPE estado_camion AS ENUM ('OPERATIVO', 'MANTENIMIENTO', 'FUERA_SERVICIO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_residuo') THEN
    CREATE TYPE tipo_residuo AS ENUM ('ORGANICO', 'INORGANICO', 'MIXTO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_basura') THEN
    CREATE TYPE tipo_basura AS ENUM ('ORGANICA', 'INORGANICA', 'MIXTA');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_asignacion') THEN
    CREATE TYPE estado_asignacion AS ENUM ('PROGRAMADA', 'EN_PROCESO', 'FINALIZADA', 'CANCELADA');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_densidad') THEN
    CREATE TYPE tipo_densidad AS ENUM ('RESIDENCIAL', 'COMERCIAL', 'INDUSTRIAL');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_recoleccion') THEN
    CREATE TYPE estado_recoleccion AS ENUM ('PROGRAMADA', 'EN_PROCESO', 'COMPLETADA', 'INCOMPLETA');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_alerta') THEN
    CREATE TYPE tipo_alerta AS ENUM ('ALERTA_75', 'URGENTE_90', 'LLENO_100');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_vaciado') THEN
    CREATE TYPE estado_vaciado AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tamano_basurero') THEN
    CREATE TYPE tamano_basurero AS ENUM ('PEQUENO', 'MEDIANO', 'GRANDE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_foto') THEN
    CREATE TYPE tipo_foto AS ENUM ('ANTES', 'DESPUES', 'EVIDENCIA');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_denuncia_enum') THEN
    CREATE TYPE estado_denuncia_enum AS ENUM ('RECIBIDA', 'EN_REVISION', 'ASIGNADA', 'EN_ATENCION', 'ATENDIDA', 'CERRADA');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_cuadrilla') THEN
    CREATE TYPE estado_cuadrilla AS ENUM ('ACTIVA', 'INACTIVA');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bitacora_accion') THEN
    CREATE TYPE bitacora_accion AS ENUM ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT');
  END IF;
END$$;

-- CREACION DE LA BD

CREATE TABLE ciudad (
  id      BIGSERIAL PRIMARY KEY,
  nombre  VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE zona (
  id         BIGSERIAL PRIMARY KEY,
  nombre     VARCHAR(120) NOT NULL,
  referencia VARCHAR(200),
  id_ciudad  BIGINT NOT NULL REFERENCES ciudad(id) ON DELETE RESTRICT,
  UNIQUE (nombre, id_ciudad)
);

CREATE TABLE colonia (
  id       BIGSERIAL PRIMARY KEY,
  nombre   VARCHAR(120) NOT NULL,
  id_zona  BIGINT NOT NULL REFERENCES zona(id) ON DELETE RESTRICT,
  UNIQUE (nombre, id_zona)
);

CREATE TABLE calle (
  id          BIGSERIAL PRIMARY KEY,
  descripcion VARCHAR(200) NOT NULL,
  id_colonia  BIGINT NOT NULL REFERENCES colonia(id) ON DELETE RESTRICT
);

CREATE TABLE direccion (
  id        BIGSERIAL PRIMARY KEY,
  id_calle  BIGINT NOT NULL REFERENCES calle(id) ON DELETE RESTRICT,
  referencia VARCHAR(250)
);

CREATE TABLE coordenada (
  id       BIGSERIAL PRIMARY KEY,
  latitud  NUMERIC(10,7) NOT NULL,
  longitud NUMERIC(10,7) NOT NULL,
  orden    INTEGER
);

CREATE TABLE calle_coordenada (
  id           BIGSERIAL PRIMARY KEY,
  id_calle     BIGINT NOT NULL REFERENCES calle(id) ON DELETE CASCADE,
  id_coordenada BIGINT NOT NULL REFERENCES coordenada(id) ON DELETE CASCADE,
  UNIQUE (id_calle, id_coordenada)
);

CREATE TABLE zona_coordenada (
  id           BIGSERIAL PRIMARY KEY,
  id_zona      BIGINT NOT NULL REFERENCES zona(id) ON DELETE CASCADE,
  id_coordenada BIGINT NOT NULL REFERENCES coordenada(id) ON DELETE CASCADE,
  UNIQUE (id_zona, id_coordenada)
);

CREATE TABLE rol (
  id     BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE,
  estado rol_estado NOT NULL DEFAULT 'ACTIVO'
);

CREATE TABLE ciudadano (
  id           BIGSERIAL PRIMARY KEY,
  cui          VARCHAR(13) NOT NULL UNIQUE,
  nombre       VARCHAR(120) NOT NULL,
  apellido     VARCHAR(120) NOT NULL,
  email        VARCHAR(150),
  telefono     VARCHAR(30),
  id_direccion BIGINT REFERENCES direccion(id) ON DELETE SET NULL
);

CREATE TABLE usuario (
  id           BIGSERIAL PRIMARY KEY,
  id_rol       BIGINT NOT NULL REFERENCES rol(id) ON DELETE RESTRICT,
  id_ciudadano BIGINT REFERENCES ciudadano(id) ON DELETE SET NULL,
  nombre       VARCHAR(120) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE camion (
  id             BIGSERIAL PRIMARY KEY,
  placa          VARCHAR(20) NOT NULL UNIQUE,
  capacidad_carga NUMERIC(10,2) NOT NULL CHECK (capacidad_carga >= 0),
  estado         estado_camion NOT NULL DEFAULT 'OPERATIVO'
);

CREATE TABLE ruta (
  id            BIGSERIAL PRIMARY KEY,
  nombre        VARCHAR(150) NOT NULL UNIQUE,
  distancia     NUMERIC(10,2) CHECK (distancia >= 0),
  dias_asignados TEXT,        
  horario       TEXT,         
  tipo_residuo  tipo_residuo NOT NULL
);

CREATE TABLE tipo_orden (
  id         BIGSERIAL PRIMARY KEY,
  inicio     VARCHAR(50),
  intermedio VARCHAR(50),
  fin        VARCHAR(50)
);

CREATE TABLE ruta_coordenada (
  id             BIGSERIAL PRIMARY KEY,
  id_ruta        BIGINT NOT NULL REFERENCES ruta(id) ON DELETE CASCADE,
  id_tipo_orden  BIGINT NOT NULL REFERENCES tipo_orden(id) ON DELETE RESTRICT,
  id_coordenada  BIGINT NOT NULL REFERENCES coordenada(id) ON DELETE RESTRICT,
  UNIQUE (id_ruta, id_coordenada)
);

CREATE TABLE ruta_colonia (
  id_ruta    BIGINT NOT NULL REFERENCES ruta(id) ON DELETE CASCADE,
  id_colonia BIGINT NOT NULL REFERENCES colonia(id) ON DELETE CASCADE,
  PRIMARY KEY (id_ruta, id_colonia)
);

CREATE TABLE basura (
  id            BIGSERIAL PRIMARY KEY,
  tipo_basura   tipo_basura NOT NULL,
  peso_toneladas NUMERIC(10,2) CHECK (peso_toneladas >= 0)
);

CREATE TABLE asignacion_camion_ruta (
  id                  BIGSERIAL PRIMARY KEY,
  id_camion           BIGINT NOT NULL REFERENCES camion(id) ON DELETE RESTRICT,
  id_ruta             BIGINT NOT NULL REFERENCES ruta(id) ON DELETE RESTRICT,
  id_usuario_conductor BIGINT REFERENCES usuario(id) ON DELETE SET NULL,
  fecha               DATE NOT NULL,
  estado              estado_asignacion NOT NULL DEFAULT 'PROGRAMADA'
);

CREATE TABLE generacion_dinamica (
  id                      BIGSERIAL PRIMARY KEY,
  id_asignacion_camion_ruta BIGINT NOT NULL REFERENCES asignacion_camion_ruta(id) ON DELETE CASCADE,
  id_basura               BIGINT REFERENCES basura(id) ON DELETE SET NULL,
  cantidad_puntos         INTEGER NOT NULL CHECK (cantidad_puntos BETWEEN 0 AND 1000),
  total_basura            NUMERIC(12,2) CHECK (total_basura >= 0),
  tipo_densidad           tipo_densidad NOT NULL,
  fecha_generacion        DATE NOT NULL,
  fecha_dia_semana        TEXT
);

CREATE TABLE punto_recoleccion (
  id                    BIGSERIAL PRIMARY KEY,
  id_generacion_dinamica BIGINT NOT NULL REFERENCES generacion_dinamica(id) ON DELETE CASCADE,
  latitud               NUMERIC(10,7) NOT NULL,
  longitud              NUMERIC(10,7) NOT NULL,
  volumen_kg            NUMERIC(10,2) NOT NULL CHECK (volumen_kg >= 0),
  orden                 INTEGER,
  recolectado_bool      BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE recoleccion (
  id                     BIGSERIAL PRIMARY KEY,
  id_asignacion_camion_ruta BIGINT NOT NULL REFERENCES asignacion_camion_ruta(id) ON DELETE RESTRICT,
  estado                 estado_recoleccion NOT NULL DEFAULT 'PROGRAMADA',
  hora_inicio            TIMESTAMP,
  hora_fin               TIMESTAMP,
  id_basura              BIGINT REFERENCES basura(id) ON DELETE SET NULL,
  observaciones          VARCHAR(300),
  incidencias            VARCHAR(300)
);

CREATE TABLE punto_reciclaje (
  id                  BIGSERIAL PRIMARY KEY,
  id_usuario_encargado BIGINT REFERENCES usuario(id) ON DELETE SET NULL,
  id_direccion        BIGINT REFERENCES direccion(id) ON DELETE SET NULL,
  nombre              VARCHAR(150) NOT NULL,
  latitud             NUMERIC(10,7) NOT NULL,
  longitud            NUMERIC(10,7) NOT NULL,
  capacidad_m3        NUMERIC(10,2) CHECK (capacidad_m3 >= 0),
  horario_atencion    TEXT
);

CREATE TABLE tipo_material (
  id          BIGSERIAL PRIMARY KEY,
  nombre_tipo VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(200)
);

CREATE TABLE contenedor (
  id               BIGSERIAL PRIMARY KEY,
  id_punto_reciclaje BIGINT NOT NULL REFERENCES punto_reciclaje(id) ON DELETE CASCADE,
  id_tipo_material BIGINT NOT NULL REFERENCES tipo_material(id) ON DELETE RESTRICT,
  porcentaje       NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (porcentaje BETWEEN 0 AND 100),
  nivel_actual     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (nivel_actual >= 0),
  capacidad_m3     NUMERIC(10,2) CHECK (capacidad_m3 >= 0),
  UNIQUE (id_punto_reciclaje, id_tipo_material)
);

CREATE TABLE material_reciclaje (
  id                BIGSERIAL PRIMARY KEY,
  id_ciudadano      BIGINT REFERENCES ciudadano(id) ON DELETE SET NULL,
  id_usuario_operador BIGINT REFERENCES usuario(id) ON DELETE SET NULL,
  id_contenedor     BIGINT NOT NULL REFERENCES contenedor(id) ON DELETE RESTRICT,
  cantidad          NUMERIC(12,2) NOT NULL CHECK (cantidad >= 0),
  fecha_entrega     DATE NOT NULL,
  hora_entrega      TIME
);

CREATE TABLE vaciado_programado (
  id                   BIGSERIAL PRIMARY KEY,
  id_contenedor        BIGINT NOT NULL REFERENCES contenedor(id) ON DELETE CASCADE,
  id_usuario_responsable BIGINT REFERENCES usuario(id) ON DELETE SET NULL,
  hora_fecha           TIMESTAMP NOT NULL,
  estado               estado_vaciado NOT NULL DEFAULT 'PENDIENTE',
  observacion          VARCHAR(250)
);

CREATE TABLE notificacion_estado (
  id           BIGSERIAL PRIMARY KEY,
  id_contenedor BIGINT NOT NULL REFERENCES contenedor(id) ON DELETE CASCADE,
  tipo_alerta  tipo_alerta NOT NULL,
  fecha_hora   TIMESTAMP NOT NULL DEFAULT NOW(),
  mensaje      VARCHAR(250),
  leida_bool   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE tamano (
  id          BIGSERIAL PRIMARY KEY,
  tipo_nombre tamano_basurero NOT NULL,
  descripcion VARCHAR(200)
);

CREATE TABLE estado_denuncia (
  id           BIGSERIAL PRIMARY KEY,
  nombre_estado estado_denuncia_enum NOT NULL UNIQUE
);

CREATE TABLE basurero (
  id              BIGSERIAL PRIMARY KEY,
  id_coordenada   BIGINT REFERENCES coordenada(id) ON DELETE SET NULL,
  id_tamano_basurero BIGINT REFERENCES tamano(id) ON DELETE SET NULL
);

CREATE TABLE formulario (
  id                 BIGSERIAL PRIMARY KEY,
  id_basurero        BIGINT NOT NULL REFERENCES basurero(id) ON DELETE CASCADE,
  id_ciudadano       BIGINT REFERENCES ciudadano(id) ON DELETE SET NULL,
  id_estado_denuncia BIGINT NOT NULL REFERENCES estado_denuncia(id) ON DELETE RESTRICT,
  descripcion        VARCHAR(300),
  fecha_denuncia     DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE foto (
  id           BIGSERIAL PRIMARY KEY,
  id_formulario BIGINT NOT NULL REFERENCES formulario(id) ON DELETE CASCADE,
  tipo_foto    tipo_foto NOT NULL,
  ruta_archivo VARCHAR(300) NOT NULL,
  fecha        DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE cuadrilla (
  id             BIGSERIAL PRIMARY KEY,
  nombre         VARCHAR(120) NOT NULL,
  estado         estado_cuadrilla NOT NULL DEFAULT 'ACTIVA',
  disponibilidad VARCHAR(120)
);

CREATE TABLE asignacion_denuncia (
  id               BIGSERIAL PRIMARY KEY,
  id_formulario    BIGINT NOT NULL REFERENCES formulario(id) ON DELETE CASCADE,
  id_cuadrilla      BIGINT NOT NULL REFERENCES cuadrilla(id) ON DELETE RESTRICT,
  fecha_programada DATE,
  recursos_estimados VARCHAR(250),
  observacion      VARCHAR(250)
);

CREATE TABLE notificacion_denuncia (
  id           BIGSERIAL PRIMARY KEY,
  id_formulario BIGINT NOT NULL REFERENCES formulario(id) ON DELETE CASCADE,
  fecha        TIMESTAMP NOT NULL DEFAULT NOW(),
  mensaje      VARCHAR(250),
  enviada_bool BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE bitacora (
  id          BIGSERIAL PRIMARY KEY,
  id_usuario  BIGINT REFERENCES usuario(id) ON DELETE SET NULL,
  accion      bitacora_accion NOT NULL,
  nombre_tabla VARCHAR(80) NOT NULL,
  id_registro BIGINT,
  fecha_hora  TIMESTAMP NOT NULL DEFAULT NOW(),
  detalle     VARCHAR(300)
);


-- PRIVILEGIOS

-- Acceso a la base de datos
GRANT CONNECT ON DATABASE "reciclajeDB" TO "adminMuni";

-- Acceso al esquema
GRANT USAGE, CREATE ON SCHEMA reciclaje TO "adminMuni";

-- Acceso a objetos existentes
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA reciclaje TO "adminMuni";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA reciclaje TO "adminMuni";
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA reciclaje TO "adminMuni";

-- Privilegios 
ALTER DEFAULT PRIVILEGES IN SCHEMA reciclaje
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "adminMuni";

ALTER DEFAULT PRIVILEGES IN SCHEMA reciclaje
  GRANT ALL ON SEQUENCES TO "adminMuni";

ALTER DEFAULT PRIVILEGES IN SCHEMA reciclaje
  GRANT EXECUTE ON FUNCTIONS TO "adminMuni";

ALTER ROLE "adminMuni" IN DATABASE "reciclajeDB" SET search_path = reciclaje, public;


