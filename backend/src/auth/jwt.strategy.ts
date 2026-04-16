import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

type JwtPayload = {
  sub: string;
  email?: string;
  role?: string;
  tenantId?: string | null;
  tenant_id?: string | null;
  realm_access?: { roles?: string[] };
  iss?: string;
};

type SecretDone = (error: Error | null, secret?: string | Buffer) => void;

const keycloakBaseUrl =
  process.env.KEYCLOAK_URL?.replace(/\/$/, '') || 'http://localhost:8180';
const keycloakRealm = process.env.KEYCLOAK_REALM || 'autonomo-pro';

const keycloakSecretProvider = passportJwtSecret({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: `${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`,
}) as unknown as (
  request: unknown,
  rawJwtToken: string,
  done: SecretDone,
) => void;

function parseJwtPayload(rawJwtToken: string): JwtPayload | null {
  const parts = rawJwtToken.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    return JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8'),
    ) as JwtPayload;
  } catch {
    return null;
  }
}

function isKeycloakToken(rawJwtToken: string): boolean {
  const payload = parseJwtPayload(rawJwtToken);
  if (!payload?.iss) {
    return false;
  }

  return payload.iss.startsWith(`${keycloakBaseUrl}/realms/${keycloakRealm}`);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (
        request: unknown,
        rawJwtToken: string,
        done: SecretDone,
      ) => {
        if (isKeycloakToken(rawJwtToken)) {
          keycloakSecretProvider(request, rawJwtToken, done);
          return;
        }

        done(
          null,
          process.env.JWT_SECRET ||
            'autonomo-pro-dev-secret-change-in-production',
        );
      },
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
