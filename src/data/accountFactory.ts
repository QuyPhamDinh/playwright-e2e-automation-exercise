import { randomUUID } from 'node:crypto';
import type { Account } from '../api/AccountClient';

export function buildAccount(): Account {
  const suffix = randomUUID().replaceAll('-', '').slice(0, 12);
  const name = `Quy ${suffix}`;

  return {
    name,
    email: `quy.${suffix}@example.com`,
    password: `Pw-${suffix}-Automation`,
    title: 'Mr',
    birth_date: '10',
    birth_month: '1',
    birth_year: '1990',
    firstname: 'Quy',
    lastname: suffix,
    company: 'Automation Exercise',
    address1: '1 Test Street',
    address2: '',
    country: 'United States',
    zipcode: '90012',
    state: 'California',
    city: 'Los Angeles',
    mobile_number: `555${suffix.slice(0, 9)}`,
  };
}
