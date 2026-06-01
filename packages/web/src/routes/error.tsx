import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function RouteError() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div
      data-testid="route-error"
      className="mx-auto grid min-h-[60vh] w-full max-w-md place-items-center px-4 text-center"
    >
      <div className="space-y-4">
        <p className="text-6xl">{is404 ? '🐾' : '😿'}</p>
        <h1 className="text-2xl font-extrabold">
          {is404 ? 'We couldn’t find that pet' : 'Something went wrong'}
        </h1>
        <p className="text-muted-foreground">
          {is404
            ? 'This pet may have already found a loving home.'
            : 'Please try again in a moment.'}
        </p>
        <Button asChild>
          <Link to="/pets">Browse all pets</Link>
        </Button>
      </div>
    </div>
  );
}
