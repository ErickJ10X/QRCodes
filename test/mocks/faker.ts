const randomInt = (min: number, max: number): number => {
  const low = Number.isFinite(min) ? min : 0;
  const high = Number.isFinite(max) ? max : low + 100;
  return Math.floor(Math.random() * (high - low + 1)) + low;
};

const departments = ['Marketing', 'Sales', 'Engineering', 'Design', 'Support'];

export const faker = {
  internet: {
    email: () =>
      `user_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`,
    url: () => `https://example.com/${Math.random().toString(36).slice(2, 10)}`,
    ipv4: () => '127.0.0.1',
    userAgent: () => 'jest-test-agent',
  },
  person: {
    firstName: () => 'Test',
    lastName: () => 'User',
  },
  commerce: {
    productName: () => `Product ${Math.random().toString(36).slice(2, 7)}`,
    productDescription: () => 'Product description for test suite',
    department: () => departments[randomInt(0, departments.length - 1)],
  },
  number: {
    int: ({ min = 0, max = 9999 }: { min?: number; max?: number } = {}) =>
      randomInt(min, max),
  },
};
