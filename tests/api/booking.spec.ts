import { test, expect } from '../../src/fixtures';
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
    expect(await response.json()).toMatchObject(payload);
  });

  test('filters the list by first name', async ({ bookingApi }) => {
    const payload = buildBooking();
    const { bookingid } = await bookingApi.create(payload);

    const response = await bookingApi.list({ firstname: payload.firstname });
    expect(response.status()).toBe(200);
    const ids = ((await response.json()) as { bookingid: number }[]).map((b) => b.bookingid);
    expect(ids).toContain(bookingid);
  });

  test('update requires authentication', async ({ bookingApi }) => {
    const { bookingid } = await bookingApi.create(buildBooking());

    const response = await bookingApi.update(bookingid, buildBooking(), false);
    expect(response.status()).toBe(403);
  });

  test('authenticated update changes the booking', async ({ bookingApi }) => {
    const { bookingid } = await bookingApi.create(buildBooking());
    const changes = buildBooking({ totalprice: 999, additionalneeds: 'Late checkout' });

    const response = await bookingApi.update(bookingid, changes);
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject(changes);
  });

  test('deleted booking can no longer be read', async ({ bookingApi }) => {
    const { bookingid } = await bookingApi.create(buildBooking());

    const deleted = await bookingApi.delete(bookingid);
    // Restful-Booker answers a successful delete with 201.
    expect(deleted.status()).toBe(201);

    const lookup = await bookingApi.get(bookingid);
    expect(lookup.status()).toBe(404);
  });

  test('rejects a malformed payload', async ({ bookingApi }) => {
    const response = await bookingApi.createRaw({ firstname: 'Only a name' });
    expect(response.ok()).toBeFalsy();
  });
});
