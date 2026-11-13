import { randomUUID } from 'node:crypto';
import type { Booking } from '../api/BookingClient';

/** Builds a valid booking with a unique name so parallel workers never collide. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const suffix = randomUUID().slice(0, 8);
  return {
    firstname: `Quy${suffix}`,
    lastname: 'Tester',
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2027-01-10', checkout: '2027-01-15' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
