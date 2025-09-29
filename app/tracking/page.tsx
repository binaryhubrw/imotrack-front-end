"use client"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Play, Square, Shield, Zap, AlertCircle, CheckCircle } from "lucide-react"
import { useUpdateVehicleLocation } from "@/lib/queries"
import { useRouter } from "next/navigation"

interface Coords {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export default function VehicleTracking() {
  const [vehicleId, setVehicleId] = useState("")
  const [tracking, setTracking] = useState(false)
  const [lastStatus, setLastStatus] = useState<string>("")
  const [locationCount, setLocationCount] = useState(0)
  const [lastLocation, setLastLocation] = useState<{coords: Coords; timestamp: string} | null>(null)
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(0)
  const watchIdRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef<number>(0)
  
  const updateLocationMutation = useUpdateVehicleLocation()

  useEffect(() => {
    // Load cached settings
    const savedVehicleId = localStorage.getItem("tracker_vehicleId")
    if (savedVehicleId) setVehicleId(savedVehicleId)
  }, [])

  const convertGeolocationToCoords = (position: GeolocationPosition): Coords => {
    const { coords } = position
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      altitude: coords.altitude,
      accuracy: coords.accuracy,
      altitudeAccuracy: coords.altitudeAccuracy,
      heading: coords.heading,
      speed: coords.speed
    }
  }

  const isSignificantLocationUpdate = (
    lastCoords: Coords | null,
    newCoords: Coords,
    minDistanceMeters: number = 5,
    minTimeMs: number = 5000
  ): boolean => {
    const now = Date.now()
    
    // Always allow first update
    if (!lastCoords || lastUpdateTimeRef.current === 0) {
      return true
    }

    // Time-based throttling
    if (now - lastUpdateTimeRef.current < minTimeMs) {
      return false
    }

    // Distance-based filtering using Haversine formula
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lastCoords.latitude * Math.PI/180
    const φ2 = newCoords.latitude * Math.PI/180
    const Δφ = (newCoords.latitude - lastCoords.latitude) * Math.PI/180
    const Δλ = (newCoords.longitude - lastCoords.longitude) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c

    return distance >= minDistanceMeters
  }

  const sendLocationUpdate = async (position: GeolocationPosition) => {
    const coords = convertGeolocationToCoords(position)
    
    // Validate GPS coordinates
    if (Math.abs(coords.latitude) > 90 || Math.abs(coords.longitude) > 180) {
      setLastStatus("Invalid GPS coordinates received")
      return
    }

    // Check if this is a significant location update
    if (!isSignificantLocationUpdate(lastLocation?.coords || null, coords)) {
      return // Skip insignificant updates
    }

    try {
      setLastStatus("Sending location update...")
      
      await updateLocationMutation.mutateAsync({
        vehicleId,
        coords,
        timestamp: position.timestamp || Date.now()
      })
      
      const currentLocation = {
        coords,
        timestamp: new Date().toISOString()
      }
      
      setLastLocation(currentLocation)
      setLocationCount(prev => prev + 1)
      setGpsAccuracy(coords.accuracy)
      setLastStatus(`Location ${locationCount + 1} sent successfully at ${new Date().toLocaleTimeString()}`)
      lastUpdateTimeRef.current = Date.now()
      
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send location'
      setLastStatus(`Error: ${errorMessage}`)
      console.error('Location update error:', error)
    }
  }

  const getGeolocationOptions = (highAccuracy: boolean = true): PositionOptions => {
    return {
      enableHighAccuracy: highAccuracy,
      timeout: 10000, // 10 seconds
      maximumAge: 60000 // 1 minute cache
    }
  }

  const router = useRouter()

