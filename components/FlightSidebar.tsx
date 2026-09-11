"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane, Clock, MapPin, Gauge, Radio, Building2, Luggage } from "lucide-react"

export default function FlightSidebar({ flight }: { flight: any }) {
  const now = Math.floor(Date.now() / 1000)
  const total = flight.arr_time_ts - flight.dep_time_ts
  const elapsed = now - flight.dep_time_ts
  let progress = total > 0 ? (elapsed / total) * 100 : 0
  progress = Math.max(0, Math.min(100, progress))

  // format timestamps safely
  const formatTime = (ts: number) => {
    if (!ts) return "--:--"
    return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur w-full rounded-2xl md:mt-4">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-3xl font-black text-slate-800">{flight.flight_iata}</CardTitle>
            <p className="text-sm font-semibold text-slate-500 mt-1">{flight.airline_name || "Unknown Airline"}</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
            {flight.status || "active"}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* visual route progress */}
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute left-6 right-6 top-1/2 h-1 bg-slate-200 -z-10 rounded-full" />
          <div 
            className="absolute left-6 top-1/2 h-1 bg-blue-500 -z-10 transition-all duration-1000 rounded-full" 
            style={{ width: `calc(${progress}% - 24px)` }}
          />
          <div className="bg-white/95 px-2 text-center rounded-xl">
            <p className="text-4xl font-black text-slate-800">{flight.dep_iata || "N/A"}</p>
            <p className="text-sm font-bold text-slate-500 mt-1">{formatTime(flight.dep_time_ts)}</p>
          </div>
          <Plane className="w-6 h-6 text-blue-500 fill-blue-500" />
          <div className="bg-white/95 px-2 text-center rounded-xl">
            <p className="text-4xl font-black text-slate-800">{flight.arr_iata || "N/A"}</p>
            <p className="text-sm font-bold text-slate-500 mt-1">{formatTime(flight.arr_time_ts)}</p>
          </div>
        </div>

        {/* airport details (gates/terminals) */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">departure</span>
            <div className="flex items-center gap-2 text-sm"><Building2 className="w-4 h-4 text-slate-400"/> Term {flight.dep_terminal || "-"}</div>
            <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-slate-400"/> Gate {flight.dep_gate || "-"}</div>
          </div>
          <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">arrival</span>
            <div className="flex items-center gap-2 text-sm"><Building2 className="w-4 h-4 text-slate-400"/> Term {flight.arr_terminal || "-"}</div>
            <div className="flex items-center gap-2 text-sm"><Luggage className="w-4 h-4 text-slate-400"/> Belt {flight.arr_baggage || "-"}</div>
          </div>
        </div>

        {/* live telemetry stats */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 flex items-center gap-1"><Plane className="w-3 h-3"/> aircraft</span>
            <span className="font-semibold text-sm truncate">{flight.model || flight.aircraft_icao || "unknown"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> altitude</span>
            <span className="font-semibold text-sm">{flight.alt ? `${(flight.alt * 3.28084).toFixed(0)} ft` : "ground"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 flex items-center gap-1"><Gauge className="w-3 h-3"/> speed</span>
            <span className="font-semibold text-sm">{flight.speed ? `${flight.speed} km/h` : "0 km/h"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 flex items-center gap-1"><Radio className="w-3 h-3"/> squawk</span>
            <span className="font-semibold text-sm">{flight.squawk || "none"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}