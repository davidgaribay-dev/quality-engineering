import { z } from 'zod';

/** Whether the visitor wants to adopt or just request more information. */
export const RequestType = z.enum(['adopt', 'more-info']);
export type RequestType = z.infer<typeof RequestType>;

export const HouseholdType = z.enum(['house', 'apartment', 'other']);
export type HouseholdType = z.infer<typeof HouseholdType>;

/**
 * Payload for `POST /api/pets/:id/inquiries`.
 * This same schema validates the React Hook Form on the client AND the request
 * body on the server, so the contract can never drift between the two.
 */
export const InquirySchema = z.object({
  requestType: RequestType,
  fullName: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+()\-\s]{7,}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  householdType: HouseholdType,
  hasOtherPets: z.boolean(),
  message: z.string().max(1000, 'Keep it under 1000 characters').optional(),
});
export type Inquiry = z.infer<typeof InquirySchema>;

/** Response returned by the inquiry endpoint. */
export const InquiryResponseSchema = z.object({
  id: z.string(),
  petId: z.string(),
  petName: z.string(),
  requestType: RequestType,
  status: z.literal('received'),
  submittedAt: z.string(),
});
export type InquiryResponse = z.infer<typeof InquiryResponseSchema>;
