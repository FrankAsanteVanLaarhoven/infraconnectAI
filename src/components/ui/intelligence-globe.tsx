"use client";

import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export function IntelligenceGlobe() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainer.current) return;
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9', // High-fidelity satellite
      projection: { name: 'globe' },
      zoom: 1.6,
      center: [20, 20],
      pitch: 45,
      attributionControl: false,
      interactive: true
    });

    map.current.on('style.load', () => {
      if (!map.current) return;

      // 1. OBSIDIAN strategic Atmosphere
      map.current.setFog({
        color: 'rgb(5, 5, 20)',
        'high-color': 'rgb(10, 40, 80)',
        'horizon-blend': 0.05,
        'space-color': 'rgb(2, 2, 5)',
        'star-intensity': 0.8
      });

      // 2. Mesh Sources
      map.current.addSource('nodes', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current.addSource('earthquakes', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current.addSource('radar-sweep', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current.addSource('sar-targets', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

      // 3. LAYERS: UNIT RETICLES
      map.current.addLayer({
        id: 'node-halo',
        type: 'circle',
        source: 'nodes',
        paint: {
          'circle-radius': 12,
          'circle-color': '#06b6d4',
          'circle-opacity': 0.2,
          'circle-blur': 1
        }
      });

      map.current.addLayer({
        id: 'node-point',
        type: 'circle',
        source: 'nodes',
        paint: {
          'circle-radius': 3,
          'circle-color': '#fff',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#06b6d4'
        }
      });

      // 4. LAYERS: SEISMIC INTELLIGENCE (Amber)
      map.current.addLayer({
        id: 'seismic-ping',
        type: 'circle',
        source: 'earthquakes',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'mag'], 2, 4, 8, 20],
          'circle-color': '#f59e0b',
          'circle-opacity': 0.6,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(245, 158, 11, 0.3)',
          'circle-blur': 0.5
        }
      });

      // 5. SAR RADAR SWEEP LAYER
      map.current.addLayer({
        id: 'radar-beam',
        type: 'line',
        source: 'radar-sweep',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#06b6d4',
          'line-width': 2,
          'line-opacity': 0.8,
          'line-blur': 1
        }
      });

      // 6. SAR TARGET IDENTIFICATION
      map.current.addLayer({
        id: 'sar-id-box',
        type: 'circle',
        source: 'sar-targets',
        paint: {
          'circle-radius': 15,
          'circle-color': 'transparent',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#06b6d4',
          'circle-opacity': 0.8
        }
      });

      // --- ORCHESTRATION ENGINES ---

      let radarAngle = 0;
      let lastNodes: any[] = [];

      const updateRadar = () => {
        if (!map.current) return;
        
        radarAngle = (radarAngle + 2) % 360;
        const rad = (radarAngle * Math.PI) / 180;
        
        // Radar beam geometry (Long line from center)
        const center = map.current.getCenter();
        const beamLine = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [center.lng, center.lat],
              [center.lng + Math.cos(rad) * 40, center.lat + Math.sin(rad) * 40]
            ]
          }
        };

        const rSource = map.current.getSource('radar-sweep') as mapboxgl.GeoJSONSource;
        if (rSource) rSource.setData({ type: 'FeatureCollection', features: [beamLine as any] });

        // SAR Target Logic: If nodes are within X degrees of radar angle, identify them
        if (lastNodes.length > 0) {
           const activeTargets = lastNodes.filter(n => {
              const dx = n.longitude - center.lng;
              const dy = n.latitude - center.lat;
              const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
              const diff = Math.abs(angle - radarAngle);
              return diff < 5 || diff > 355;
           }).map(n => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [n.longitude, n.latitude] },
              properties: { id: n.id }
           }));

           const tSource = map.current.getSource('sar-targets') as mapboxgl.GeoJSONSource;
           if (tSource) tSource.setData({ type: 'FeatureCollection', features: activeTargets as any });
        }

        requestAnimationFrame(updateRadar);
      };

      const fetchTelemetry = async () => {
        try {
          const res = await fetch('/api/telemetry');
          const payload = await res.json();
          if (payload.success) {
            const { nodes, worldIntel } = payload.data;
            lastNodes = nodes;

            // Update Nodes
            const nodeFeatures = nodes.map((n: any) => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [n.longitude, n.latitude] },
              properties: { id: n.id }
            }));
            (map.current?.getSource('nodes') as mapboxgl.GeoJSONSource)?.setData({ type: 'FeatureCollection', features: nodeFeatures });

            // Update Earthquakes
            const eqFeatures = (worldIntel?.earthquakes || []).map((e: any) => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [e.longitude, e.latitude] },
              properties: { mag: e.mag }
            }));
            (map.current?.getSource('earthquakes') as mapboxgl.GeoJSONSource)?.setData({ type: 'FeatureCollection', features: eqFeatures });
          }
        } catch (e) {}
      };

      // Start Engines
      fetchTelemetry();
      const teleInterval = setInterval(fetchTelemetry, 5000);
      updateRadar();

      // Rotation Engine
      let isSpinning = true;
      const spinInterval = setInterval(() => {
        if (!map.current || !isSpinning) return;
        const c = map.current.getCenter();
        c.lng += 0.15;
        map.current.easeTo({ center: c, duration: 1000, easing: n => n });
      }, 1000);

      map.current.on('dragstart', () => isSpinning = false);
      map.current.on('dragend', () => isSpinning = true);

      return () => {
        clearInterval(teleInterval);
        clearInterval(spinInterval);
      };
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 p-8 text-center border border-red-900/50 rounded-full scale-90">
        <h3 className="text-red-500 font-bold mb-2 tracking-widest text-xs uppercase">Uplink Critical Fallback</h3>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Mapbox_Clearance_Missing</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing bg-black/40">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* SAR persistent scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] opacity-20" />
      
      {/* SAR Metadata Indicators */}
      <div className="absolute top-6 left-6 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
           <span className="text-[9px] font-black text-white tracking-widest uppercase">SAR // Active_Sensing</span>
        </div>
        <span className="text-[7px] font-mono text-cyan-500/60 uppercase">Frequency: 9.6GHz // Ku-Band</span>
      </div>
    </div>
  );
}
