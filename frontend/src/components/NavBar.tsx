import { motion } from 'framer-motion';
import { UtensilsCrossed, ClipboardList, LineChart } from 'lucide-react';
import brandIcon from '../assets/brand-icon.png';

export type Role = 'CUSTOMER' | 'WAITER' | 'MANAGER';

const ROLES: { key: Role; label: string; icon: typeof UtensilsCrossed }[] = [
  { key: 'CUSTOMER', label: 'Customer', icon: UtensilsCrossed },
  { key: 'WAITER', label: 'Floor', icon: ClipboardList },
  { key: 'MANAGER', label: 'Manager', icon: LineChart },
];

interface NavBarProps {
  role: Role;
  onChange: (role: Role) => void;
}

/** Sticky app header: brand mark + a pill-style role switcher. */
export default function NavBar({ role, onChange }: NavBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={brandIcon} alt="" className="h-9 w-9 shrink-0" draggable={false} />
          <span className="font-display font-bold text-lg text-primary truncate">Chowly</span>
        </div>

        <nav
          aria-label="Switch view"
          className="relative flex items-center gap-1 rounded-[var(--radius-pill)] bg-ink/5 p-1"
        >
          {ROLES.map(({ key, label, icon: Icon }) => {
            const active = role === key;
            return (
              <button
                key={key}
                onClick={() => onChange(key)}
                aria-pressed={active}
                className={[
                  'relative z-10 flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 sm:px-4 py-2 text-sm font-semibold transition-colors',
                  active ? 'text-white' : 'text-ink-soft hover:text-primary',
                ].join(' ')}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 -z-10 rounded-[var(--radius-pill)] bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={16} className="shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
