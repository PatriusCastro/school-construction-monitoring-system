'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icons broken in Next.js/Webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom colored marker based on priority
function createPriorityIcon(priority: string) {
  const color =
    priority === 'High' ? '#c0392b' :
    priority === 'Medium' ? '#c8a800' : '#27ae60'

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
    </svg>
  `

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  })
}

interface School {
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

// Auto-fit map bounds to all school markers
function FitBounds({ schools }: { schools: School[] }) {
  const map = useMap()

  useEffect(() => {
    const valid = schools.filter(s => s.latitude && s.longitude)
    if (valid.length === 0) return
    if (valid.length === 1) {
      map.setView([valid[0].latitude, valid[0].longitude], 14)
      return
    }
    const bounds = L.latLngBounds(valid.map(s => [s.latitude, s.longitude]))
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [schools, map])

  return null
}

interface SchoolMapProps {
  schools: School[]
  onSelectSchool?: (school: School) => void
}

export default function SchoolMap({ schools, onSelectSchool }: SchoolMapProps) {
  const validSchools = schools.filter(s => s.latitude && s.longitude)

  // Legazpi City center as default
  const defaultCenter: [number, number] = [13.1391, 123.7438]

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds schools={validSchools} />

      {validSchools.map(school => (
        <Marker
          key={school.id}
          position={[school.latitude, school.longitude]}
          icon={createPriorityIcon(school.sdo_priority_level)}
          eventHandlers={{
            click: () => onSelectSchool?.(school),
          }}
        >
          <Popup className="school-popup" maxWidth={260}>
            <div style={{ fontFamily: 'sans-serif', padding: '4px 2px' }}>
              {/* Popup header */}
              <div style={{
                background: '#1a3a6b',
                margin: '-10px -10px 10px -10px',
                padding: '10px 12px',
                borderRadius: '6px 6px 0 0'
              }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                  {school.municipality || 'Legazpi City'}
                </p>
                <p style={{ color: 'white', fontSize: '13px', fontWeight: 600, lineHeight: 1.3 }}>
                  {school.school_name}
                </p>
                {school.school_id && (
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontFamily: 'monospace', marginTop: '2px' }}>
                    ID: {school.school_id}
                  </p>
                )}
              </div>

              {/* Priority + scope */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                {school.sdo_priority_level && (
                  <span style={{
                    fontSize: '10px', fontWeight: 500, padding: '2px 7px', borderRadius: '4px',
                    background: school.sdo_priority_level === 'High' ? '#fde8e8' :
                      school.sdo_priority_level === 'Medium' ? '#fef3cd' : '#e6f4ea',
                    color: school.sdo_priority_level === 'High' ? '#9b2335' :
                      school.sdo_priority_level === 'Medium' ? '#7d5a00' : '#1e6e3a',
                  }}>
                    {school.sdo_priority_level} Priority
                  </span>
                )}
                {school.auto_generated_scope && (
                  <span style={{ fontSize: '10px', fontWeight: 600, fontFamily: 'monospace', padding: '2px 7px', borderRadius: '4px', background: '#e8f0fb', color: '#1a3a6b' }}>
                    {school.auto_generated_scope}
                  </span>
                )}
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }}>
                {[
                  { label: 'Classrooms', value: school.proposed_classrooms },
                  { label: 'Units', value: school.number_of_units },
                  { label: 'Stories', value: school.stories },
                  { label: 'Funding Year', value: school.funding_year },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#f8fafc', borderRadius: '6px', padding: '5px 8px' }}>
                    <p style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1px' }}>{label}</p>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{value ?? '—'}</p>
                  </div>
                ))}
              </div>

              {/* Progress bars */}
              <div style={{ marginBottom: '6px' }}>
                <ProgressBar label="Construction" value={school.construction_progress_pct} color="#1a3a6b" />
                <ProgressBar label="Materials" value={school.materials_delivered_pct} color="#c8a800" />
              </div>

              {school.budget_allocated_php ? (
                <p style={{ fontSize: '10px', color: '#64748b', textAlign: 'right', marginTop: '4px' }}>
                  Budget: <strong>₱{Number(school.budget_allocated_php).toLocaleString()}</strong>
                </p>
              ) : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

function ProgressBar({ label, value, color }: { label: string; value?: number; color: string }) {
  const pct = value || 0
  return (
    <div style={{ marginBottom: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <span style={{ fontSize: '9px', color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: '9px', fontWeight: 600, color }}>{pct}%</span>
      </div>
      <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}