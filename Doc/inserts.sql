INSERT INTO reciclaje.rol (nombre, estado)
VALUES 
('ADMIN', 'ACTIVO'),
('COORDINADOR', 'ACTIVO'),
('OPERADOR', 'ACTIVO'),
('AUDITOR', 'ACTIVO')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO reciclaje.usuario (id_rol, nombre, email, password_hash)
VALUES
(
 (SELECT id FROM reciclaje.rol WHERE nombre = 'ADMIN'),
 'Administrador Municipal',
 'admin@muni.com',
 '$2y$12$1CLArMslFnBgdJU9o8j.UObuifGcDbIJOeIiNT6vh1e4vt3Ac8EY6'
),


(
 (SELECT id FROM reciclaje.rol WHERE nombre = 'COORDINADOR'),
 'Coordinador de Rutas',
 'coordinador@muni.com',
 '$2y$12$hLRWoGvVfI9P4uk8MYaXbuYgNBglGs6Cp/vjrcT4Xx8P9Qtvb2A2m'
),

(
 (SELECT id FROM reciclaje.rol WHERE nombre = 'OPERADOR'),
 'Operador Punto Verde',
 'operador@muni.com',
 '$2y$12$uX7OPjgKV3X0IhlI5S0ZLe9C2kYtXZR6tHJUs6m8WMjqsNu7uVVD2'
),

(
 (SELECT id FROM reciclaje.rol WHERE nombre = 'AUDITOR'),
 'Auditor Municipal',
 'auditor@muni.com',
 '$2y$12$sIiNWNFaYkXE6achUYoXbe4lT4f1Zuijl.GLHcVVbcniUar1djR5.'
)
ON CONFLICT (email) DO NOTHING;

