import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

type FilterValue = 'all' | 'dog' | 'cat';

const OPTIONS: { value: FilterValue; label: string; testid: string }[] = [
  { value: 'all', label: 'All pets', testid: 'species-filter-all' },
  { value: 'dog', label: '🐶 Dogs', testid: 'species-filter-dog' },
  { value: 'cat', label: '🐱 Cats', testid: 'species-filter-cat' },
];

/** Segmented control that drives the `?species=` query param (loader re-runs on change). */
export function SpeciesFilter({ value }: { value: FilterValue }) {
  const [, setSearchParams] = useSearchParams();

  function select(next: FilterValue) {
    setSearchParams(
      next === 'all' ? {} : { species: next },
      { preventScrollReset: true }
    );
  }

  return (
    <div
      role="tablist"
      aria-label="Filter pets by species"
      data-testid="species-filter"
      className="inline-flex rounded-xl border border-border bg-muted p-1"
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            data-testid={opt.testid}
            data-active={active}
            onClick={() => select(opt.value)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-bold transition-colors',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
