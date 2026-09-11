"use client"

import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect, useState } from "react"

// Automatically zooms/pans map to fit active flight path
const MapBounds = ({ path }: { path: [number, number][] }) => {
  const map = useMap()
  useEffect(() => {
    if (path.length > 1) {
      map.fitBounds(path, { padding: [80, 80] })
    } else if (path.length === 1) {
      map.setView(path[0], 6)
    }
  }, [path, map])
  return null
}

// Helper to generate distinct plane icons for active vs inactive aircraft
const createPlaneIcon = (heading: number, isActive: boolean) => {
  const color = isActive ? "#2563eb" : "#64748b" // Blue for active, Slate for inactive
  const scale = isActive ? 1.1 : 0.85
  const zIndex = isActive ? 1000 : 500

  return L.divIcon({
    html: `<div style="transform: rotate(${heading || 0}deg) scale(${scale}); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.3)); cursor: pointer;">
             <svg viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
             </svg>
           </div>`,
    className: `bg-transparent border-none z-[${zIndex}]`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

interface MapProps {
  flights: any[]
  activeFlight: any
  onSelectFlight: (iata: string) => void
}

export default function Map({ flights, activeFlight, onSelectFlight }: MapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !activeFlight) return null

  const activePos: [number, number] = activeFlight.lat && activeFlight.lng 
    ? [activeFlight.lat, activeFlight.lng] 
    : [0, 0]

  // Flight path line ONLY for active flight
  const activeFlightPath: [number, number][] = []
  if (activeFlight.dep_lat && activeFlight.dep_lng) activeFlightPath.push([activeFlight.dep_lat, activeFlight.dep_lng])
  if (activeFlight.lat && activeFlight.lng) activeFlightPath.push(activePos)
  if (activeFlight.arr_lat && activeFlight.arr_lng) activeFlightPath.push([activeFlight.arr_lat, activeFlight.arr_lng])

  return (
    <div className="h-full w-full">
      <MapContainer center={activePos} zoom={4} className="h-full w-full bg-[#a3c9e2]" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url={`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAP_API_KEY}`}
        />
        
        <MapBounds path={activeFlightPath} />

        {/* Flight path line & airport pins ONLY for active flight */}
        {activeFlightPath.length > 1 && (
          <Polyline positions={activeFlightPath} color="#2563eb" weight={3} dashArray="8, 8" opacity={0.75} />
        )}
        {activeFlight.dep_lat && (
          <CircleMarker center={[activeFlight.dep_lat, activeFlight.dep_lng]} radius={4} pathOptions={{ color: '#0f172a', fillColor: 'white', fillOpacity: 1 }} />
        )}
        {activeFlight.arr_lat && (
          <CircleMarker center={[activeFlight.arr_lat, activeFlight.arr_lng]} radius={4} pathOptions={{ color: '#0f172a', fillColor: 'white', fillOpacity: 1 }} />
        )}

        {/* Render aircraft markers for ALL added flights */}
        {flights.map((f) => {
          if (!f.lat || !f.lng) return null
          const isActive = f.flight_iata === activeFlight.flight_iata
          const icon = createPlaneIcon(f.dir, isActive)

          return (
            <Marker 
              key={`plane-${f.flight_iata}`} 
              position={[f.lat, f.lng]} 
              icon={icon} 
              zIndexOffset={isActive ? 1000 : 100}
              eventHandlers={{
                click: () => onSelectFlight(f.flight_iata)
              }}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}