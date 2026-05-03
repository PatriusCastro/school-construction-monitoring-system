'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createPriorityIcon(priority: string) {
  const color =
    priority === 'High' ? '#c0392b' :
    priority === 'Medium' ? '#c8a800' : '#27ae60'

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48" width="32" height="48">
      <filter id="shadow${color.replace('#','')}">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
      </filter>
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 32 16 32s16-20 16-32C32 7.163 24.837 0 16 0z"
        fill="${color}" filter="url(#shadow${color.replace('#','')})"/>
      <circle cx="16" cy="16" r="7" fill="white" opacity="0.95"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 48],
    iconAnchor: [16, 48],
  })
}

export interface School {
  id: string
  school_id: string
  school_name: string
  municipality: string
  legislative_district: string
  proposed_classrooms: number
  number_of_units: number
  stories: number
  auto_generated_scope: string
  sdo_priority_level: string
  funding_year: number
  construction_progress_pct: number
  materials_delivered_pct: number
  budget_allocated_php: number
  completion_date: string
  latitude: number
  longitude: number
}

function FitBounds({ schools }: { schools: School[] }) {
  const map = useMap()
  useEffect(() => {
    const valid = schools.filter(s => s.latitude && s.longitude)
    if (valid.length === 0) return
    if (valid.length === 1) { map.setView([valid[0].latitude, valid[0].longitude], 14); return }
    const bounds = L.latLngBounds(valid.map(s => [s.latitude, s.longitude]))
    map.fitBounds(bounds, { padding: [60, 60] })
  }, [schools, map])
  return null
}

// Hover tooltip using Leaflet tooltip (not popup)
function HoverMarkers({ schools, onSelectSchool }: { schools: School[]; onSelectSchool: (s: School | null) => void }) {
  const map = useMap()

  useEffect(() => {
    const markers: L.Marker[] = []

    schools.forEach(school => {
      if (!school.latitude || !school.longitude) return

      const marker = L.marker([school.latitude, school.longitude], {
        icon: createPriorityIcon(school.sdo_priority_level),
      })

      // Build hover tooltip HTML
      const pct_c = school.construction_progress_pct || 0
      const pct_m = school.materials_delivered_pct || 0
      const priorityBg = school.sdo_priority_level === 'High' ? '#fde8e8' : school.sdo_priority_level === 'Medium' ? '#fef3cd' : '#e6f4ea'
      const priorityColor = school.sdo_priority_level === 'High' ? '#c0392b' : school.sdo_priority_level === 'Medium' ? '#7d5a00' : '#1e6e3a'

      const tooltipHtml = `
        <div style="font-family:system-ui,sans-serif;width:270px;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
          <div style="background:#1a3a6b;padding:14px 16px 12px;">
            <p style="color:rgba(255,255,255,0.5);font-size:9px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px 0;">${(school.municipality || 'LEGAZPI CITY').toUpperCase()}</p>
            <p style="color:white;font-size:15px;font-weight:700;line-height:1.2;margin:0 0 4px 0;">${school.school_name}</p>
            <p style="color:rgba(255,255,255,0.4);font-size:10px;font-family:monospace;margin:0;">ID: ${school.school_id || '—'}</p>
          </div>
          <div style="background:white;padding:12px 16px;">
            <div style="display:flex;gap:6px;margin-bottom:12px;">
              ${school.sdo_priority_level ? `<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:6px;background:${priorityBg};color:${priorityColor};">${school.sdo_priority_level} Priority</span>` : ''}
              ${school.auto_generated_scope ? `<span style="font-size:11px;font-weight:700;font-family:monospace;padding:3px 10px;border-radius:6px;background:#e8f0fb;color:#1a3a6b;">${school.auto_generated_scope}</span>` : ''}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
              <div><p style="font-size:9px;color:#94a3b8;letter-spacing:0.08em;margin:0 0 2px 0;">CLASSROOMS</p><p style="font-size:20px;font-weight:700;color:#1e293b;margin:0;line-height:1;">${school.proposed_classrooms ?? '—'}</p></div>
              <div><p style="font-size:9px;color:#94a3b8;letter-spacing:0.08em;margin:0 0 2px 0;">UNITS</p><p style="font-size:20px;font-weight:700;color:#1e293b;margin:0;line-height:1;">${school.number_of_units ?? '—'}</p></div>
              <div><p style="font-size:9px;color:#94a3b8;letter-spacing:0.08em;margin:0 0 2px 0;">STORIES</p><p style="font-size:20px;font-weight:700;color:#1e293b;margin:0;line-height:1;">${school.stories ?? '—'}</p></div>
              <div><p style="font-size:9px;color:#94a3b8;letter-spacing:0.08em;margin:0 0 2px 0;">FUNDING YEAR</p><p style="font-size:20px;font-weight:700;color:#1e293b;margin:0;line-height:1;">${school.funding_year ?? '—'}</p></div>
            </div>
            <div style="margin-bottom:8px;">
              <div style="margin-bottom:5px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                  <span style="font-size:10px;color:#64748b;">Construction</span>
                  <span style="font-size:10px;font-weight:700;color:#1a3a6b;">${pct_c}%</span>
                </div>
                <div style="height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden;">
                  <div style="height:100%;width:${pct_c}%;background:#1a3a6b;border-radius:3px;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                  <span style="font-size:10px;color:#64748b;">Materials</span>
                  <span style="font-size:10px;font-weight:700;color:#c8a800;">${pct_m}%</span>
                </div>
                <div style="height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden;">
                  <div style="height:100%;width:${pct_m}%;background:#c8a800;border-radius:3px;"></div>
                </div>
              </div>
            </div>
            ${school.budget_allocated_php ? `<div style="text-align:right;padding-top:6px;border-top:1px solid #f1f5f9;"><span style="font-size:11px;color:#64748b;">Budget: </span><span style="font-size:11px;font-weight:700;color:#1e293b;">₱${Number(school.budget_allocated_php).toLocaleString()}</span></div>` : ''}
          </div>
        </div>
      `

      marker.bindTooltip(tooltipHtml, {
        permanent: false,
        direction: 'top',
        offset: [0, -48],
        opacity: 1,
        className: 'school-hover-tooltip',
      })

      // Click → select school for right panel
      marker.on('click', () => onSelectSchool(school))

      marker.addTo(map)
      markers.push(marker)
    })

    return () => { markers.forEach(m => m.remove()) }
  }, [schools, map, onSelectSchool])

  return null
}

interface SchoolMapProps {
  schools: School[]
  selectedSchool: School | null
  onSelectSchool: (school: School | null) => void
}

export default function SchoolMap({ schools, selectedSchool, onSelectSchool }: SchoolMapProps) {
  const validSchools = schools.filter(s => s.latitude && s.longitude)
  const defaultCenter: [number, number] = [13.1391, 123.7438]

  return (
    <>
      <style>{`
        .school-hover-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .school-hover-tooltip::before { display: none !important; }
        .leaflet-tooltip { pointer-events: none; }
      `}</style>

      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds schools={validSchools} />
        <HoverMarkers schools={validSchools} onSelectSchool={onSelectSchool} />
      </MapContainer>
    </>
  )
}