  const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location access denied by user. Please enable location permissions."
      case error.POSITION_UNAVAILABLE:
        return "Location information unavailable. Check GPS/network connection."
      case error.TIMEOUT:
        return "Location request timed out. Retrying..."
      default:
        return `GPS error: ${error.message}`
    }
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      setLastStatus("Geolocation not supported by this browser")
      return
    }

    if (!vehicleId.trim()) {
      setLastStatus("Please enter a vehicle ID")
      return
    }

    // Validate vehicle ID format (assuming UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(vehicleId)) {
      setLastStatus("Please enter a valid vehicle UUID")
      return
    }

    // Save settings
    localStorage.setItem("tracker_vehicleId", vehicleId)

    const options = getGeolocationOptions(true)

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        sendLocationUpdate(position)
      },
      (error) => {
        const errorMessage = getGeolocationErrorMessage(error)
        setLastStatus(errorMessage)
        
        // Auto-retry on timeout
        if (error.code === error.TIMEOUT) {
          setTimeout(() => {
            setLastStatus("Retrying GPS connection...")
          }, 3000)
        }
      },
      options
    )

    watchIdRef.current = watchId
    setTracking(true)
    setLocationCount(0)
    setLastLocation(null)
    setGpsAccuracy(0)
    lastUpdateTimeRef.current = 0
    setLastStatus("Starting GPS tracking... Waiting for first location fix.")
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setTracking(false)
    setLastStatus(`Tracking stopped. Sent ${locationCount} location updates total.`)
  }

  // Auto-stop tracking when component unmounts
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  const getStatusIcon = () => {
    if (updateLocationMutation.isPending) {
      return <Zap className="w-4 h-4 animate-pulse text-blue-500" />
    }
    if (lastStatus.toLowerCase().includes('error') || lastStatus.toLowerCase().includes('denied')) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    if (lastStatus.toLowerCase().includes('success') && tracking) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    if (tracking) {
      return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
    }
    return null
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 5) return "text-green-600"
    if (accuracy <= 10) return "text-yellow-600"
    return "text-red-600"
  }

  const getAccuracyLabel = (accuracy: number) => {
    if (accuracy <= 5) return "Excellent"
    if (accuracy <= 10) return "Good"
    if (accuracy <= 20) return "Fair"
    return "Poor"
  }

  return (
    <div className="min-h-screen p-6 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md p-6 space-y-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
            <MapPin className="w-6 h-6 text-blue-600" /> 
            Vehicle Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Live GPS tracking for fleet management
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleId" className="font-medium">
              Vehicle UUID *
            </Label>
            <Input 
              id="vehicleId" 
              value={vehicleId} 
              onChange={(e) => setVehicleId(e.target.value)}
              placeholder="e.g., 3fa85f64-5717-4562-b3fc-2c963f66afa6"
              disabled={tracking}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter the UUID of the vehicle you want to track
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {!tracking ? (
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700" 
              onClick={startTracking}
              disabled={!vehicleId.trim() || updateLocationMutation.isPending}
            >
              <Play className="w-4 h-4 mr-2" /> 
              Start Tracking
            </Button>
          ) : (
            <Button 
              className="flex-1" 
              variant="outline" 
              onClick={stopTracking}
            >
              <Square className="w-4 h-4 mr-2" /> 
              Stop Tracking
            </Button>
          )}
        </div>

        {/* Status Display */}
        {lastStatus && (
          <Card className="p-3 bg-muted/30">
            <div className="flex items-start gap-2 text-sm">
              <div className="mt-0.5 flex-shrink-0">
                {getStatusIcon()}
              </div>
              <span className={
                lastStatus.toLowerCase().includes('error') || lastStatus.toLowerCase().includes('denied')
                  ? 'text-red-600 font-medium' 
                  : lastStatus.toLowerCase().includes('success')
                  ? 'text-green-600 font-medium'
                  : 'text-foreground'
              }>
                {lastStatus}
              </span>
            </div>
          </Card>
        )}

        {/* Tracking Stats */}
        {tracking && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-700">{locationCount}</div>
              <div className="text-xs text-green-600">Updates Sent</div>
            </div>
            <div className="p-3 cursor-pointer bg-green-50 rounded-lg">
                 <button
                 className="text-lg text-orange-600"
                  onClick={() =>
                    router.push(`/dashboard/shared_pages/vehicles/${vehicleId}/locations`)
                  }>
                    Locate it
                  </button>
                  
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-700">
                {updateLocationMutation.isPending ? '...' : tracking ? 'Active' : 'Inactive'}
              </div>
              <div className="text-xs text-blue-600">Status</div>
            </div>
          </div>
        )}

        {/* GPS Accuracy Display */}
        {tracking && gpsAccuracy > 0 && (
          <Card className="p-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">GPS Accuracy:</span>
              <div className="text-right">
                <div className={`text-sm font-bold ${getAccuracyColor(gpsAccuracy)}`}>
                  {gpsAccuracy.toFixed(1)}m
                </div>
                <div className={`text-xs ${getAccuracyColor(gpsAccuracy)}`}>
                  {getAccuracyLabel(gpsAccuracy)}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Current Location Info */}
        {lastLocation && tracking && (
          <Card className="p-3 bg-blue-50">
            <div className="text-xs space-y-1">
              <div className="font-medium text-blue-800 mb-2">Latest Location:</div>
              <div className="grid grid-cols-2 gap-2 text-blue-600">
                <div>Lat: {lastLocation.coords.latitude.toFixed(6)}</div>
                <div>Lng: {lastLocation.coords.longitude.toFixed(6)}</div>
                {lastLocation.coords.altitude && (
                  <div>Alt: {lastLocation.coords.altitude.toFixed(1)}m</div>
                )}
                {lastLocation.coords.speed && (
                  <div>Speed: {(lastLocation.coords.speed * 3.6).toFixed(1)} km/h</div>
                )}
              </div>
              <div className="text-blue-600 mt-2 pt-2 border-t border-blue-200">
                Updated: {new Date(lastLocation.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </Card>
        )}

        <div className="text-center pt-2 border-t">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Shield className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-600 font-medium">Secure Connection</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Keep this page open and your phone with you to continuously track the vehicle's location
          </p>
        </div>
      </Card>
    </div>
  )
}