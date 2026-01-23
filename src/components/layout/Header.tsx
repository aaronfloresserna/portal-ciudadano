import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-tsj-primary shadow-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo del TSJ */}
          <Link href="/dashboard" className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <img
                src="/logos/logo-stj.png"
                alt="Tribunal Superior de Justicia del Estado de Chihuahua"
                className="h-20 w-auto"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white uppercase tracking-wide">
                Poder Judicial
              </h1>
              <p className="text-sm text-white/90">
                Portal Ciudadano
              </p>
            </div>
          </Link>

          {/* Navegación */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-white hover:text-white/80 font-medium text-sm uppercase tracking-wide transition-colors"
            >
              Justicia a tu Alcance
            </Link>
            <Link
              href="/dashboard"
              className="text-white hover:text-white/80 font-medium text-sm uppercase tracking-wide transition-colors"
            >
              Información Judicial
            </Link>
            <Link
              href="/dashboard"
              className="text-white hover:text-white/80 font-medium text-sm uppercase tracking-wide transition-colors"
            >
              Auxiliares Judiciales
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
