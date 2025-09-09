"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MapPin, AlertTriangle } from "lucide-react"
import type { Issue } from "@/lib/mock-data"

interface LeafletMapClientProps {
  issues: Issue[]
}

// Leaflet types (simplified)
interface Leaflet {
  map: (container: string | HTMLElement, options?: any) => any
  tileLayer: (urlTemplate: string, options?: any) => any
  marker: (latlng: [number, number], options?: any) => any
  divIcon: (options?: any) => any
  popup: (options?: any) => any
}

declare global {
  interface Window {
    L?: Leaflet
  }
}

export function LeafletMapClient({ issues }: LeafletMapClientProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement("link")
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          link.rel = "stylesheet"
          link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          link.crossOrigin = ""
          document.head.appendChild(link)
        }

        // Load Leaflet JS
        if (!window.L) {
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          script.crossOrigin = ""
          script.onload = initializeMap
          script.onerror = () => setMapError("Failed to load Leaflet")
          document.head.appendChild(script)
        } else {
          initializeMap()
        }
      } catch (error) {
        setMapError("Failed to load Leaflet")
      }
    }

    const initializeMap = () => {
      if (!window.L || !mapContainer.current) return

      try {
        const centerLat = issues.reduce((sum, issue) => sum + issue.lat, 0) / issues.length || 28.6139
        const centerLng = issues.reduce((sum, issue) => sum + issue.lng, 0) / issues.length || 77.209

        // Initialize map
        map.current = window.L.map(mapContainer.current).setView([centerLat, centerLng], 12)

        // Add OpenStreetMap tiles
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map.current)

        setMapLoaded(true)
        addIssueMarkers()
      } catch (error) {
        setMapError("Failed to initialize map")
      }
    }

    const addIssueMarkers = () => {
      if (!map.current || !window.L) return

      issues.forEach((issue) => {
        // Create marker color based on status
        const markerColor =
          issue.status === "Pending" ? "#ef4444" : issue.status === "In-Progress" ? "#f97316" : "#22c55e"

        // Create custom marker icon
        const customIcon = window.L.divIcon({
          html: `
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background-color: ${markerColor};
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
            ">📍</div>
          `,
          className: "custom-div-icon",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        // Create popup content
        const popupContent = `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${issue.title}</h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${issue.description}</p>
            <div style="display: flex; gap: 4px; margin-bottom: 8px;">
              <span style="background: ${markerColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${issue.status}</span>
              <span style="background: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${issue.priority}</span>
            </div>
            <div style="font-size: 11px; color: #666;">
              <div><strong>Department:</strong> ${issue.department}</div>
              <div><strong>Reported by:</strong> ${issue.reportedBy}</div>
              <div><strong>SLA:</strong> ${issue.sla}</div>
            </div>
          </div>
        `

        // Create marker with popup
        window.L.marker([issue.lat, issue.lng], { icon: customIcon }).addTo(map.current).bindPopup(popupContent)
      })
    }

    loadLeaflet()

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [issues])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Issues Map
          {mapLoaded && (
            <Badge variant="secondary" className="ml-auto">
              {issues.length} markers
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mapError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
        )}

        <div className="relative">
          <div ref={mapContainer} className="w-full h-96 rounded-lg overflow-hidden bg-muted" />

          {!mapLoaded && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {mapLoaded && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span>Pending ({issues.filter((i) => i.status === "Pending").length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-3" />
                <span>In-Progress ({issues.filter((i) => i.status === "In-Progress").length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-2" />
                <span>Resolved ({issues.filter((i) => i.status === "Resolved").length})</span>
              </div>
            </div>
            <span>Click markers for details</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
