type Mode = 'highest' | 'lowest' | 'oldest' | 'newest';

interface BEntry<T> {
  value:      T;
  priority:   number;
  insertedAt: number; 
}

export class BiDiPriorityQueue<T = unknown> {
  private items: BEntry<T>[] = [];
  private counter = 0;

  get size(): number     { return this.items.length; }
  get isEmpty(): boolean { return this.items.length === 0; }

  enqueue(value: T, priority: number): void {
    this.items.push({ value, priority, insertedAt: this.counter++ });
  }


  peek(mode: Mode): T | undefined {
    if (this.isEmpty) return undefined;
    return this.find(mode).value;
  }

  dequeue(mode: Mode): T | undefined {
    if (this.isEmpty) return undefined;
    const idx = this.findIndex(mode);
    const [entry] = this.items.splice(idx, 1);
    return entry!.value;
  }

  private findIndex(mode: Mode): number {
    let target = 0;
    for (let i = 1; i < this.items.length; i++) {
      const curr = this.items[i]!;
      const best = this.items[target]!;
      switch (mode) {
        case 'highest': if (curr.priority   > best.priority)   target = i; break;
        case 'lowest':  if (curr.priority   < best.priority)   target = i; break;
        case 'oldest':  if (curr.insertedAt < best.insertedAt) target = i; break;
        case 'newest':  if (curr.insertedAt > best.insertedAt) target = i; break;
      }
    }
    return target;
  }

  private find(mode: Mode): BEntry<T> {
    return this.items[this.findIndex(mode)]!;
  }

  toArray(): T[] { return this.items.map(e => e.value); }
  clear():   void { this.items = []; this.counter = 0; }
}
