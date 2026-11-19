import {createClerkClient} from '@clerk/backend';
import {allowedOrigins, founderIdentity} from './access.mjs';
import {HttpError} from './http.mjs';
let clerk;
export async function requireFounder(req) {
  if (!/^Bearer \S+$/.test(req.headers.authorization || '')) throw new HttpError(401, 'Sign in to continue.');
  const origins = allowedOrigins();
  const origin = req.headers.origin;
  if (origin && !origins.includes(origin)) throw new HttpError(403, 'This origin is not allowed.');
  if (req.method !== 'GET' && !origins.includes(origin)) throw new HttpError(403, 'Publish from the OSIRIS app.');
  clerk ||= createClerkClient({secretKey: process.env.CLERK_SECRET_KEY, publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY});
  const request = new Request('https://www.osirisdeck.com' + req.url, {headers: {authorization: req.headers.authorization}});
  const result = await clerk.authenticateRequest(request, {authorizedParties: origins, acceptsToken: 'session_token'});
  if (!result.isSignedIn) throw new HttpError(401, 'Your session expired. Sign in again.');
  const {userId, sessionId} = result.toAuth();
  const [user, session] = await Promise.all([clerk.users.getUser(userId), clerk.sessions.getSession(sessionId)]);
  const identity = founderIdentity(user);
  if (!identity || session.status !== 'active' || session.userId !== userId) throw new HttpError(403, 'This account does not have access to OSIRIS.');
  return identity;
}
