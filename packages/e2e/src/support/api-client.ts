import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import {
  PetListSchema,
  PetSchema,
  InquiryResponseSchema,
  type Inquiry,
  type Pet,
  type PetList,
  type InquiryResponse,
  type Species,
} from '@org/contracts';
import type { Logger } from './logger.js';

/**
 * Typed wrapper over Playwright's APIRequestContext for the pet-adoption API.
 *
 * Every method validates the response body against the shared `@org/contracts`
 * zod schemas, so the test layer enforces the same contract the app does — a
 * drift in the API shape fails the test at parse time, not with a vague
 * undefined later. Used directly by API specs and by UI specs that need to set
 * up / assert backend state.
 */
export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly log: Logger
  ) {}

  /** GET /api/pets (optionally filtered by species) → validated Pet[]. */
  async listPets(species?: Species): Promise<PetList> {
    const url = species ? `/api/pets?species=${species}` : '/api/pets';
    this.log.debug(`GET ${url}`);
    const res = await this.request.get(url);
    await expect(res, `GET ${url} should be OK`).toBeOK();
    return PetListSchema.parse(await res.json());
  }

  /** GET /api/pets/:id → validated Pet (caller asserts 404 via getPetResponse). */
  async getPet(id: string): Promise<Pet> {
    this.log.debug(`GET /api/pets/${id}`);
    const res = await this.request.get(`/api/pets/${id}`);
    await expect(res, `GET /api/pets/${id} should be OK`).toBeOK();
    return PetSchema.parse(await res.json());
  }

  /** Raw response variant for negative-path assertions (e.g. 404). */
  getPetResponse(id: string): Promise<APIResponse> {
    this.log.debug(`GET /api/pets/${id} (raw)`);
    return this.request.get(`/api/pets/${id}`);
  }

  /** POST /api/pets/:id/inquiries with a valid body → validated 201 response. */
  async createInquiry(petId: string, payload: Inquiry): Promise<InquiryResponse> {
    this.log.debug(`POST /api/pets/${petId}/inquiries`, { requestType: payload.requestType });
    const res = await this.request.post(`/api/pets/${petId}/inquiries`, { data: payload });
    expect(res.status(), 'inquiry should be created').toBe(201);
    return InquiryResponseSchema.parse(await res.json());
  }

  /** Raw response variant for validation/negative-path assertions. */
  postInquiryResponse(petId: string, payload: unknown): Promise<APIResponse> {
    this.log.debug(`POST /api/pets/${petId}/inquiries (raw)`);
    return this.request.post(`/api/pets/${petId}/inquiries`, { data: payload });
  }

  /** GET /health → raw response (used by the health smoke + setup gate). */
  health(): Promise<APIResponse> {
    return this.request.get('/health');
  }
}
