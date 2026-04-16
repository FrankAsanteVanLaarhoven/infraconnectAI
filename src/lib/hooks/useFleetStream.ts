import { useState, useEffect } from 'react'
import { tacticalBus } from '../events/bus'

export type FleetEvent = {
  type: string
  data: any
  ts: string
}

export function useFleetStream() {
  const [events, setEvents] = useState<FleetEvent[]>([])
  const [lastHeartbeat, setLastHeartbeat] = useState<any>(null)
  const [lastTelemetry, setLastTelemetry] = useState<any>(null)
  const [lastIncident, setLastIncident] = useState<any>(null)

  useEffect(() => {
    const sse = new EventSource('/api/fleet/stream')

    const handlers = {
      heartbeat: (e: MessageEvent) => {
        const data = JSON.parse(e.data)
        setLastHeartbeat(data)
        setEvents(prev => [{ type: 'heartbeat', data, ts: new Date().toISOString() }, ...prev].slice(0, 50))
      },
      telemetry: (e: MessageEvent) => {
        const data = JSON.parse(e.data)
        setLastTelemetry(data)
        setEvents(prev => [{ type: 'telemetry', data, ts: new Date().toISOString() }, ...prev].slice(0, 50))
      },
      incident: (e: MessageEvent) => {
        const data = JSON.parse(e.data)
        setLastIncident(data)
        setEvents(prev => [{ type: 'incident', data, ts: new Date().toISOString() }, ...prev].slice(0, 50))
      },
      skill_report: (e: MessageEvent) => {
        const data = JSON.parse(e.data)
        setEvents(prev => [{ type: 'skill_report', data, ts: new Date().toISOString() }, ...prev].slice(0, 50))
      },
      tactical_override: (e: MessageEvent) => {
        const command = JSON.parse(e.data)
        tacticalBus.dispatch(command)
      }
    }

    Object.entries(handlers).forEach(([evt, handler]) => {
      sse.addEventListener(evt, handler as any)
    })

    return () => sse.close()
  }, [])

  return { events, lastHeartbeat, lastTelemetry, lastIncident }
}
