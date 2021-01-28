import { Queue } from './Queue';

import type { QueueClient } from './QueueClient';

export class QueueStore extends Map<string, Queue> {
  public cached: Map<string, any>;
  public constructor(public readonly client: QueueClient) {
    super();
    this.client = client;
    this.cached = new Map();
  }

  public get(key: string) {
    let queue = super.get(key);
    if (!queue) {
      queue = new Queue(this, key);
      this.set(key, queue);
    }
    return queue;
  }
}
