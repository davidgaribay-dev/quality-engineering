import { Link } from 'react-router-dom';
import { Heart, PawPrint, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Search,
    title: 'Browse with ease',
    body: 'Filter by dogs or cats and find a companion that fits your home.',
  },
  {
    icon: Heart,
    title: 'Meet your match',
    body: 'Detailed profiles, personalities, and what each pet is looking for.',
  },
  {
    icon: ShieldCheck,
    title: 'Adopt responsibly',
    body: 'Request to adopt or ask for more info — our team follows up with you.',
  },
];

export function Home() {
  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/60 to-background" />
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground">
              <PawPrint className="size-4" /> 7 pets looking for a home
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Find your <span className="text-primary">pawfect</span> match
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Adoptable dogs and cats, each with their own story. Meet them, fall
              in love, and start the adoption journey today.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" data-testid="hero-browse">
                <Link to="/pets">Browse pets</Link>
              </Button>
              <Button asChild size="lg" variant="outline" data-testid="hero-dogs">
                <Link to="/pets?species=dog">🐶 See dogs</Link>
              </Button>
              <Button asChild size="lg" variant="outline" data-testid="hero-cats">
                <Link to="/pets?species=cat">🐱 See cats</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border shadow-xl">
            <img
              src="/images/dog-biscuit.jpg"
              alt="A golden retriever puppy holding a flower"
              className="size-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mb-1 text-lg font-extrabold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
