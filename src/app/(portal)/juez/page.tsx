'use client'

import { useState } from 'react'
import Link from 'next/link'

const SOLICITUDES = [
  {
    id: 'EXP-2026-00142',
    conyuge1: 'María Fernanda Ruiz Orozco',
    conyuge2: 'Carlos Alberto Mendoza Vega',
    fechaIngreso: '2026-04-14',
    estado: 'PENDIENTE',
    juzgado: 'Juzgado 3° Familiar',
    modalidad: 'Mutuo acuerdo',
    hijos: true,
    bienes: true,
    municipio: 'Chihuahua',
    datos: {
      fechaMatrimonio: '2015-06-20',
      lugarMatrimonio: 'Chihuahua, Chih.',
      aniosMatrimonio: 10,
      hijosNombres: ['Sofía Mendoza Ruiz (8 años)', 'Diego Mendoza Ruiz (5 años)'],
      pensionAlimenticia: '$8,500 MXN mensuales',
      custodiaHijos: 'Custodia compartida',
      bienesMutuos: 'Departamento en Col. Jardines de Chihuahua, vehículo Nissan 2020',
      domicilio1: 'Calle Nogal 204, Col. Las Quintas, Chihuahua',
      domicilio2: 'Av. División del Norte 1890, Col. Obrera, Chihuahua',
    }
  },
  {
    id: 'EXP-2026-00138',
    conyuge1: 'Lucía Esperanza Torres Beltrán',
    conyuge2: 'Roberto Enrique Salinas Durán',
    fechaIngreso: '2026-04-12',
    estado: 'EN_REVISION',
    juzgado: 'Juzgado 1° Familiar',
    modalidad: 'Mutuo acuerdo',
    hijos: false,
    bienes: true,
    municipio: 'Juárez',
    datos: {
      fechaMatrimonio: '2019-11-08',
      lugarMatrimonio: 'Ciudad Juárez, Chih.',
      aniosMatrimonio: 6,
      hijosNombres: [],
      pensionAlimenticia: 'No aplica',
      custodiaHijos: 'Sin hijos',
      bienesMutuos: 'Casa en Fraccionamiento Misión, automóvil Honda 2021, cuenta bancaria compartida',
      domicilio1: 'Blvd. Zaragoza 4521, Col. Misión, Cd. Juárez',
      domicilio2: 'Calle Aztecas 890, Col. Centro, Cd. Juárez',
    }
  },
  {
    id: 'EXP-2026-00131',
    conyuge1: 'Ana Gabriela Herrera Cisneros',
    conyuge2: 'Miguel Ángel Ponce Leal',
    fechaIngreso: '2026-04-10',
    estado: 'APROBADO',
    juzgado: 'Juzgado 2° Familiar',
    modalidad: 'Mutuo acuerdo',
    hijos: true,
    bienes: false,
    municipio: 'Chihuahua',
    datos: {
      fechaMatrimonio: '2012-03-15',
      lugarMatrimonio: 'Chihuahua, Chih.',
      aniosMatrimonio: 14,
      hijosNombres: ['Valeria Ponce Herrera (11 años)'],
      pensionAlimenticia: '$5,200 MXN mensuales',
      custodiaHijos: 'Custodia materna, visitas paternas cada 15 días',
      bienesMutuos: 'Sin bienes inmuebles en común',
      domicilio1: 'Calle Pino 330, Col. Arboledas, Chihuahua',
      domicilio2: 'Av. Tecnológico 2200, Col. San Felipe, Chihuahua',
    }
  },
  {
    id: 'EXP-2026-00127',
    conyuge1: 'Patricia Ximena Gómez Acosta',
    conyuge2: 'José Luis Villanueva Ríos',
    fechaIngreso: '2026-04-08',
    estado: 'RECHAZADO',
    juzgado: 'Juzgado 3° Familiar',
    modalidad: 'Mutuo acuerdo',
    hijos: false,
    bienes: false,
    municipio: 'Delicias',
    datos: {
      fechaMatrimonio: '2021-09-01',
      lugarMatrimonio: 'Delicias, Chih.',
      aniosMatrimonio: 4,
      hijosNombres: [],
      pensionAlimenticia: 'No aplica',
      custodiaHijos: 'Sin hijos',
      bienesMutuos: 'Sin bienes declarados',
      domicilio1: 'Calle Reforma 88, Centro, Delicias',
      domicilio2: 'Av. Hidalgo 412, Col. Nueva, Delicias',
    }
  },
  {
    id: 'EXP-2026-00119',
    conyuge1: 'Sandra Ivonne Castillo Mora',
    conyuge2: 'Alejandro Ramos Fuentes',
    fechaIngreso: '2026-04-05',
    estado: 'PENDIENTE',
    juzgado: 'Juzgado 1° Familiar',
    modalidad: 'Mutuo acuerdo',
    hijos: true,
    bienes: true,
    municipio: 'Chihuahua',
    datos: {
      fechaMatrimonio: '2010-07-14',
      lugarMatrimonio: 'Chihuahua, Chih.',
      aniosMatrimonio: 15,
      hijosNombres: ['Mateo Ramos Castillo (13 años)', 'Emilia Ramos Castillo (10 años)', 'Tomás Ramos Castillo (7 años)'],
      pensionAlimenticia: '$12,000 MXN mensuales',
      custodiaHijos: 'Custodia materna, régimen de convivencia amplio',
      bienesMutuos: 'Casa habitación, dos vehículos, negocio familiar (taller mecánico)',
      domicilio1: 'Av. Universidad 1560, Col. Magisterial, Chihuahua',
      domicilio2: 'Calle Montes Urales 720, Col. Lomas, Chihuahua',
    }
  },
]

