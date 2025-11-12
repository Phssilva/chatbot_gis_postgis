"use client";

import { Layers, MapPin, Route } from "lucide-react";

interface MapLegendProps {
  activeLayer: string;
  onLayerChange: (layer: string) => void;
}

export function MapLegend({ activeLayer, onLayerChange }: MapLegendProps) {
  const layers = [
    {
      id: "estados",
      name: "Estados",
      icon: Layers,
      color: "bg-blue-500",
      description: "Divisões estaduais",
    },
    {
      id: "rodovias",
      name: "Rodovias",
      icon: Route,
      color: "bg-red-500",
      description: "Malha rodoviária",
    },
    {
      id: "cidades",
      name: "Cidades",
      icon: MapPin,
      color: "bg-green-500",
      description: "Centros urbanos",
    },
  ];

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
        <Layers className="w-4 h-4 mr-2" />
        Camadas do Mapa
      </h3>
      <div className="space-y-2">
        {layers.map((layer) => {
          const Icon = layer.icon;
          const isActive = activeLayer === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 border-2 border-blue-500"
                  : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
              }`}
            >
              <div
                className={`${layer.color} p-2 rounded-lg ${
                  isActive ? "ring-2 ring-blue-300" : ""
                }`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900">
                  {layer.name}
                </div>
                <div className="text-xs text-gray-600">
                  {layer.description}
                </div>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          💡 Clique em uma camada para visualizar no mapa
        </p>
      </div>
    </div>
  );
}
