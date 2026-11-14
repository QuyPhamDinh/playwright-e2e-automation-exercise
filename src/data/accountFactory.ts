import { randomUUID } from 'node:crypto';
import type { Account } from '../api/AccountClient';

export function buildAccount(): Account {
  const email = `qa-${randomUUID()}@example.com`;

  return {
    name: 'Quy Test',
    email,
    password: 'TestOnly!4829',
    title: 'Mr',
    birth_date: '15',
    birth_month: '6',
    birth_year: '1990',
    firstname: 'Quy',
    lastname: 'Test',
    company: 'QA Practice',
    address1: '123 Test Street',
    address2: 'Unit 2',
    country: 'United States',
    zipcode: '90001',
    state: 'California',
    city: 'Los Angeles',
    mobile_number: '2025550142',
  };
}
