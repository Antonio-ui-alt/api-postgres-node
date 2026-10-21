CREATE TABLE IF NOT EXISTS tareas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  completada BOOLEAN NOT NULL DEFAULT FALSE,
  creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS peliculas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL UNIQUE,
  director VARCHAR(150) NOT NULL,
  anio SMALLINT NOT NULL CHECK (anio BETWEEN 1888 AND 2100),
  genero VARCHAR(100) NOT NULL,
  sinopsis TEXT NOT NULL DEFAULT '',
  calificacion NUMERIC(3, 1) NOT NULL DEFAULT 0 CHECK (calificacion BETWEEN 0 AND 10),
  creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO peliculas (titulo, director, anio, genero, sinopsis, calificacion) VALUES
  ('Coco', 'Lee Unkrich', 2017, 'Animación', 'Miguel viaja al mundo de los muertos para descubrir la historia de su familia.', 8.4),
  ('Interestelar', 'Christopher Nolan', 2014, 'Ciencia ficción', 'Un grupo de exploradores busca un nuevo hogar para la humanidad.', 8.7),
  ('El laberinto del fauno', 'Guillermo del Toro', 2006, 'Fantasía', 'Una niña descubre un misterioso mundo fantástico en la España de posguerra.', 8.2),
  ('Parásitos', 'Bong Joon-ho', 2019, 'Drama', 'Dos familias de mundos distintos quedan unidas por un plan inesperado.', 8.5),
  ('Spider-Man: Into the Spider-Verse', 'Bob Persichetti, Peter Ramsey y Rodney Rothman', 2018, 'Animación', 'Miles Morales descubre que no es el único Spider-Man.', 8.4)
ON CONFLICT (titulo) DO NOTHING;
