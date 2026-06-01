import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  InquirySchema,
  type Inquiry,
  type InquiryResponse,
  type Pet,
  type RequestType,
} from '@org/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={`${id}-error`}
      data-testid={`inquiry-error-${id}`}
      className="text-sm font-semibold text-destructive"
    >
      {message}
    </p>
  );
}

export function InquiryForm({
  pet,
  requestType,
  onSuccess,
}: {
  pet: Pet;
  requestType: RequestType;
  onSuccess: (res: InquiryResponse) => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inquiry>({
    resolver: zodResolver(InquirySchema),
    defaultValues: {
      requestType,
      fullName: '',
      email: '',
      phone: '',
      householdType: 'house',
      hasOtherPets: false,
      message: '',
    },
  });

  async function onSubmit(values: Inquiry) {
    setSubmitError(null);
    try {
      const { submitInquiry } = await import('@/lib/api');
      onSuccess(await submitInquiry(pet.id, values));
    } catch {
      setSubmitError('Something went wrong submitting your request. Please try again.');
    }
  }

  const invalid = (field: keyof Inquiry) => Boolean(errors[field]);

  return (
    <form
      data-testid="inquiry-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      <input type="hidden" {...register('requestType')} />

      <div className="grid gap-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          data-testid="inquiry-fullName"
          aria-invalid={invalid('fullName')}
          aria-describedby="fullName-error"
          placeholder="Jamie Rivera"
          {...register('fullName')}
        />
        <FieldError id="fullName" message={errors.fullName?.message} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            data-testid="inquiry-email"
            aria-invalid={invalid('email')}
            aria-describedby="email-error"
            placeholder="you@example.com"
            {...register('email')}
          />
          <FieldError id="email" message={errors.email?.message} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            type="tel"
            data-testid="inquiry-phone"
            aria-invalid={invalid('phone')}
            aria-describedby="phone-error"
            placeholder="(555) 123-4567"
            {...register('phone')}
          />
          <FieldError id="phone" message={errors.phone?.message} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="householdType">Your home</Label>
        <select
          id="householdType"
          data-testid="inquiry-household"
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
          )}
          {...register('householdType')}
        >
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="other">Other</option>
        </select>
      </div>

      <label className="flex items-center gap-3 text-sm font-semibold">
        <input
          type="checkbox"
          data-testid="inquiry-hasOtherPets"
          className="size-4 rounded border-input accent-[hsl(var(--primary))]"
          {...register('hasOtherPets')}
        />
        I already have other pets at home
      </label>

      <div className="grid gap-2">
        <Label htmlFor="message">
          {requestType === 'adopt'
            ? `Why would you be a great match for ${pet.name}?`
            : `What would you like to know about ${pet.name}?`}
        </Label>
        <Textarea
          id="message"
          data-testid="inquiry-message"
          aria-invalid={invalid('message')}
          aria-describedby="message-error"
          placeholder="Tell us a little about yourself…"
          {...register('message')}
        />
        <FieldError id="message" message={errors.message?.message} />
      </div>

      {submitError && (
        <p
          data-testid="inquiry-submit-error"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive"
        >
          {submitError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        data-testid="inquiry-submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? 'Sending…'
          : requestType === 'adopt'
            ? `Submit adoption request`
            : `Request more info`}
      </Button>
    </form>
  );
}