const ESTADO_CONFIG = {
  PENDIENTE: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500', border: 'border-amber-200' },
  EN_REVISION: { label: 'En Revisión', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', border: 'border-blue-200' },
  APROBADO: { label: 'Aprobado', bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  RECHAZADO: { label: 'Rechazado', bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', border: 'border-red-200' },
}

type EstadoKey = keyof typeof ESTADO_CONFIG

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

export default function JuezPage() {
  const [seleccionada, setSeleccionada] = useState(SOLICITUDES[0])
  const [filtro, setFiltro] = useState<string>('TODOS')

  const solicitudesFiltradas = filtro === 'TODOS'
    ? SOLICITUDES
    : SOLICITUDES.filter(s => s.estado === filtro)

  const estado = ESTADO_CONFIG[seleccionada.estado as EstadoKey]

  const conteos = {
    TODOS: SOLICITUDES.length,
    PENDIENTE: SOLICITUDES.filter(s => s.estado === 'PENDIENTE').length,
    EN_REVISION: SOLICITUDES.filter(s => s.estado === 'EN_REVISION').length,
    APROBADO: SOLICITUDES.filter(s => s.estado === 'APROBADO').length,
    RECHAZADO: SOLICITUDES.filter(s => s.estado === 'RECHAZADO').length,
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      {/* Header del juez */}
      <header className="bg-[#662d91] shadow-md">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logos/logo-stj.png" alt="TSJ" className="h-16 w-auto" />
            <div>
              <p className="text-white/70 text-xs uppercase tracking-widest">Tribunal Superior de Justicia</p>
              <h1 className="text-white font-bold text-lg leading-tight">Panel del Juez</h1>
              <p className="text-white/80 text-sm">Solicitudes de Divorcio Voluntario</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-white font-semibold text-sm">Lic. Ramona Flores Estrada</p>
              <p className="text-white/70 text-xs">Juez 3° Familiar • Chihuahua</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              RF
            </div>
            <Link href="/dashboard" className="text-white/70 hover:text-white text-sm transition-colors">
              ← Salir
            </Link>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex gap-8 overflow-x-auto">
          {[
            { key: 'TODOS', label: 'Todas' },
            { key: 'PENDIENTE', label: 'Pendientes' },
            { key: 'EN_REVISION', label: 'En Revisión' },
            { key: 'APROBADO', label: 'Aprobadas' },
            { key: 'RECHAZADO', label: 'Rechazadas' },
          ].map(({ key, label }) => {
            const cfg = key !== 'TODOS' ? ESTADO_CONFIG[key as EstadoKey] : null
            const isActive = filtro === key
            return (
              <button
                key={key}
                onClick={() => setFiltro(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#662d91] text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {cfg && <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />}
                {label}
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {conteos[key as keyof typeof conteos]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Layout principal */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 flex gap-6 h-[calc(100vh-160px)]">

        {/* Lista */}
        <div className="w-[380px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto pr-1">
          {solicitudesFiltradas.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm">
              Sin solicitudes en este estado.
            </div>
          )}
          {solicitudesFiltradas.map((s) => {
            const cfg = ESTADO_CONFIG[s.estado as EstadoKey]
            const isSelected = seleccionada.id === s.id
            return (
              <button
                key={s.id}
                onClick={() => setSeleccionada(s)}
                className={`w-full text-left bg-white rounded-xl p-4 border-2 transition-all shadow-sm hover:shadow-md ${
                  isSelected ? 'border-[#662d91] shadow-md' : 'border-transparent hover:border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-gray-400">{s.id}</span>
                  <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 text-sm leading-snug">{s.conyuge1}</p>
                <p className="text-gray-500 text-sm">y {s.conyuge2}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                  <span>{formatFecha(s.fechaIngreso)}</span>
                  <span>•</span>
                  <span>{s.municipio}</span>
                  <span>•</span>
                  <span>{s.hijos ? '🧒 Con hijos' : 'Sin hijos'}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Detalle */}
        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-y-auto border border-gray-100">
          {/* Header del detalle */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-sm text-gray-400">{seleccionada.id}</span>
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${estado.bg} ${estado.text}`}>
                  <span className={`w-2 h-2 rounded-full ${estado.dot}`} />
                  {estado.label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {seleccionada.conyuge1} <span className="text-gray-400 font-normal">y</span> {seleccionada.conyuge2}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{seleccionada.juzgado} • Ingresado el {formatFecha(seleccionada.fechaIngreso)}</p>
            </div>

            {/* Acciones */}
            {seleccionada.estado === 'PENDIENTE' && (
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Tomar en revisión
                </button>
              </div>
            )}
            {seleccionada.estado === 'EN_REVISION' && (
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors">
                  Rechazar
                </button>
                <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                  Aprobar
                </button>
              </div>
            )}
            {seleccionada.estado === 'APROBADO' && (
              <button className="px-4 py-2 bg-[#662d91] text-white text-sm font-medium rounded-lg hover:bg-[#521f75] transition-colors">
                Descargar convenio
              </button>
            )}
          </div>

          <div className="px-8 py-6 space-y-6">

            {/* Datos del matrimonio */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Datos del Matrimonio</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Fecha de matrimonio</p>
                  <p className="font-semibold text-gray-900 text-sm">{formatFecha(seleccionada.datos.fechaMatrimonio)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Lugar</p>
                  <p className="font-semibold text-gray-900 text-sm">{seleccionada.datos.lugarMatrimonio}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Duración</p>
                  <p className="font-semibold text-gray-900 text-sm">{seleccionada.datos.aniosMatrimonio} años</p>
                </div>
              </div>
            </section>

            {/* Cónyuges */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Domicilios</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-[#662d91] font-semibold mb-1">Cónyuge 1 (Solicitante)</p>
                  <p className="font-semibold text-gray-900 text-sm">{seleccionada.conyuge1}</p>
                  <p className="text-xs text-gray-500 mt-1">{seleccionada.datos.domicilio1}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-[#662d91] font-semibold mb-1">Cónyuge 2</p>
                  <p className="font-semibold text-gray-900 text-sm">{seleccionada.conyuge2}</p>
                  <p className="text-xs text-gray-500 mt-1">{seleccionada.datos.domicilio2}</p>
                </div>
              </div>
            </section>

            {/* Hijos */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Hijos</h3>
              {seleccionada.datos.hijosNombres.length > 0 ? (
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {seleccionada.datos.hijosNombres.map((hijo, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#c4b9db] flex items-center justify-center text-[#662d91] text-xs font-bold">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-900">{hijo}</p>
                    </div>
                  ))}
                  <div className="px-4 py-3 bg-gray-50 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Pensión alimenticia</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{seleccionada.datos.pensionAlimenticia}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Custodia</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{seleccionada.datos.custodiaHijos}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-500">
                  Sin hijos menores de edad
                </div>
              )}
            </section>

            {/* Bienes */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bienes en Común</h3>
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-900">
                {seleccionada.datos.bienesMutuos}
              </div>
            </section>

            {/* Documentos */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Documentos Adjuntos</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Acta de Matrimonio', 'INE Cónyuge 1', 'INE Cónyuge 2', 'CURP Cónyuge 1', 'CURP Cónyuge 2', 'Convenio de Divorcio'].map((doc) => (
                  <div key={doc} className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                    <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc}</p>
                      <p className="text-xs text-gray-400">Ver documento</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Notas del juez */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Notas del Juzgado</h3>
              <textarea
                rows={3}
                placeholder="Agregar observaciones o notas internas..."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#662d91]/30 focus:border-[#662d91] resize-none"
              />
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
