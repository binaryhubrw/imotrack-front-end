// lib/vehicle-location-utils.ts

// Backend API types matching your schema
interface Coords {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

interface LocationUpdate {
  vehicle_id: string;
  coords: Coords;
  timestamp: string | number;
}

// UI display types
interface TrackingData {
  id: string
  name: string
  lat: number
  lng: number
  speed: number
  heading: number
  status: "active" | "inactive" | "maintenance"
  fuel: number
  driver: string
  lastUpdate: string
}

/**
 * Convert browser geolocation position to backend coords format
 */
export const convertGeolocationToCoords = (position: GeolocationPosition): Coords => {
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

/**
 * Convert backend location update to display tracking data
 */
export const convertLocationToTrackingData = (
  vehicleId: string, 
  location: LocationUpdate,
  vehicleName?: string,
  driverName?: string
): TrackingData => {
  return {
    id: vehicleId,
    name: vehicleName || `Vehicle ${vehicleId.slice(0, 8)}`,
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    speed: location.coords.speed || 0,
    heading: location.coords.heading || 0,
    status: "active" as const,
    fuel: 100, // Default value
    driver: driverName || "Unknown Driver",
    lastUpdate: typeof location.timestamp === 'number' 
      ? new Date(location.timestamp).toISOString()
      : location.timestamp.toString()
  }
}

/**
 * Get optimized geolocation options
 */
export const getGeolocationOptions = (highAccuracy: boolean = true): PositionOptions => {
  return {
    enableHighAccuracy: highAccuracy,
    timeout: 15000, // 15 seconds timeout
    maximumAge: 30000 // 30 second cache for efficiency
  }
}

/**
 * Get user-friendly error messages for geolocation errors
 */
export const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access denied. Please enable location permissions in your browser settings."
    case error.POSITION_UNAVAILABLE:
      return "Location information unavailable. Please check your GPS/network connection."
    case error.TIMEOUT:
      return "Location request timed out. Please try again."
    default:
      return `Geolocation error: ${error.message}`
  }
}

/**
 * Validate GPS coordinates
 */
export const isValidGPSCoordinate = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) && !isNaN(lng)
  )
}

/**
 * Check if location update is significant enough to send
 * Helps reduce unnecessary API calls and server load
 */
export const isSignificantLocationUpdate = (
  lastLocation: { lat: number; lng: number; timestamp: string } | null,
  newLocation: { lat: number; lng: number; timestamp: string },
  minDistanceMeters: number = 5,
  minTimeMs: number = 10000 // 10 seconds minimum interval
): boolean => {
  // Always allow first update
  if (!lastLocation) return true

  const timeDiff = new Date(newLocation.timestamp).getTime() - new Date(lastLocation.timestamp).getTime()
  
  // Enforce minimum time interval
  if (timeDiff < minTimeMs) return false

  // Calculate distance using Haversine formula
  const distance = calculateDistance(
    lastLocation.lat, lastLocation.lng,
    newLocation.lat, newLocation.lng
  )

  return distance >= minDistanceMeters
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
export const calculateDistance = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

/**
 * Format speed for display
 */
export const formatSpeed = (speedMs: number | null): string => {
  if (!speedMs || speedMs < 0) return '0 km/h'
  const speedKmh = speedMs * 3.6
  return `${Math.round(speedKmh)} km/h`
}

/**
 * Format heading/bearing for display
 */
export const formatHeading = (heading: number | null): string => {
  if (!heading && heading !== 0) return 'N/A'
  
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round((heading % 360) / 45) % 8
  return `${Math.round(heading)}° ${directions[index]}`
}

/**
 * Format distance for display
 */
export const formatDistance = (distanceMeters: number): string => {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`
  } else {
    return `${(distanceMeters / 1000).toFixed(1)} km`
  }
}

/**
 * Get accuracy level description
 */
export const getAccuracyLevel = (accuracyMeters: number): {
  level: 'excellent' | 'good' | 'fair' | 'poor'
  description: string
  color: string
} => {
  if (accuracyMeters <= 5) {
    return {
      level: 'excellent',
      description: 'Excellent GPS signal',
      color: 'text-green-600'
    }
  } else if (accuracyMeters <= 10) {
    return {
      level: 'good',
      description: 'Good GPS signal',
      color: 'text-green-500'
    }
  } else if (accuracyMeters <= 20) {
    return {
      level: 'fair',
      description: 'Fair GPS signal',
      color: 'text-yellow-600'
    }
  } else {
    return {
      level: 'poor',
      description: 'Poor GPS signal',
      color: 'text-red-600'
    }
  }
}

/**
 * Validate vehicle UUID format
 */
export const isValidVehicleId = (vehicleId: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(vehicleId)
}

/**
 * Get vehicle status color for UI
 */
export const getVehicleStatusColor = (status: string, isStreaming: boolean = false): string => {
  if (!isStreaming) return '#6b7280' // Gray for offline

  switch (status.toLowerCase()) {
    case 'active':
      return '#059669' // Green
    case 'inactive':
      return '#6b7280' // Gray
    case 'maintenance':
      return '#ea580c' // Orange
    default:
      return '#6b7280' // Gray
  }
}

/**
 * Create location update payload for API
 */
export const createLocationPayload = (
  vehicleId: string,
  coords: Coords,
  timestamp?: number
): {
  vehicle_id: string
  coords: Coords
  timestamp: number
} => {
  return {
    vehicle_id: vehicleId,
    coords,
    timestamp: timestamp || Date.now()
  }
}

/**
 * Parse SSE event data safely
 */
export const parseSSELocationData = (eventData: string): LocationUpdate | null => {
  try {
    const data = JSON.parse(eventData)
    
    // Validate required fields
    if (!data.vehicle_id || !data.coords || !data.coords.latitude || !data.coords.longitude) {
      console.warn('Invalid SSE location data:', data)
      return null
    }

    return data as LocationUpdate
  } catch (error) {
    console.error('Failed to parse SSE location data:', error)
    return null
  }
}

/**
 * Get map center point from multiple vehicles
 */
export const getMapCenter = (vehicles: TrackingData[]): { lat: number; lng: number } => {
  if (vehicles.length === 0) {
    return { lat: 40.7128, lng: -74.006 } // Default to NYC
  }

  if (vehicles.length === 1) {
    return { lat: vehicles[0].lat, lng: vehicles[0].lng }
  }

  // Calculate centroid of all vehicles
  const totalLat = vehicles.reduce((sum, vehicle) => sum + vehicle.lat, 0)
  const totalLng = vehicles.reduce((sum, vehicle) => sum + vehicle.lng, 0)

  return {
    lat: totalLat / vehicles.length,
    lng: totalLng / vehicles.length
  }
}

/**
 * Debounce function for API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), waitMs)
  }
}