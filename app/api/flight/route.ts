import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const flight = searchParams.get('flight')

  if (!flight) return NextResponse.json({ error: 'flight number required' }, { status: 400 })
  
  try {
    // 1. fetch the live flight
    const flightRes = await fetch(`https://airlabs.co/api/v9/flight?flight_iata=${flight}&api_key=${process.env.AIRLABS_API_KEY}`)
    const flightData = await flightRes.json()
    
    if (flightData.error) return NextResponse.json({ error: flightData.error.message }, { status: 400 })
    if (!flightData.response) return NextResponse.json({ error: 'flight not found' }, { status: 404 })
      
    const f = flightData.response

    // 2. fetch the airport coordinates to fix the map line
    const fetchAirport = async (iata: string) => {
      if (!iata) return null
      try {
        const res = await fetch(`https://airlabs.co/api/v9/airports?iata_code=${iata}&api_key=${process.env.AIRLABS_API_KEY}`)
        const data = await res.json()
        return data.response?.[0] || null
      } catch {
        return null
      }
    }

    // fetch both airports simultaneously for speed
    const [depData, arrData] = await Promise.all([
      fetchAirport(f.dep_iata),
      fetchAirport(f.arr_iata)
    ])

    // attach the coordinates to our flight payload
    if (depData) {
      f.dep_lat = depData.lat
      f.dep_lng = depData.lng
    }
    if (arrData) {
      f.arr_lat = arrData.lat
      f.arr_lng = arrData.lng
    }

    return NextResponse.json(f)
  } catch (error) {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}