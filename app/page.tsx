"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import FlightSidebar from "@/components/FlightSidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plane, Search, Loader2, Plus, PlaneTakeoff, Trash2 } from "lucide-react"

const Map = dynamic(() => import("@/components/Map"), { ssr: false })

const STORAGE_KEY = "tracked_flight_numbers"

export default function Dashboard() {
  const [flightInput, setFlightInput] = useState("")
  const [flights, setFlights] = useState<any[]>([])
  const [activeFlightId, setActiveFlightId] = useState<string | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState("")

  // Load flights from localStorage on initial render
  useEffect(() => {
    const loadSavedFlights = async () => {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const iatas: string[] = JSON.parse(saved)
          if (iatas.length > 0) {
            // Fetch current live data for all saved flight numbers
            const fetched = await Promise.all(
              iatas.map(async (iata) => {
                const res = await fetch(`/api/flight?flight=${iata}`)
                if (!res.ok) return null
                return await res.json()
              })
            )
            const validFlights = fetched.filter(Boolean)
            setFlights(validFlights)
            if (validFlights.length > 0) {
              setActiveFlightId(validFlights[0].flight_iata)
            }
          }
        } catch (e) {
          console.error("Failed to recover flights from localStorage", e)
        }
      }
      setInitialLoading(false)
    }

    loadSavedFlights()
  }, [])

  // Sync to localStorage whenever flight list changes
  const saveToStorage = (updatedFlights: any[]) => {
    const iatas = updatedFlights.map(f => f.flight_iata)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(iatas))
  }

  const handleAddFlight = async (e: React.FormEvent) => {
    e.preventDefault()
    const iata = flightInput.trim().toUpperCase()
    if (!iata) return

    if (flights.find(f => f.flight_iata === iata)) {
      setActiveFlightId(iata)
      setFlightInput("")
      return
    }

    setLoading(true)
    setError("")
    
    try {
      const res = await fetch(`/api/flight?flight=${iata}`)
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch flight")
      
      const newFlights = [...flights, data]
      setFlights(newFlights)
      setActiveFlightId(data.flight_iata)
      saveToStorage(newFlights)
      setFlightInput("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFlight = (iata: string, e: React.MouseEvent) => {
    e.stopPropagation() // Don't select flight while deleting
    const newFlights = flights.filter(f => f.flight_iata !== iata)
    setFlights(newFlights)
    saveToStorage(newFlights)

    if (activeFlightId === iata) {
      setActiveFlightId(newFlights.length > 0 ? newFlights[0].flight_iata : null)
    }
  }

  const activeFlight = flights.find(f => f.flight_iata === activeFlightId)

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-slate-500 font-medium text-sm">Recovering tracked flights...</p>
      </div>
    )
  }

  // Initial state if no flights exist
  if (flights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-slate-50 px-4 relative z-10">
        <Plane className="w-16 h-16 text-blue-500 mb-8" />
        <h1 className="text-3xl font-bold mb-6 text-slate-800">track a flight</h1>
        <form onSubmit={handleAddFlight} className="w-full max-w-md flex flex-col gap-2">
          <div className="flex gap-2">
            <Input 
              placeholder="enter flight number (e.g. UA123)..." 
              className="h-12 text-lg rounded-full px-6 shadow-sm bg-white"
              value={flightInput}
              onChange={(e) => setFlightInput(e.target.value)}
            />
            <Button type="submit" disabled={loading} className="h-12 rounded-full px-6 shadow-sm">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm text-center font-medium mt-2">{error}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-100 flex">
      
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        {activeFlight && (
          <Map 
            flights={flights} 
            activeFlight={activeFlight} 
            onSelectFlight={(iata) => setActiveFlightId(iata)} 
          />
        )}
      </div>

      {/* Left Sidebar: Search & Flight Cards List */}
      <div className="absolute left-4 top-4 bottom-4 z-10 w-80 flex flex-col gap-4 pointer-events-none">
        
        <form onSubmit={handleAddFlight} className="pointer-events-auto flex gap-2 bg-white/90 backdrop-blur p-2 rounded-2xl shadow-lg">
          <Input 
            placeholder="add flight..." 
            className="h-10 border-none bg-transparent focus-visible:ring-0"
            value={flightInput}
            onChange={(e) => setFlightInput(e.target.value)}
          />
          <Button type="submit" disabled={loading} size="icon" className="rounded-xl shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </form>

        {error && <div className="pointer-events-auto bg-white/90 text-red-500 text-sm px-4 py-2 rounded-xl shadow-lg font-medium">{error}</div>}

        <div className="pointer-events-auto flex flex-col gap-2 overflow-y-auto pb-4">
          {flights.map((flight) => {
            const isActive = activeFlightId === flight.flight_iata

            return (
              <div 
                key={flight.flight_iata}
                onClick={() => setActiveFlightId(flight.flight_iata)}
                className={`p-4 rounded-2xl cursor-pointer transition-all shadow-lg flex items-center justify-between backdrop-blur group ${
                  isActive 
                    ? "bg-blue-500 text-white" 
                    : "bg-white/90 hover:bg-white text-slate-800"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-black text-lg">{flight.flight_iata}</span>
                  <span className={`text-xs font-semibold ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                    {flight.dep_iata || "N/A"} <PlaneTakeoff className="inline w-3 h-3 mx-1" /> {flight.arr_iata || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
                    isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                  }`}>
                    {flight.status || "active"}
                  </span>

                  {/* Delete Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => handleRemoveFlight(flight.flight_iata, e)}
                    className={`h-8 w-8 rounded-lg opacity-80 hover:opacity-100 ${
                      isActive 
                        ? "hover:bg-blue-600 text-white" 
                        : "hover:bg-slate-100 text-slate-400 hover:text-red-500"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Sidebar: Active Flight Details */}
      <div className="absolute right-4 top-4 bottom-4 z-10 w-full md:w-[400px] pointer-events-none flex flex-col">
        <div className="pointer-events-auto h-auto max-h-full overflow-y-auto rounded-2xl">
          {activeFlight && <FlightSidebar flight={activeFlight} />}
        </div>
      </div>

    </div>
  )
}