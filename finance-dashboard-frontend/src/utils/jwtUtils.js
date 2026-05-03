export function decodeJwt(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(
      atob(base64)
        .split('')
        .map((ch) => `%${('00' + ch.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
