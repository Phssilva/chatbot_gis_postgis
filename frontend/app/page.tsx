"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ChatPanel } from "@/components/ChatPanel";
import { MapLegend } from "@/components/MapLegend";
import { Database, Map as MapIcon } from "lucide-react";

// Dynamic import to avoid SSR issues with OpenLayers
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <MapIcon className="w-12 h-12 mx-auto mb-2 text-gray-400 animate-pulse" />
        <p className="text-gray-600">Carregando mapa...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [highlightedFeatures, setHighlightedFeatures] = useState<any[]>([]);
  const [activeLayer, setActiveLayer] = useState<string>("estados");

  const handleQueryResult = (data: any) => {
    // Process query results and highlight on map
    if (data && data.features) {
      setHighlightedFeatures(data.features);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Chatbot Geoespacial
                </h1>
                <p className="text-sm text-gray-600">
                  Consulte dados espaciais em linguagem natural
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>PostGIS Conectado</span>
              </div>
              <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>GeoServer Ativo</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 relative">
          <MapView
            highlightedFeatures={highlightedFeatures}
            activeLayer={activeLayer}
          />
          <MapLegend
            activeLayer={activeLayer}
            onLayerChange={setActiveLayer}
          />
        </div>

        {/* Chat Panel */}
        <div className="w-[450px] border-l border-gray-200 bg-white flex flex-col">
          <ChatPanel onQueryResult={handleQueryResult} />
        </div>
      </div>
    </div>
  );
}
