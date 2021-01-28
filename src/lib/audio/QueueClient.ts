import { ConnectionEvents, Node, NodeOptions, NodeSend } from '@skyra/audio';
import { QueueStore } from './QueueStore';

import type { Queue } from './Queue';

interface Info {
  previous: string;
  remaining: number;
}

export class QueueClient extends Node {
  public readonly queues?: QueueStore;
  public advanceBy: (queue: Queue, info: Info) => number;

  public constructor(options: Options, send: NodeSend) {
    super(options, send);
    this.queues = new QueueStore(this);
    this.advanceBy = options.advanceBy ?? (() => 1);
    this.on(ConnectionEvents.Event, (d) => {
      this.queues!.get(d.guildId).emit(ConnectionEvents.Event, d);
    });
    this.on(ConnectionEvents.PlayerUpdate, (d) => {
      this.queues!.get(d.guildId).emit(ConnectionEvents.PlayerUpdate, d);
    });
  }
}

interface Options extends NodeOptions {
  advanceBy?: (queue: Queue, info: Info) => number;
}
