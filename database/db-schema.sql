-- Database Schema Documentation for AI Context
-- This file describes the structure of the geospatial database

-- SCHEMA: geo
-- Contains all geospatial tables and views

-- TABLE: geo.estados
-- Description: Brazilian states with their geometries and metadata
-- Columns:
--   - id: Serial primary key
--   - nome: State name (e.g., 'São Paulo')
--   - sigla: State abbreviation (e.g., 'SP')
--   - regiao: Region (Sul, Sudeste, Norte, Nordeste, Centro-Oeste)
--   - populacao: Population count
--   - area_km2: Area in square kilometers
--   - geom: MultiPolygon geometry in SRID 4326 (WGS84)
--   - created_at: Timestamp of record creation

-- TABLE: geo.rodovias
-- Description: Highways and roads with their routes
-- Columns:
--   - id: Serial primary key
--   - codigo: Highway code (e.g., 'BR-101', 'SP-348')
--   - nome: Highway name
--   - tipo: Type (Federal, Estadual, Municipal)
--   - extensao_km: Length in kilometers
--   - estado_sigla: Foreign key to estados.sigla
--   - condicao: Road condition (Boa, Regular, Ruim)
--   - geom: MultiLineString geometry in SRID 4326 (WGS84)
--   - created_at: Timestamp of record creation

-- TABLE: geo.cidades
-- Description: Cities and their locations
-- Columns:
--   - id: Serial primary key
--   - nome: City name
--   - estado_sigla: Foreign key to estados.sigla
--   - populacao: Population count
--   - geom: Point geometry in SRID 4326 (WGS84)
--   - created_at: Timestamp of record creation

-- MATERIALIZED VIEW: geo.stats_rodovias_por_estado
-- Description: Pre-computed statistics of highways by state
-- Columns:
--   - sigla: State abbreviation
--   - estado_nome: State name
--   - total_rodovias: Total number of highways
--   - extensao_total_km: Total length in kilometers
--   - rodovias_federais: Count of federal highways
--   - rodovias_estaduais: Count of state highways
--   - rodovias_boas: Count of highways in good condition
--   - rodovias_regulares: Count of highways in regular condition
--   - rodovias_ruins: Count of highways in poor condition

-- SPATIAL REFERENCE SYSTEM
-- All geometries use SRID 4326 (WGS84 - lat/lon coordinates)
-- Latitude range: -90 to 90
-- Longitude range: -180 to 180

-- SPATIAL INDEXES
-- All geometry columns have GIST indexes for fast spatial queries

-- COMMON POSTGIS FUNCTIONS AVAILABLE:
-- ST_Distance(geom1, geom2) - Calculate distance between geometries
-- ST_Intersects(geom1, geom2) - Check if geometries intersect
-- ST_Within(geom1, geom2) - Check if geom1 is within geom2
-- ST_DWithin(geom1, geom2, distance) - Check if geometries are within distance
-- ST_Buffer(geom, distance) - Create buffer around geometry
-- ST_Area(geom) - Calculate area of polygon
-- ST_Length(geom) - Calculate length of linestring
-- ST_AsText(geom) - Convert geometry to WKT text
-- ST_AsGeoJSON(geom) - Convert geometry to GeoJSON
-- ST_Transform(geom, srid) - Transform geometry to different SRID

-- RELATIONSHIPS:
-- estados (1) -> (N) rodovias (via estado_sigla)
-- estados (1) -> (N) cidades (via estado_sigla)
