"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { DivIconOptions } from "leaflet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Navigation, Zap, RefreshCw, Activity, Settings, Clock } from "lucide-react"
import { useVehicleLocationStream } from "@/lib/queries"

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

export interface TrackingData {
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

interface VehicleMapProps {
  vehicleId?: string
  vehicleIds?: string[]
  vehicles?: TrackingData[]
  historicalPoints?: [number, number][]
  initialTrail?: [number, number][]
  showHistory?: boolean
  onHistoryToggle?: () => void
  isHistoryLoading?: boolean
}

export default function VehicleMap({ 
  vehicleId, 
  vehicleIds, 
  vehicles: initialVehicles = [], 
  historicalPoints = [],
  initialTrail = [],
  showHistory = false,
  onHistoryToggle,
  isHistoryLoading = false
}: VehicleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const vehicleTrailsRef = useRef<Map<string, [number, number][]>>(new Map())
  const trailLayersRef = useRef<Map<string, any>>(new Map())
  const [initError, setInitError] = useState<string | null>(null)
  const mountedRef = useRef(false)
  const initializingRef = useRef(false)

  const [selectedVehicle, setSelectedVehicle] = useState<TrackingData | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [vehicles, setVehicles] = useState<TrackingData[]>(initialVehicles)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [activeStreams, setActiveStreams] = useState<Set<string>>(new Set())
  const [mapSettings, setMapSettings] = useState({
    showTrails: true,
    showInactive: true,
    autoCenter: false,
    maxTrailPoints: 10000, // Very high limit to prevent "cutting"
    refreshInterval: 30000
  })

  const convertLocationToTrackingData = useCallback((vehicleId: string, location: LocationUpdate): TrackingData => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    return {
      id: vehicleId,
      name: vehicle?.name || `Vehicle ${vehicleId.slice(0, 8)}`,
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      speed: location.coords.speed || 0,
      heading: location.coords.heading || 0,
      status: "active" as const,
      fuel: vehicle?.fuel || 100,
      driver: vehicle?.driver || "Unknown Driver",
      lastUpdate: typeof location.timestamp === 'number'
        ? new Date(location.timestamp).toISOString()
        : location.timestamp.toString()
    }
  }, [vehicles])

  const formatSpeed = (speed: number) => `${Math.round(speed * 3.6)} km/h`
  const formatHeading = (heading: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(heading / 45) % 8
    return `${Math.round(heading)}° ${directions[index]}`
  }

  const singleVehicleStream = useVehicleLocationStream(
    vehicleId || '',
    !!vehicleId
  )

  // Update vehicles when initialVehicles changes
  useEffect(() => {
    if (initialVehicles.length > 0) {
      setVehicles(initialVehicles)
    }
  }, [initialVehicles])

  // // Update markers when vehicles change and map is loaded
  // useEffect(() => {
  //   if (!mapLoaded || !mapInstanceRef.current || vehicles.length === 0) return

  //   const updateAllMarkers = async () => {
  //     for (const vehicle of vehicles) {
  //       await updateSingleVehicleMarker(vehicle)
  //     }
  //   }

  //   updateAllMarkers()
  // }, [vehicles, mapLoaded])
  

