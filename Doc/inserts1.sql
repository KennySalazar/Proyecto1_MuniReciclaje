INSERT INTO reciclaje.tipo_orden (inicio, intermedio, fin)
VALUES ('INICIO','INTERMEDIO','FIN')
ON CONFLICT DO NOTHING;
