import { Link, NavLink, Outlet } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight"
            data-testid="brand-home-link"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <PawPrint className="size-5" />
            </span>
            Pawfect Match
          </Link>
          <nav className="flex items-center gap-1" data-testid="main-nav">
            {[
              { to: '/', label: 'Home', end: true },
              { to: '/pets', label: 'Browse pets', end: false },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-bold transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto w-full max-w-6xl px-4 text-sm text-muted-foreground">
          🐾 Pawfect Match — a demo pet-adoption app. Every pet deserves a home.
        </div>
      </footer>
    </div>
  );
}
