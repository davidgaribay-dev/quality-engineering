import {
  useLoaderData,
  useNavigation,
  type LoaderFunctionArgs,
} from 'react-router-dom';
import type { Pet, Species } from '@org/contracts';
import { PetCard } from '@/components/pet-card';
import { SpeciesFilter } from '@/components/species-filter';
import { Skeleton } from '@/components/ui/skeleton';

interface PetsLoaderData {
  pets: Pet[];
  species: Species | 'all';
}

export async function petsLoader({
  request,
}: LoaderFunctionArgs): Promise<PetsLoaderData> {
  const { fetchPets } = await import('@/lib/api');
  const param = new URL(request.url).searchParams.get('species');
  const species: Species | undefined =
    param === 'dog' || param === 'cat' ? param : undefined;
  const pets = await fetchPets(species);
  return { pets, species: species ?? 'all' };
}

function PetGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function PetsPage() {
  const { pets, species } = useLoaderData() as PetsLoaderData;
  const navigation = useNavigation();
  const isFiltering =
    navigation.state === 'loading' &&
    navigation.location?.pathname === '/pets';

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10" data-testid="pets-page">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Meet the pets</h1>
          <p className="mt-1 text-muted-foreground" data-testid="pets-count">
            {pets.length} {pets.length === 1 ? 'friend' : 'friends'} waiting for you
          </p>
        </div>
        <SpeciesFilter value={species} />
      </div>

      {isFiltering ? (
        <PetGridSkeleton />
      ) : pets.length === 0 ? (
        <div
          data-testid="pets-empty"
          className="grid place-items-center rounded-2xl border border-dashed border-border py-20 text-center"
        >
          <p className="text-4xl">🔍</p>
          <p className="mt-2 font-bold">No pets match this filter</p>
          <p className="text-sm text-muted-foreground">Try a different category.</p>
        </div>
      ) : (
        <div
          data-testid="pet-grid"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}
