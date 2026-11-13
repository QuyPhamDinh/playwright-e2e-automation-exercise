/** Public demo accounts published on the Sauce Demo login page. */
export const users = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
} as const;

export const customer = {
  firstName: 'Quy',
  lastName: 'Pham',
  postalCode: '90012',
} as const;
