-- Example Queries for AI Training
-- These queries help the LLM understand how to query geospatial data

-- Query 1: Count highways by state
-- Question: "Quantas rodovias tem em cada estado?"
SELECT 
    e.nome as estado,
    COUNT(r.id) as total_rodovias
FROM geo.estados e
LEFT JOIN geo.rodovias r ON e.sigla = r.estado_sigla
GROUP BY e.nome
ORDER BY total_rodovias DESC;

-- Query 2: Total highway length by state
-- Question: "Qual a extensão total de rodovias por estado?"
SELECT 
    e.nome as estado,
    COALESCE(SUM(r.extensao_km), 0) as extensao_total_km
FROM geo.estados e
LEFT JOIN geo.rodovias r ON e.sigla = r.estado_sigla
GROUP BY e.nome
ORDER BY extensao_total_km DESC;

-- Query 3: Federal vs State highways
-- Question: "Quantas rodovias federais e estaduais existem?"
SELECT 
    tipo,
    COUNT(*) as quantidade,
    SUM(extensao_km) as extensao_total_km
FROM geo.rodovias
GROUP BY tipo;

-- Query 4: Highway conditions
-- Question: "Qual a condição das rodovias?"
SELECT 
    condicao,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM geo.rodovias
GROUP BY condicao
ORDER BY quantidade DESC;

-- Query 5: Cities within a state
-- Question: "Quais cidades estão em São Paulo?"
SELECT 
    c.nome,
    c.populacao,
    ST_AsText(c.geom) as coordenadas
FROM geo.cidades c
WHERE c.estado_sigla = 'SP'
ORDER BY c.populacao DESC;

-- Query 6: Highways passing through a state
-- Question: "Quais rodovias passam por Santa Catarina?"
SELECT 
    r.codigo,
    r.nome,
    r.tipo,
    r.extensao_km,
    r.condicao
FROM geo.rodovias r
WHERE r.estado_sigla = 'SC'
ORDER BY r.extensao_km DESC;

-- Query 7: Distance between cities
-- Question: "Qual a distância entre São Paulo e Rio de Janeiro?"
SELECT 
    c1.nome as cidade1,
    c2.nome as cidade2,
    ROUND(ST_Distance(c1.geom::geography, c2.geom::geography) / 1000, 2) as distancia_km
FROM geo.cidades c1, geo.cidades c2
WHERE c1.nome = 'São Paulo' AND c2.nome = 'Rio de Janeiro';

-- Query 8: States by region
-- Question: "Quais estados estão na região Sul?"
SELECT 
    nome,
    sigla,
    populacao,
    area_km2
FROM geo.estados
WHERE regiao = 'Sul'
ORDER BY populacao DESC;

-- Query 9: Population density by state
-- Question: "Qual a densidade populacional dos estados?"
SELECT 
    nome,
    populacao,
    area_km2,
    ROUND(populacao / area_km2, 2) as densidade_hab_km2
FROM geo.estados
ORDER BY densidade_hab_km2 DESC;

-- Query 10: Highways intersecting with state boundaries (spatial query)
-- Question: "Quais rodovias cruzam a fronteira entre estados?"
SELECT DISTINCT
    r.codigo,
    r.nome,
    r.estado_sigla as estado_principal,
    e2.sigla as estado_intersecao
FROM geo.rodovias r
JOIN geo.estados e1 ON r.estado_sigla = e1.sigla
JOIN geo.estados e2 ON ST_Intersects(r.geom, e2.geom)
WHERE e1.sigla != e2.sigla;

-- Query 11: Cities near highways (spatial buffer query)
-- Question: "Quais cidades estão próximas da BR-101?"
SELECT 
    c.nome as cidade,
    c.estado_sigla,
    r.codigo as rodovia,
    ROUND(ST_Distance(c.geom::geography, r.geom::geography) / 1000, 2) as distancia_km
FROM geo.cidades c
CROSS JOIN geo.rodovias r
WHERE r.codigo = 'BR-101'
    AND ST_DWithin(c.geom::geography, r.geom::geography, 50000) -- 50km buffer
ORDER BY distancia_km;

-- Query 12: State area statistics
-- Question: "Qual o maior e menor estado por área?"
(SELECT nome, area_km2, 'Maior' as tipo
FROM geo.estados
ORDER BY area_km2 DESC
LIMIT 1)
UNION ALL
(SELECT nome, area_km2, 'Menor' as tipo
FROM geo.estados
ORDER BY area_km2 ASC
LIMIT 1);

-- Query 13: Using materialized view
-- Question: "Me mostre as estatísticas de rodovias por estado"
SELECT * FROM geo.stats_rodovias_por_estado
ORDER BY total_rodovias DESC;

-- Query 14: Highway quality by state
-- Question: "Qual estado tem rodovias em melhor condição?"
SELECT 
    e.nome as estado,
    COUNT(CASE WHEN r.condicao = 'Boa' THEN 1 END) as rodovias_boas,
    COUNT(CASE WHEN r.condicao = 'Regular' THEN 1 END) as rodovias_regulares,
    COUNT(CASE WHEN r.condicao = 'Ruim' THEN 1 END) as rodovias_ruins,
    ROUND(COUNT(CASE WHEN r.condicao = 'Boa' THEN 1 END) * 100.0 / COUNT(*), 2) as percentual_boas
FROM geo.estados e
JOIN geo.rodovias r ON e.sigla = r.estado_sigla
GROUP BY e.nome
ORDER BY percentual_boas DESC;

-- Query 15: Bounding box of all highways
-- Question: "Qual a área geográfica coberta pelas rodovias?"
SELECT 
    ST_AsText(ST_Envelope(ST_Collect(geom))) as bounding_box,
    ST_AsGeoJSON(ST_Envelope(ST_Collect(geom))) as bounding_box_geojson
FROM geo.rodovias;
