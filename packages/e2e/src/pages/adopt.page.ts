import { expect, type Locator } from '@playwright/test';
import type { Inquiry } from '@org/contracts';
import { BasePage } from './base.page.js';

/** Fields a test may fill on the inquiry form. `requestType` is a hidden field. */
export type InquiryFormInput = Partial<Omit<Inquiry, 'requestType'>>;

/** Adoption / request-more-info form page (`/pets/:id/adopt`). */
export class AdoptPage extends BasePage {
  readonly root: Locator = this.byTestId('adopt-page');
  readonly heading: Locator = this.byTestId('adopt-heading');
  readonly form: Locator = this.byTestId('inquiry-form');
  readonly fullName: Locator = this.byTestId('inquiry-fullName');
  readonly email: Locator = this.byTestId('inquiry-email');
  readonly phone: Locator = this.byTestId('inquiry-phone');
  readonly household: Locator = this.byTestId('inquiry-household');
  readonly hasOtherPets: Locator = this.byTestId('inquiry-hasOtherPets');
  readonly message: Locator = this.byTestId('inquiry-message');
  readonly submit: Locator = this.byTestId('inquiry-submit');
  readonly success: Locator = this.byTestId('inquiry-success');
  readonly reference: Locator = this.byTestId('inquiry-reference');

  /** Open the form directly; `type='more-info'` switches to the info variant. */
  async open(petId: string, type: 'adopt' | 'more-info' = 'adopt'): Promise<void> {
    await this.goto(type === 'more-info' ? `/pets/${petId}/adopt?type=more-info` : `/pets/${petId}/adopt`);
    await expect(this.form).toBeVisible();
  }

  /** Fill only the provided fields (so validation tests can submit partials). */
  async fill(data: InquiryFormInput): Promise<void> {
    if (data.fullName !== undefined) await this.fullName.fill(data.fullName);
    if (data.email !== undefined) await this.email.fill(data.email);
    if (data.phone !== undefined) await this.phone.fill(data.phone);
    if (data.householdType !== undefined) await this.household.selectOption(data.householdType);
    if (data.hasOtherPets !== undefined) await this.hasOtherPets.setChecked(data.hasOtherPets);
    if (data.message !== undefined) await this.message.fill(data.message);
  }

  async submitForm(): Promise<void> {
    await this.submit.click();
  }

  /** Fill + submit in one step. */
  async complete(data: InquiryFormInput): Promise<void> {
    await this.fill(data);
    await this.submitForm();
  }

  /** Assert the success state and return the booking reference text. */
  async expectSuccess(): Promise<string> {
    await expect(this.success).toBeVisible();
    await expect(this.reference).toBeVisible();
    return (await this.reference.textContent())?.trim() ?? '';
  }

  /** The inline validation error for a field (e.g. 'email' → inquiry-error-email). */
  fieldError(field: keyof Inquiry): Locator {
    return this.byTestId(`inquiry-error-${field}`);
  }
}
