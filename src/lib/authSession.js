let currentSession = null;

export function setCurrentAuthSession(session) {
  currentSession = session ?? null;
}

export function getCurrentAuthSession() {
  return currentSession;
}

export function getAccessToken() {
  return currentSession?.access_token ?? null;
}
