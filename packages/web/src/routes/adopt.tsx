import { useState } from 'react';
import { Link, useLoaderData, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { InquiryResponse, Pet, RequestType } from '@org/contracts';
import { InquiryForm } from '@/components/inquiry-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Reuses the pet detail loader (exported from pet-detail.tsx) via the router config.

export function AdoptPage() {
  const pet = useLoaderData() as Pet;
  const [searchParams] = useSearchParams();
  const requestType: RequestType =
    searchParams.get('type') === 'more-info' ? 'more-info' : 'adopt';
  const [result, setResult] = useState<InquiryResponse | null>(null);

  const heading =
    requestType === 'adopt'
      ? `Adopt ${pet.name}`
      : `Ask about ${pet.name}`;
  const subtitle =
    requestType === 'adopt'
      ? `Start ${pet.name}'s adoption journey — tell us a bit about you and we'll be in touch.`
      : `Have questions about ${pet.name}? Send them over and our team will follow up.`;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8" data-testid="adopt-page">
      <Link
        to={`/pets/${pet.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground"
        data-testid="back-to-pet"
      >
        <ArrowLeft className="size-4" /> Back to {pet.name}
      </Link>

      {result ? (
        <Card data-testid="inquiry-success" className="text-center">
          <CardContent className="space-y-4 py-12">
            <CheckCircle2 className="mx-auto size-14 text-primary" />
            <h1 className="text-2xl font-extrabold">Request received! 🎉</h1>
            <p className="mx-auto max-w-md text-muted-foreground">
              Thanks for your interest in{' '}
              <span className="font-bold text-foreground">{result.petName}</span>.
              {result.requestType === 'adopt'
                ? ' Our adoption team will email you the next steps shortly.'
                : ' We’ll get back to you with more information soon.'}
            </p>
            <p className="text-xs font-semibold text-muted-foreground">
              Reference: <span data-testid="inquiry-reference">{result.id}</span>
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button asChild variant="outline">
                <Link to="/pets">Browse more pets</Link>
              </Button>
              <Button asChild>
                <Link to={`/pets/${pet.id}`}>Back to {pet.name}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="size-16 rounded-xl object-cover"
              />
              <div>
                <CardTitle data-testid="adopt-heading">{heading}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <InquiryForm
              pet={pet}
              requestType={requestType}
              onSuccess={setResult}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
