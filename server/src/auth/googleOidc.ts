import * as oidc from "openid-client";

export const googleIssuer = "https://accounts.google.com";
const clockSkewSeconds = 30;
const maxTokenAgeSeconds = 5 * 60;

export type GoogleProof = {
  state: string;
  nonce: string;
  verifier: string;
};

export function createGoogleOidc(
  credentials: { id: string; secret: string },
  redirectUri: string,
) {
  let configuration: Promise<oidc.Configuration> | undefined;
  function getConfiguration() {
    configuration ??= oidc.discovery(new URL(googleIssuer), credentials.id, {
      client_secret: credentials.secret,
      id_token_signed_response_alg: "RS256",
      [oidc.clockTolerance]: clockSkewSeconds,
    }, oidc.ClientSecretPost(), {
      timeout: 5,
      execute: [oidc.enableNonRepudiationChecks],
    }).then((config) => {
      if (!config.serverMetadata().supportsPKCE("S256")) {
        throw new Error("Google discovery did not advertise S256");
      }
      return config;
    }).catch((error: unknown) => {
      configuration = undefined;
      throw error;
    });
    return configuration;
  }

  return {
    async authorize(proof: GoogleProof) {
      return oidc.buildAuthorizationUrl(await getConfiguration(), {
        redirect_uri: redirectUri,
        response_type: "code",
        response_mode: "form_post",
        scope: "openid email",
        prompt: "select_account",
        code_challenge_method: "S256",
        code_challenge: await oidc.calculatePKCECodeChallenge(proof.verifier),
        state: proof.state,
        nonce: proof.nonce,
      }).href;
    },
    async exchange(callback: Request, proof: GoogleProof) {
      const tokens = await oidc.authorizationCodeGrant(await getConfiguration(), callback, {
        pkceCodeVerifier: proof.verifier,
        expectedState: proof.state,
        expectedNonce: proof.nonce,
      });
      const claims = tokens.claims();
      const now = Math.floor(Date.now() / 1000);
      if (!claims || claims.iss !== googleIssuer || !claims.sub || claims.sub.length > 255 ||
          (claims.azp !== undefined && claims.azp !== credentials.id) ||
          !Number.isInteger(claims.iat) || claims.iat > now + clockSkewSeconds ||
          claims.iat < now - maxTokenAgeSeconds - clockSkewSeconds) {
        throw new Error("Google ID token claims were rejected");
      }
      return claims;
    },
  };
}
