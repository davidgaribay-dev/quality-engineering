import {
  Link,
  useLoaderData,
  type LoaderFunctionArgs,
} from 'react-router-dom';
import { ArrowLeft, Check, Heart, Info, MapPin } from 'lucide-react';
import type { Pet } from '@org/contracts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  formatAge,
  speciesEmoji,
  speciesLabel,
  statusLabel,
  statusVariant,
} from '@/lib/format';

export async function petLoader({ params }: LoaderFunctionArgs): Promise<Pet> {
  const { fetchPet } = await import('@/lib/api');
  return fetchPet(params.id as string);
}

export function PetDetailPage() {
  const pet = useLoaderData() as Pet;
  const adoptable = pet.status === 'available';

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8" data-testid="pet-detail" data-pet-id={pet.id}>
      <Link
        to="/pets"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground"
        data-testid="back-to-pets"
      >
        <ArrowLeft className="size-4" /> All pets
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-border shadow-lg">
          <img
            src={pet.imageUrl}
            alt={pet.name}
            data-testid="pet-detail-image"
            className="aspect-square size-full object-cover"
          />
          <Badge
            variant={statusVariant[pet.status]}
            data-testid="pet-detail-status"
            className="absolute right-4 top-4 shadow"
          >
            {statusLabel[pet.status]}
          </Badge>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent" data-testid="pet-detail-species">
                {speciesEmoji[pet.species]} {speciesLabel[pet.species]}
              </Badge>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                <MapPin className="size-4" /> {pet.location}
              </span>
            </div>
            <h1
              className="text-4xl font-extrabold tracking-tight"
              data-testid="pet-detail-name"
            >
              {pet.name}
            </h1>
            <p className="text-lg font-semibold text-muted-foreground">
              {pet.breed} · {formatAge(pet.ageYears)} ·{' '}
              {pet.gender === 'male' ? 'Male' : 'Female'} · {pet.size}
            </p>
          </div>

          <p className="text-base leading-relaxed text-foreground/90">
            {pet.description}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                Personality
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {pet.traits.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                Good with
              </h2>
              <ul className="space-y-1">
                {pet.goodWith.map((g) => (
                  <li key={g} className="flex items-center gap-2 text-sm font-semibold">
                    <Check className="size-4 text-primary" /> {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="flex-1"
              disabled={!adoptable}
              data-testid="adopt-button"
            >
              <Link to={`/pets/${pet.id}/adopt`}>
                <Heart className="size-4" /> Adopt {pet.name}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="flex-1"
              data-testid="request-info-button"
            >
              <Link to={`/pets/${pet.id}/adopt?type=more-info`}>
                <Info className="size-4" /> Request more info
              </Link>
            </Button>
          </div>
          {!adoptable && (
            <p className="text-sm font-semibold text-muted-foreground">
              {pet.name} is {statusLabel[pet.status].toLowerCase()}, but you can
              still request more information.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