  // Initialize map - FIXED VERSION
  useEffect(() => {
    // Prevent multiple initializations
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current || initializingRef.current) {
      return
    }

    initializingRef.current = true
    mountedRef.current = true
    let map: any = null
    let leafletLoaded = false

    const initializeMap = async () => {
      try {
        // Wait for DOM to be fully ready
        await new Promise(resolve => setTimeout(resolve, 100))

        if (!mountedRef.current || !mapRef.current) {
          initializingRef.current = false
          return
        }

        const L = (await import("leaflet")).default
        leafletLoaded = true

        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })

        if (!mountedRef.current || !mapRef.current) {
          initializingRef.current = false
          return
        }

        // Clear any existing map instance
        if (mapInstanceRef.current) {
          console.log("Clearing existing Leaflet instance")
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }

        // Initialize map
        map = L.map(mapRef.current, {
          center: [-1.9403, 29.8739], // Kigali, Rwanda
          zoom: 13,
          zoomControl: true,
          attributionControl: true
        })

        // Base layers
        const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19
        })

        const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
          attribution: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        })

        osm.addTo(map)

        const baseMaps = {
          "Street Map": osm,
          "Satellite View": satellite
        }

        L.control.layers(baseMaps, undefined, { position: 'topleft' }).addTo(map)

        if (!mountedRef.current) {
          map.remove()
          initializingRef.current = false
          return
        }

        mapInstanceRef.current = map
        setMapLoaded(true)
        setInitError(null)
        initializingRef.current = false

        // Force resize after a delay
        setTimeout(() => {
          if (mapInstanceRef.current && mountedRef.current) {
            mapInstanceRef.current.invalidateSize()
          }
        }, 100)

      } catch (error) {
        console.error('Map initialization error:', error)
        initializingRef.current = false
        if (mountedRef.current) {
          setInitError('Failed to load map. Please refresh the page.')
        }
      }
    }

    initializeMap()

    return () => {
      mountedRef.current = false
      initializingRef.current = false

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (error) {
          console.error('Cleanup error:', error)
        }
        mapInstanceRef.current = null
      }
      setMapLoaded(false)
    }
  }, []) // Empty dependency array - only run once

  // Handle stream updates
  useEffect(() => {
    if (!vehicleId || !singleVehicleStream.location || !mapLoaded || !mountedRef.current) return

    const location = singleVehicleStream.location
    if (!location) return
    const updatedVehicle = convertLocationToTrackingData(vehicleId, location)
    
    // Update trail
    let trail = vehicleTrailsRef.current.get(vehicleId) || []
    
    // Pre-populate with initial trail if this is the first update
    if (trail.length === 0 && initialTrail.length > 0) {
      trail = [...initialTrail]
    }

    const newPoint: [number, number] = [updatedVehicle.lat, updatedVehicle.lng]
    
    // Avoid duplicate adjacent points
    const lastPoint = trail[trail.length - 1]
    if (!lastPoint || lastPoint[0] !== newPoint[0] || lastPoint[1] !== newPoint[1]) {
      trail.push(newPoint)
    }

    if (trail.length > mapSettings.maxTrailPoints) {
      trail.shift()
    }
    vehicleTrailsRef.current.set(vehicleId, trail)

    // Update vehicles state
    setVehicles(prev => {
      const existing = prev.find(v => v.id === vehicleId)
      if (existing) {
        return prev.map(v => v.id === vehicleId ? updatedVehicle : v)
      }
      return [...prev, updatedVehicle]
    })

    setLastUpdate(new Date().toLocaleTimeString())

    // Update map
    if (mapInstanceRef.current) {
      updateSingleVehicleMarker(updatedVehicle)
      if (mapSettings.showTrails && trail.length >= 2) {
        updateVehicleTrail(vehicleId, trail)
      }

      if (mapSettings.autoCenter || activeStreams.size === 1) {
        mapInstanceRef.current.setView([updatedVehicle.lat, updatedVehicle.lng], mapInstanceRef.current.getZoom())
      }
    }

    if (selectedVehicle?.id === vehicleId) {
      setSelectedVehicle(updatedVehicle)
    }
  }, [singleVehicleStream.location, vehicleId, selectedVehicle, mapSettings, mapLoaded, convertLocationToTrackingData])

  // Handle stream status
  useEffect(() => {
    if (!vehicleId) return

    setActiveStreams(prev => {
      const updated = new Set(prev)
      if (singleVehicleStream.isConnected) {
        updated.add(vehicleId)
      } else {
        updated.delete(vehicleId)
      }
      return updated
    })
  }, [singleVehicleStream.isConnected, vehicleId])

  const updateVehicleTrail = useCallback(async (vehicleId: string, trailPoints: [number, number][]) => {
    if (!mapInstanceRef.current || !mapSettings.showTrails || trailPoints.length < 2) return

    try {
      const L = (await import("leaflet")).default

      const existingTrail = trailLayersRef.current.get(vehicleId)
      if (existingTrail) {
        mapInstanceRef.current.removeLayer(existingTrail)
      }

      const hasActiveStream = activeStreams.has(vehicleId)

      const polyline = L.polyline(trailPoints, {
        color: hasActiveStream ? '#10b981' : '#6b7280',
        weight: 3,
        opacity: hasActiveStream ? 0.8 : 0.5,
        dashArray: hasActiveStream ? undefined : '5, 5',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstanceRef.current)

      trailLayersRef.current.set(vehicleId, polyline)

      // Add A/B markers for the live trail
      const existingMarkers = trailLayersRef.current.get(`${vehicleId}-markers`)
      if (existingMarkers) {
        mapInstanceRef.current.removeLayer(existingMarkers)
      }

      if (trailPoints.length >= 1) {
        const startPoint = trailPoints[0]
        const endPoint = trailPoints[trailPoints.length - 1]

        const startMarker = (L as any).marker(startPoint, {
          icon: (L as any).divIcon({
            html: `<div style="background-color: #ef4444; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 12px;">A</div>`,
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          }),
          zIndexOffset: 1000
        })

        const endMarker = (L as any).marker(endPoint, {
          icon: (L as any).divIcon({
            html: `<div style="background-color: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 12px;">B</div>`,
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          }),
          zIndexOffset: 1001
        })

        const markersGroup = (L as any).layerGroup([startMarker, endMarker]).addTo(mapInstanceRef.current)
        trailLayersRef.current.set(`${vehicleId}-markers`, markersGroup)
      }
    } catch (error) {
      console.error('Error updating trail:', error)
    }
  }, [activeStreams, mapSettings.showTrails])

  // Handle historical points
  useEffect(() => {
    if (!mapLoaded || historicalPoints.length < 2 || !mapInstanceRef.current) return

    const renderHistory = async () => {
      try {
        const L = (await import("leaflet")).default
        
        // Remove existing history layer
        const existingLayer = trailLayersRef.current.get('historical-path')
        if (existingLayer) {
          mapInstanceRef.current.removeLayer(existingLayer)
        }

        const existingMarkerLayer = trailLayersRef.current.get('historical-markers')
        if (existingMarkerLayer) {
          mapInstanceRef.current.removeLayer(existingMarkerLayer)
        }

        const polyline = (L.polyline as any)(historicalPoints, {
          color: '#1e40af', // Royal Blue
          weight: 6,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(mapInstanceRef.current)

        trailLayersRef.current.set('historical-path', polyline)

        // Add markers for intermediate points (subtle dots)
        const intermediateMarkers: any[] = []
        historicalPoints.forEach((point, index) => {
          // Skip first and last as they get A/B markers
          if (index === 0 || index === historicalPoints.length - 1) return

          const circle = (L as any).circleMarker(point, {
            radius: 3,
            fillColor: '#3b82f6',
            color: '#fff',
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.6
          }).addTo(mapInstanceRef.current)
          intermediateMarkers.push(circle)
        })
        
        // Add A and B markers
        const startPoint = historicalPoints[0]
        const endPoint = historicalPoints[historicalPoints.length - 1]

        const startMarker = (L as any).marker(startPoint, {
          icon: (L as any).divIcon({
            html: `<div style="background-color: #ef4444; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); font-size: 14px;">A</div>`,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          })
        }).bindPopup("Start Point").addTo(mapInstanceRef.current)

        const endMarker = (L as any).marker(endPoint, {
          icon: (L as any).divIcon({
            html: `<div style="background-color: #22c55e; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); font-size: 14px;">B</div>`,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          })
        }).bindPopup("End Point").addTo(mapInstanceRef.current)
        
        const historyMarkersLayer = (L as any).layerGroup([...intermediateMarkers, startMarker, endMarker]).addTo(mapInstanceRef.current)
        trailLayersRef.current.set('historical-markers', historyMarkersLayer)

        // Fit bounds to history
        if (historicalPoints.length > 0) {
          const bounds = (L as any).latLngBounds(historicalPoints)
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
        }
      } catch (error) {
        console.error('Error rendering history:', error)
      }
    }

    renderHistory()
  }, [historicalPoints, mapLoaded])

  const updateSingleVehicleMarker = useCallback(async (vehicle: TrackingData) => {
    if (!mapInstanceRef.current) return

    try {
      const existingMarker = markersRef.current.get(vehicle.id)
      if (existingMarker) {
        mapInstanceRef.current.removeLayer(existingMarker)
      }

      const marker = await createVehicleMarker(vehicle)
      markersRef.current.set(vehicle.id, marker)
    } catch (error) {
      console.error('Error updating marker:', error)
    }
  }, [activeStreams])

  const createVehicleIcon = (vehicle: TrackingData): DivIconOptions => {
    const hasActiveStream = activeStreams.has(vehicle.id)
    const color = hasActiveStream ? "#059669" : "#6b7280"

    const iconHtml = `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="transform: rotate(45deg); font-size: 16px;">🚗</div>
        ${hasActiveStream ? `<div style="
          position: absolute;
          top: -3px;
          right: -3px;
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
          border: 2px solid white;
          animation: pulse 2s infinite;
        "></div>` : ''}
      </div>
    `

    return {
      html: iconHtml,
      className: "custom-vehicle-marker",
      iconSize: [32, 32] as [number, number],
      iconAnchor: [16, 32] as [number, number],
      popupAnchor: [0, -32] as [number, number],
    }
  }

  const createVehicleMarker = async (vehicle: TrackingData) => {
    const L = (await import("leaflet")).default
    const hasActiveStream = activeStreams.has(vehicle.id)

    const iconConfig = createVehicleIcon(vehicle)
    const customIcon = L.divIcon(iconConfig)

    const marker = L.marker([vehicle.lat, vehicle.lng], { icon: customIcon }).addTo(mapInstanceRef.current)

    const popupContent = `
      <div style="padding: 12px; min-width: 200px;">
        <div style="display: flex; align-items: center; justify-between; margin-bottom: 8px;">
          <h3 style="font-weight: 600; font-size: 14px; margin: 0;">${vehicle.name}</h3>
          ${hasActiveStream ?
        '<span style="padding: 2px 8px; font-size: 11px; background: #dcfce7; color: #16a34a; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block;"></span>Live</span>' :
        '<span style="padding: 2px 8px; font-size: 11px; background: #f3f4f6; color: #6b7280; border-radius: 4px;">Static</span>'
      }
        </div>
        <div style="font-size: 12px; color: #6b7280; line-height: 1.8;">
          <div style="display: flex; justify-between;">
            <span>Driver:</span>
            <span style="font-weight: 500; color: #111827;">${vehicle.driver}</span>
          </div>
          <div style="display: flex; justify-between;">
            <span>Speed:</span>
            <span style="font-weight: 500; color: #111827;">${formatSpeed(vehicle.speed)}</span>
          </div>
          <div style="display: flex; justify-between;">
            <span>Heading:</span>
            <span style="font-weight: 500; color: #111827;">${formatHeading(vehicle.heading)}</span>
          </div>
          <div style="display: flex; justify-between;">
            <span>Last Update:</span>
            <span style="font-weight: 500; color: #111827;">${new Date(vehicle.lastUpdate).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    `

    marker.bindPopup(popupContent)
    marker.on("click", () => setSelectedVehicle(vehicle))

    return marker
  }

  const centerOnVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (vehicle && mapInstanceRef.current) {
      mapInstanceRef.current.setView([vehicle.lat, vehicle.lng], 15, {
        animate: true,
        duration: 0.5
      })

      const marker = markersRef.current.get(vehicleId)
      if (marker) {
        marker.openPopup()
      }
    }
  }

  const handleFitAllVehicles = async () => {
    if (mapInstanceRef.current && vehicles.length > 0) {
      const L = (await import("leaflet")).default
      const bounds = L.latLngBounds(vehicles.map(v => [v.lat, v.lng] as [number, number]))
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastUpdate(new Date().toLocaleTimeString())
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {mapLoaded && !initError && (
        <>
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
            <Button
              size="sm"
              onClick={handleFitAllVehicles}
              className="bg-background text-foreground border shadow-sm hover:bg-muted"
              disabled={vehicles.length === 0}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Fit All
            </Button>
            <Button
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-background text-foreground border shadow-sm hover:bg-muted"
            >
              {isRefreshing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
            {onHistoryToggle && (
              <Button
                size="sm"
                variant={showHistory ? "default" : "secondary"}
                onClick={onHistoryToggle}
                disabled={isHistoryLoading}
                className="bg-background text-foreground border shadow-sm hover:bg-muted"
              >
                <Clock className="w-4 h-4 mr-2" />
                {showHistory ? "Hide History" : "View History"}
                {isHistoryLoading && <RefreshCw className="w-3 h-3 ml-2 animate-spin" />}
              </Button>
            )}
          </div>

          <div className="absolute top-4 left-4 z-[1000]">
            <Card className="px-3 py-2 bg-background/95 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${singleVehicleStream.isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <Activity className="w-3 h-3" />
                  <span className="font-medium">{activeStreams.size}</span>
                </div>
                <span className="text-muted-foreground">
                  {singleVehicleStream.isConnected ? 'Live' : 'Waiting'}
                  {lastUpdate && ` • ${lastUpdate}`}
                </span>
              </div>
              {singleVehicleStream.error && (
                <div className="text-xs text-red-500 mt-1">
                  {singleVehicleStream.error}
                </div>
              )}
            </Card>
          </div>

          {selectedVehicle && (
            <Card className="absolute bottom-4 left-4 p-4 min-w-[320px] bg-background/95 backdrop-blur-sm z-[1000]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{selectedVehicle.name}</h3>
                <Button size="sm" variant="ghost" onClick={() => setSelectedVehicle(null)}>×</Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver:</span>
                  <span className="font-medium">{selectedVehicle.driver}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Speed:</span>
                  <span className="font-medium">{formatSpeed(selectedVehicle.speed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Heading:</span>
                  <span className="font-medium">{formatHeading(selectedVehicle.heading)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Update:</span>
                  <span className="font-medium">{new Date(selectedVehicle.lastUpdate).toLocaleTimeString()}</span>
                </div>
              </div>
              <Button size="sm" className="w-full mt-3" onClick={() => centerOnVehicle(selectedVehicle.id)}>
                <Navigation className="w-4 h-4 mr-2" />
                Center
              </Button>
            </Card>
          )}

          <Card className="absolute bottom-4 right-4 p-3 bg-background/95 backdrop-blur-sm z-[1000]">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4" />
              <span className="font-medium text-sm">Map Settings</span>
            </div>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mapSettings.showTrails}
                  onChange={(e) => setMapSettings(prev => ({ ...prev, showTrails: e.target.checked }))}
                  className="cursor-pointer"
                />
                <span>Show Vehicle Trails</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mapSettings.autoCenter}
                  onChange={(e) => setMapSettings(prev => ({ ...prev, autoCenter: e.target.checked }))}
                  className="cursor-pointer"
                />
                <span>Auto-center on Updates</span>
              </label>
            </div>
          </Card>
        </>
      )}

      {!mapLoaded && !initError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-[1000]">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">Loading Map...</p>
            <p className="text-sm text-muted-foreground mt-1">Initializing vehicle tracking system</p>
          </div>
        </div>
      )}

      {initError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-[1000]">
          <div className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-destructive font-medium">Map Loading Error</p>
            <p className="text-sm text-muted-foreground mt-1">{initError}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      )}
    </div>
  )
}