type JwtPayload = Record<string, unknown>;
let tokenCounter = 0;

function toBase64Url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function parseExpiresIn(expiresIn: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return 900;

  const value = Number(match[1]);
  const unit = match[2];

  const unitToSeconds: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return value * (unitToSeconds[unit] ?? 60);
}

export class SignJWT {
  private payload: JwtPayload;
  private expiresIn = '15m';

  constructor(payload: JwtPayload) {
    this.payload = payload;
  }

  setProtectedHeader(_header: Record<string, unknown>): this {
    return this;
  }

  setExpirationTime(expiresIn: string): this {
    this.expiresIn = expiresIn;
    return this;
  }

  async sign(_secret: Uint8Array): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + parseExpiresIn(this.expiresIn);
    tokenCounter += 1;

    const finalPayload = {
      ...this.payload,
      iat: now,
      exp,
      jti: `mock-${now}-${tokenCounter}`,
    };

    return [
      toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' })),
      toBase64Url(JSON.stringify(finalPayload)),
      `mock-signature-${tokenCounter}`,
    ].join('.');
  }
}

export async function jwtVerify(token: string, _secret: Uint8Array): Promise<{ payload: JwtPayload }> {
  return { payload: decodeJwt(token) };
}

export function decodeJwt(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length < 2) {
    throw new Error('Token inválido');
  }

  try {
    return JSON.parse(fromBase64Url(parts[1])) as JwtPayload;
  } catch {
    throw new Error('Token inválido');
  }
}
