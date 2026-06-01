import { Link } from 'react-router-dom';
import type { Pet } from '@org/contracts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAge, speciesEmoji, statusLabel, statusVariant } from '@/lib/format';

export function PetCard({ pet }: { pet: Pet }) {
  return (
    <Link
      to={`/pets/${pet.id}`}
      data-testid="pet-card"
      data-pet-id={pet.id}
      data-species={pet.species}
      className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`View ${pet.name}`}
    >
      <Card className="h-full overflow-hidden transition-all group-hover:-translate-y-1 group-hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={pet.imageUrl}
            alt={pet.name}
            loading="lazy"
            data-testid="pet-card-image"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge
            variant="default"
            data-testid="pet-card-species"
            className="absolute left-3 top-3 shadow-sm"
          >
            {speciesEmoji[pet.species]} {pet.species === 'dog' ? 'Dog' : 'Cat'}
          </Badge>
          {pet.status !== 'available' && (
            <Badge
              variant={statusVariant[pet.status]}
              className="absolute right-3 top-3 shadow-sm"
            >
              {statusLabel[pet.status]}
            </Badge>
          )}
        </div>
        <CardHeader className="gap-1 pb-2">
          <CardTitle data-testid="pet-card-name">{pet.name}</CardTitle>
          <p className="text-sm font-semibold text-muted-foreground">
            {pet.breed} · {formatAge(pet.ageYears)}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">{pet.tagline}</p>
          <div className="flex flex-wrap gap-1.5">
            {pet.traits.slice(0, 3).map((trait) => (
              <Badge key={trait} variant="secondary">
                {trait}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
