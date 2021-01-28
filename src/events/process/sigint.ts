import { Listener, ListenerOptions } from 'discord-akairo';
import { ApplyOptions } from '../../lib/util/ApplyOptions';

import type { BoltClient } from '../../lib/structures/BoltClient';

@ApplyOptions<ListenerOptions>('sigint', {
  event: 'SIGINT',
  category: 'Process',
  emitter: 'process',
})
export default class extends Listener {
  public async exec() {
    await (this.client as BoltClient).stop();
  }
}
