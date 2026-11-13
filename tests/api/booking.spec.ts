import { test, expect } from '../../src/fixtures';
import { isBooking, isBookingSummary, isCreatedBooking } from '../../src/api/BookingClient';
import { buildBooking } from '../../src/data/bookingFactory';

test.describe('Booking API', () => {
  test('creates a booking and echoes the payload', { tag: '@smoke' }, async ({ bookingApi }) => {
    const payload = buildBooking();
    const created = await bookingApi.create(payload);

    expect(created.bookingid).toBeGreaterThan(0);
    expect(created.booking).toMatchObject(payload);
  });

  test('reads back what was created', async ({ bookingApi }) => {
    const payload = buildBooking({ totalprice: 321 });
    const { bookingid } = await bookingApi.create(payload);

    const response = await bookingApi.get(bookingid);
    expect(response.status()).toBe(200);
    const body: unknown = await response.json();
    expect(isBooking(body), 'booking response should match the booking schema').toBe(true);
    expect(body).toMatchObject(payload);
  });

  test('filters the list by first name', async ({ bookingApi }) => {
    const payload = buildBooking();
    const { bookingid } = await bookingApi.create(payload);

    const response = await bookingApi.list({ firstname: payload.firstname });
    expect(response.status()).toBe(200);
    const body: unknown = await response.json();
    expect(Array.isArray(body), 'booking list response should be an array').toBe(true);
    if (!Array.isArray(body)) {
      throw new Error('Booking list response was not an array');
    }
    const ids = body.filter(isBookingSummary).map((booking) => booking.bookingid);
    expect(ids).toContain(bookingid);
  });

  test('update requires authentication', async ({ bookingApi }) => {
    const { bookingid } = await bookingApi.create(buildBooking());

    const response = await bookingApi.update(bookingid, buildBooking(), false);
    expect(response.status()).toBe(403);
    expect(await response.text()).toBe('Forbidden');
  });

  test('rejects an invalid token for updates', async ({ bookingApi }) => {
    const { bookingid } = await bookingApi.create(buildBooking());

    const response = await bookingApi.update(bookingid, buildBooking(), true, 'invalid-token');
    expect(response.status()).toBe(403);
    expect(await response.text()).toBe('Forbidden');
  });

  test('authenticated update changes the booking', async ({ bookingApi }) => {
    const { bookingid } = await bookingApi.create(buildBooking());
    const changes = buildBooking({ totalprice: 999, additionalneeds: 'Late checkout' });

    const response = await bookingApi.update(bookingid, changes);
    expect(response.status()).toBe(200);
    const body: unknown = await response.json();
    expect(isBooking(body), 'updated booking response should match the booking schema').toBe(true);
    expect(body).toMatchObject(changes);
  });

  test('deleted booking can no longer be read', async ({ bookingApi }) => {
    const { bookingid } = await bookingApi.create(buildBooking());

    const deleted = await bookingApi.delete(bookingid);
    // Restful-Booker answers a successful delete with 201.
    expect(deleted.status()).toBe(201);

    const lookup = await bookingApi.get(bookingid);
    expect(lookup.status()).toBe(404);
  });

  test('rejects an invalid token for deletes', async ({ bookingApi }) => {
    const { bookingid } = await bookingApi.create(buildBooking());

    const response = await bookingApi.delete(bookingid, true, 'invalid-token');
    expect(response.status()).toBe(403);
    expect(await response.text()).toBe('Forbidden');
  });

  test('accepts a zero-price, same-day booking', async ({ bookingApi }) => {
    const payload = buildBooking({
      totalprice: 0,
      bookingdates: { checkin: '2027-01-01', checkout: '2027-01-01' },
    });

    const created = await bookingApi.create(payload);
    expect(isCreatedBooking(created)).toBe(true);
    expect(created.booking).toMatchObject(payload);
  });

  test('returns the demo service error for a malformed payload', async ({ bookingApi }) => {
    const response = await bookingApi.createRaw({ firstname: 'Only a name' });
    // The demo currently exposes a server error instead of a desirable 400 error object.
    expect(response.status()).toBe(500);
    expect(await response.text()).toBe('Internal Server Error');
  });
});
