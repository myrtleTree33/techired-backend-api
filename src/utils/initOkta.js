import OktaJwtVerifier from '@okta/jwt-verifier';

const { OKTA_DOMAIN, OKTA_CLIENT_ID } = process.env;

let oktaJwtVerifier = null;

export function initOkta() {
  oktaJwtVerifier = new OktaJwtVerifier({
    issuer: `${OKTA_DOMAIN}/oauth2/default`,
    clientId: OKTA_CLIENT_ID
  });
}
export async function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  try {
    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      req.token = bearerToken;
      const jwt = await oktaJwtVerifier.verifyAccessToken(bearerToken);
      if (jwt) {
        // store jwt claims object in req.claims
        req.claims = jwt;
      }
      next();
    } else {
      res.sendStatus(403);
    }
  } catch (err) {
    res.sendStatus(403);
  }
}
