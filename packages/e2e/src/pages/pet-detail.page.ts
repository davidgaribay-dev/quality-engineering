import { expect, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

/** Pet detail page (`/pets/:id`) — profile + adopt / request-info CTAs. */
export class PetDetailPage extends BasePage {
  readonly root: Locator = this.byTestId('pet-detail');
  readonly name: Locator = this.byTestId('pet-detail-name');
  readonly species: Locator = this.byTestId('pet-detail-species');
  readonly status: Locator = this.byTestId('pet-detail-status');
  readonly image: Locator = this.byTestId('pet-detail-image');
  readonly adoptButton: Locator = this.byTestId('adopt-button');
  readonly requestInfoButton: Locator = this.byTestId('request-info-button');
  readonly backToPets: Locator = this.byTestId('back-to-pets');

  async open(petId: string): Promise<void> {
    await this.goto(`/pets/${petId}`);
    await this.expectLoaded(petId);
  }

  /** Assert the detail page is for the expected pet (via data-pet-id). */
  async expectLoaded(petId: string): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.root).toHaveAttribute('data-pet-id', petId);
  }

  async startAdoption(): Promise<void> {
    await this.adoptButton.click();
  }

  async requestMoreInfo(): Promise<void> {
    await this.requestInfoButton.click();
  }
}
