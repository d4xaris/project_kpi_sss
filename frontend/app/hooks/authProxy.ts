export type AuthStrategy = 'jwt' | 'apiKey' | 'none';

interface ProxyConfig {
  strategy:        AuthStrategy;
  apiKey?:         string;
  rateLimitRpm?:   number;
  enableLogging?:  boolean;
  onTokenExpired?: () => void;
}

// simple token-bucket, refills one token per interval up to capacity
class TokenBucket {
  private tokens: number;
  private readonly cap: number;

  constructor(rpm: number) {
    this.cap    = rpm;
    this.tokens = rpm;
    setInterval(() => { this.tokens = Math.min(this.cap, this.tokens + 1); }, 60_000 / rpm);
  }

  consume(): boolean {
    if (this.tokens <= 0) return false;
    this.tokens--;
    return true;
  }
}

export interface RequestLogEntry {
  timestamp:  string;
  method:     string;
  url:        string;
  status:     number | 'error';
  durationMs: number;
}

const log: RequestLogEntry[] = [];
export const getRequestLog = (): Readonly<RequestLogEntry[]> => log;

let cfg: ProxyConfig = { strategy: 'jwt', rateLimitRpm: 60, enableLogging: true };
let bucket = new TokenBucket(cfg.rateLimitRpm!);

export function configureProxy(next: Partial<ProxyConfig>): void {
  cfg = { ...cfg, ...next };
  if (next.rateLimitRpm) bucket = new TokenBucket(next.rateLimitRpm);
}

// temporarily switch strategy, returns a restore function
export function withStrategy(strategy: AuthStrategy, apiKey?: string) {
  const prev = { strategy: cfg.strategy, apiKey: cfg.apiKey };
  configureProxy({ strategy, apiKey });
  return () => configureProxy(prev);
}

function buildHeaders(init?: HeadersInit): Headers {
  const h = new Headers(init);
  if (!h.has('Content-Type')) h.set('Content-Type', 'application/json');

  if (cfg.strategy === 'jwt') {
    const token = localStorage.getItem('token');
    if (token) h.set('Authorization', `Bearer ${token}`);
  } else if (cfg.strategy === 'apiKey' && cfg.apiKey) {
    h.set('X-Api-Key', cfg.apiKey);
  }

  return h;
}

let refreshing = false;
let queue: Array<(t: string | null) => void> = [];

async function refreshToken(): Promise<string | null> {
  if (refreshing) return new Promise(r => queue.push(r));

  refreshing = true;
  try {
    const res = await fetch('/auth/refresh', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token: localStorage.getItem('token') }),
    });
    if (!res.ok) throw new Error();
    const { token } = await res.json() as { token: string };
    localStorage.setItem('token', token);
    queue.forEach(r => r(token));
    return token;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    queue.forEach(r => r(null));
    cfg.onTokenExpired?.();
    return null;
  } finally {
    refreshing = false;
    queue = [];
  }
}

export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  if (!bucket.consume()) {
    throw new Error(`Rate limit exceeded (max ${cfg.rateLimitRpm} req/min)`);
  }

  const start  = Date.now();
  const method = (init.method ?? 'GET').toUpperCase();
  const send   = () => fetch(url, { ...init, headers: buildHeaders(init.headers) });

  let res: Response;
  try {
    res = await send();
    if (res.status === 401 && cfg.strategy === 'jwt') {
      const fresh = await refreshToken();
      if (fresh) res = await send();
    }
  } catch (err) {
    log.push({ timestamp: new Date().toISOString(), method, url, status: 'error', durationMs: Date.now() - start });
    throw err;
  }

  if (cfg.enableLogging) {
    const entry = { timestamp: new Date().toISOString(), method, url, status: res.status, durationMs: Date.now() - start };
    log.push(entry);
    console.log(`%c${res.ok ? '✓' : '✗'} ${method} ${url} → ${res.status} (${entry.durationMs}ms)`,
      `color:${res.ok ? '#4caf50' : '#f44336'}`);
  }

  return res;
}
