import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';

// A type alias (not an interface) so it works with toMatchObject's Record<string, unknown> signature.
export type Booking = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
};

export interface CreatedBooking {
  bookingid: number;
  booking: Booking;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isBooking(value: unknown): value is Booking {
  if (!isRecord(value) || !isRecord(value.bookingdates)) {
    return false;
  }

  return (
    typeof value.firstname === 'string' &&
    typeof value.lastname === 'string' &&
    typeof value.totalprice === 'number' &&
    typeof value.depositpaid === 'boolean' &&
    typeof value.bookingdates.checkin === 'string' &&
    typeof value.bookingdates.checkout === 'string' &&
    (value.additionalneeds === undefined || typeof value.additionalneeds === 'string')
  );
}

export function isCreatedBooking(value: unknown): value is CreatedBooking {
  return (
    isRecord(value) &&
    typeof value.bookingid === 'number' &&
    Number.isInteger(value.bookingid) &&
    value.bookingid > 0 &&
    isBooking(value.booking)
  );
}

export function isBookingSummary(value: unknown): value is { bookingid: number } {
  return (
    isRecord(value) &&
    typeof value.bookingid === 'number' &&
    Number.isInteger(value.bookingid) &&
    value.bookingid > 0
  );
}

/**
 * Thin typed wrapper over the Restful-Booker API.
 * Tracks every booking it creates so the fixture can clean up after each test.
 */
export class BookingClient {
  private readonly createdIds: number[] = [];

  constructor(
    private readonly request: APIRequestContext,
    private readonly token: string,
  ) {}

  /** Creates a booking, asserts success, and registers it for cleanup. */
  async create(booking: Booking): Promise<CreatedBooking> {
    const response = await this.request.post('/booking', { data: booking });
    expect(response.status(), 'create booking should return 200').toBe(200);
    const body: unknown = await response.json();
    expect(isCreatedBooking(body), 'create response should match the booking schema').toBe(true);
    if (!isCreatedBooking(body)) {
      throw new Error('Create booking response did not match the booking schema');
    }
    const created = body;
    this.createdIds.push(created.bookingid);
    return created;
  }

  /** Raw create for negative tests that need to inspect the response. */
  createRaw(data: unknown): Promise<APIResponse> {
    return this.request.post('/booking', { data: data as object });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  list(filter: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.get('/booking', { params: filter });
  }

  update(id: number, booking: Booking, authenticated = true, token = this.token): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: authenticated ? { Cookie: `token=${token}` } : {},
    });
  }

  delete(id: number, authenticated = true, token = this.token): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, {
      headers: authenticated ? { Cookie: `token=${token}` } : {},
    });
  }

  /** Best-effort teardown: removes anything this test created. */
  async cleanup(): Promise<void> {
    for (const id of this.createdIds) {
      await this.delete(id).catch(() => undefined);
    }
    this.createdIds.length = 0;
  }
}
