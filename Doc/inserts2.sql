INSERT INTO reciclaje.rol (nombre, estado)
VALUES ('CONDUCTOR','ACTIVO')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO reciclaje.usuario (id_rol, nombre, email, password_hash)
VALUES
(
 (SELECT id FROM reciclaje.rol WHERE nombre = 'CONDUCTOR'),
 'Pedro Ramirez',
 'pedro@muni.com',
 '$2y$12$1CLArMslFnBgdJU9o8j.UObuifGcDbIJOeIiNT6vh1e4vt3Ac8EY6'
),

(
 (SELECT id FROM reciclaje.rol WHERE nombre = 'CONDUCTOR'),
 'Luis Hernandez',
 'luis@muni.com',
 '$2y$12$1CLArMslFnBgdJU9o8j.UObuifGcDbIJOeIiNT6vh1e4vt3Ac8EY6'
)
ON CONFLICT (email) DO NOTHING;

