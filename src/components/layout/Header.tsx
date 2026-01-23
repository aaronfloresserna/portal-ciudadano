import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white border-b-4 border-tsj-title shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y Título */}
          <Link href="/dashboard" className="flex items-center gap-4">
            {/* Escudo de Chihuahua */}
            <div className="flex-shrink-0">
              <img
                src="/logos/escudo-chihuahua.svg"
                alt="Escudo del Estado de Chihuahua"
                className="h-16 w-auto"
              />
            </div>

            {/* Texto */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-tsj-title">
                Portal Ciudadano
              </h1>
              <p className="text-sm text-black">
                Trámites Administrativos sin Litis
              </p>
            </div>
          </Link>

          {/* Navegación */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-black hover:text-tsj-title font-medium"
            >
              Inicio
            </Link>
            <Link
              href="/dashboard"
              className="text-black hover:text-tsj-title font-medium"
            >
              Mis Trámites
            </Link>
            <Link
              href="/dashboard"
              className="text-black hover:text-tsj-title font-medium"
            >
              Ayuda
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
