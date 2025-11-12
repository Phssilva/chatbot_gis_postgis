-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create schema for geospatial data
CREATE SCHEMA IF NOT EXISTS geo;

-- Table: Brazilian States (Estados)
CREATE TABLE geo.estados (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    sigla VARCHAR(2) NOT NULL UNIQUE,
    regiao VARCHAR(50),
    populacao INTEGER,
    area_km2 NUMERIC(10, 2),
    geom GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Highways (Rodovias)
CREATE TABLE geo.rodovias (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    nome VARCHAR(200),
    tipo VARCHAR(50), -- Federal, Estadual, Municipal
    extensao_km NUMERIC(10, 2),
    estado_sigla VARCHAR(2),
    condicao VARCHAR(50), -- Boa, Regular, Ruim
    geom GEOMETRY(MultiLineString, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estado_sigla) REFERENCES geo.estados(sigla)
);

-- Table: Cities (Cidades)
CREATE TABLE geo.cidades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    estado_sigla VARCHAR(2),
    populacao INTEGER,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estado_sigla) REFERENCES geo.estados(sigla)
);

-- Create spatial indexes
CREATE INDEX idx_estados_geom ON geo.estados USING GIST(geom);
CREATE INDEX idx_rodovias_geom ON geo.rodovias USING GIST(geom);
CREATE INDEX idx_cidades_geom ON geo.cidades USING GIST(geom);

-- Insert sample data for Brazilian states (simplified geometries)
INSERT INTO geo.estados (nome, sigla, regiao, populacao, area_km2, geom) VALUES
('São Paulo', 'SP', 'Sudeste', 46649132, 248219.48, 
    ST_GeomFromText('MULTIPOLYGON(((-48 -22, -45 -22, -45 -25, -48 -25, -48 -22)))', 4326)),
('Rio de Janeiro', 'RJ', 'Sudeste', 17463349, 43750.42,
    ST_GeomFromText('MULTIPOLYGON(((-45 -22, -41 -22, -41 -23.5, -45 -23.5, -45 -22)))', 4326)),
('Minas Gerais', 'MG', 'Sudeste', 21411923, 586521.12,
    ST_GeomFromText('MULTIPOLYGON(((-48 -15, -42 -15, -42 -23, -48 -23, -48 -15)))', 4326)),
('Paraná', 'PR', 'Sul', 11597484, 199307.92,
    ST_GeomFromText('MULTIPOLYGON(((-55 -23, -48 -23, -48 -27, -55 -27, -55 -23)))', 4326)),
('Santa Catarina', 'SC', 'Sul', 7338473, 95730.69,
    ST_GeomFromText('MULTIPOLYGON(((-54 -26, -48 -26, -48 -29.5, -54 -29.5, -54 -26)))', 4326)),
('Rio Grande do Sul', 'RS', 'Sul', 11466630, 281707.15,
    ST_GeomFromText('MULTIPOLYGON(((-58 -27, -49 -27, -49 -34, -58 -34, -58 -27)))', 4326));

-- Insert sample highways
INSERT INTO geo.rodovias (codigo, nome, tipo, extensao_km, estado_sigla, condicao, geom) VALUES
('BR-101', 'Rodovia BR-101', 'Federal', 850.5, 'SC', 'Boa',
    ST_GeomFromText('MULTILINESTRING((-48.5 -26.3, -49.0 -27.5, -49.5 -28.8))', 4326)),
('BR-116', 'Rodovia Régis Bittencourt', 'Federal', 402.6, 'SP', 'Regular',
    ST_GeomFromText('MULTILINESTRING((-46.6 -23.5, -47.0 -24.0, -48.0 -24.5))', 4326)),
('BR-381', 'Rodovia Fernão Dias', 'Federal', 562.1, 'MG', 'Boa',
    ST_GeomFromText('MULTILINESTRING((-46.0 -22.0, -45.5 -20.0, -44.5 -18.0))', 4326)),
('SP-348', 'Rodovia dos Bandeirantes', 'Estadual', 157.0, 'SP', 'Boa',
    ST_GeomFromText('MULTILINESTRING((-46.6 -23.5, -47.0 -23.0, -47.5 -22.8))', 4326)),
('PR-445', 'Rodovia PR-445', 'Estadual', 89.3, 'PR', 'Regular',
    ST_GeomFromText('MULTILINESTRING((-51.2 -23.3, -51.0 -23.8, -50.8 -24.2))', 4326));

-- Insert sample cities
INSERT INTO geo.cidades (nome, estado_sigla, populacao, geom) VALUES
('São Paulo', 'SP', 12396372, ST_GeomFromText('POINT(-46.6333 -23.5505)', 4326)),
('Rio de Janeiro', 'RJ', 6775561, ST_GeomFromText('POINT(-43.1729 -22.9068)', 4326)),
('Belo Horizonte', 'MG', 2530701, ST_GeomFromText('POINT(-43.9378 -19.9208)', 4326)),
('Curitiba', 'PR', 1963726, ST_GeomFromText('POINT(-49.2732 -25.4195)', 4326)),
('Florianópolis', 'SC', 508826, ST_GeomFromText('POINT(-48.5482 -27.5945)', 4326)),
('Porto Alegre', 'RS', 1492530, ST_GeomFromText('POINT(-51.2177 -30.0346)', 4326));

-- Create materialized view for statistics
CREATE MATERIALIZED VIEW geo.stats_rodovias_por_estado AS
SELECT 
    e.sigla,
    e.nome as estado_nome,
    COUNT(r.id) as total_rodovias,
    SUM(r.extensao_km) as extensao_total_km,
    COUNT(CASE WHEN r.tipo = 'Federal' THEN 1 END) as rodovias_federais,
    COUNT(CASE WHEN r.tipo = 'Estadual' THEN 1 END) as rodovias_estaduais,
    COUNT(CASE WHEN r.condicao = 'Boa' THEN 1 END) as rodovias_boas,
    COUNT(CASE WHEN r.condicao = 'Regular' THEN 1 END) as rodovias_regulares,
    COUNT(CASE WHEN r.condicao = 'Ruim' THEN 1 END) as rodovias_ruins
FROM geo.estados e
LEFT JOIN geo.rodovias r ON e.sigla = r.estado_sigla
GROUP BY e.sigla, e.nome;

-- Grant permissions
GRANT USAGE ON SCHEMA geo TO geouser;
GRANT SELECT ON ALL TABLES IN SCHEMA geo TO geouser;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA geo TO geouser;
GRANT SELECT ON geo.stats_rodovias_por_estado TO geouser;
