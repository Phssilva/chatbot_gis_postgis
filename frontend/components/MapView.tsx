"use client";

import { useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import ImageLayer from "ol/layer/Image";
import { OSM } from "ol/source";
import ImageWMS from "ol/source/ImageWMS";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";

interface MapViewProps {
  highlightedFeatures: any[];
  activeLayer: string;
}

export default function MapView({
  highlightedFeatures,
  activeLayer,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const geoserverUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL || "http://localhost:8080/geoserver";

    // Base layer (OpenStreetMap)
    const baseLayer = new TileLayer({
      source: new OSM(),
    });

    // GeoServer WMS layers
    const estadosLayer = new ImageLayer({
      source: new ImageWMS({
        url: `${geoserverUrl}/wms`,
        params: {
          LAYERS: "geo:estados",
          TILED: true,
        },
        serverType: "geoserver",
      }),
      visible: activeLayer === "estados",
    });

    const rodoviasLayer = new ImageLayer({
      source: new ImageWMS({
        url: `${geoserverUrl}/wms`,
        params: {
          LAYERS: "geo:rodovias",
          TILED: true,
        },
        serverType: "geoserver",
      }),
      visible: activeLayer === "rodovias",
    });

    const cidadesLayer = new ImageLayer({
      source: new ImageWMS({
        url: `${geoserverUrl}/wms`,
        params: {
          LAYERS: "geo:cidades",
          TILED: true,
        },
        serverType: "geoserver",
      }),
      visible: activeLayer === "cidades",
    });

    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, estadosLayer, rodoviasLayer, cidadesLayer],
      view: new View({
        center: fromLonLat([-47.8825, -15.7942]), // Center of Brazil
        zoom: 4,
      }),
      controls: defaultControls({
        attribution: true,
        zoom: true,
      }),
    });

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Update layer visibility when activeLayer changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const layers = mapInstanceRef.current.getLayers().getArray();
    layers.forEach((layer) => {
      if (layer instanceof ImageLayer) {
        const source = layer.getSource();
        if (source instanceof ImageWMS) {
          const params = source.getParams();
          const layerName = params.LAYERS;
          layer.setVisible(layerName === `geo:${activeLayer}`);
        }
      }
    });
  }, [activeLayer]);

  // Handle highlighted features
  useEffect(() => {
    if (!mapInstanceRef.current || !highlightedFeatures.length) return;

    // TODO: Add vector layer for highlighting specific features
    // This would require parsing the query results and creating vector features
    console.log("Highlighting features:", highlightedFeatures);
  }, [highlightedFeatures]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{ background: "#f0f0f0" }}
    />
  );
}
