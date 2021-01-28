import { Structures } from 'discord.js';

import type { BoltClient } from '../structures/BoltClient';
import type { Queue } from '../Audio/Queue';

export class BoltGuild extends Structures.get('Guild') {
  /**
   * Queue for this guild.
   */
  public get queue(): Queue {
    return (this.client as BoltClient).music.queues!.get(this.id);
  }
}

Structures.extend('Guild', () => BoltGuild);

declare module 'discord.js' {
  export interface Guild {
    readonly queue: Queue;
  }
}
