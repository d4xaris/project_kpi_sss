class QNode<T> { constructor(public value: T, public next: QNode<T> | null = null) {} }

class Queue<T> {
  private head: QNode<T> | null = null;
  private tail: QNode<T> | null = null;
  size = 0;

  enqueue(v: T): void {
    const n = new QNode(v);
    this.tail ? (this.tail.next = n) : (this.head = n);
    this.tail = n;
    this.size++;
  }

  dequeue(): T | undefined {
    if (!this.head) return undefined;
    const v = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.size--;
    return v;
  }

  peek(): T | undefined { return this.head?.value; }
}

interface Entry<T> {
  value:      T;
  lastUsed:   number;
  useCount:   number;
  expiresAt?: number;
}

export type EvictionPolicy = 'lru' | 'lfu' | 'ttl' | 'custom';

export interface MemoOptions<T> {
  maxSize?:     number;
  policy?:      EvictionPolicy;
  ttlMs?:       number;
  customEvict?: (cache: ReadonlyMap<string, Entry<T>>) => string;
}

export function memoize<A extends unknown[], R>(
  fn:   (...args: A) => R,
  opts: MemoOptions<R> = {},
): (...args: A) => R {
  const { maxSize, policy = 'lru', ttlMs, customEvict } = opts;
  const cache    = new Map<string, Entry<R>>();
  const ttlQueue = new Queue<string>();

  const key = (args: A) => JSON.stringify(args);

  const evict = () => {
    if (!maxSize || cache.size < maxSize) return;
    let victim: string | undefined;
    if (policy === 'lru') {
      let min = Infinity;
      for (const [k, e] of cache) if (e.lastUsed < min) { min = e.lastUsed; victim = k; }
    } else if (policy === 'lfu') {
      let min = Infinity;
      for (const [k, e] of cache) if (e.useCount < min) { min = e.useCount; victim = k; }
    } else if (policy === 'ttl') {
      victim = ttlQueue.dequeue();
    } else {
      if (!customEvict) throw new Error('customEvict required');
      victim = customEvict(cache);
    }
    if (victim) cache.delete(victim);
  };

  const pruneExpired = () => {
    if (policy !== 'ttl') return;
    const now = Date.now();
    while (ttlQueue.peek()) {
      const k = ttlQueue.peek()!;
      const e = cache.get(k);
      if (e && e.expiresAt !== undefined && e.expiresAt <= now) {
        cache.delete(k);
        ttlQueue.dequeue();
      } else break;
    }
  };

  return (...args: A): R => {
    pruneExpired();
    const k = key(args);
    if (cache.has(k)) {
      const e = cache.get(k)!;
      e.lastUsed = Date.now();
      e.useCount++;
      return e.value;
    }
    evict();
    const value = fn(...args);
    cache.set(k, {
      value,
      lastUsed:  Date.now(),
      useCount:  1,
      expiresAt: policy === 'ttl' && ttlMs ? Date.now() + ttlMs : undefined,
    });
    if (policy === 'ttl') ttlQueue.enqueue(k);
    return value;
  };
}
