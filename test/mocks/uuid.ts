export function v4(): string {
  const random = Math.random().toString(16).slice(2, 10);
  return `00000000-0000-4000-8000-${random.padEnd(12, '0').slice(0, 12)}`;
}
