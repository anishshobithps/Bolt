import { Listener, ListenerOptions } from 'discord-akairo';
import { ApplyOptions } from '../../lib/util/ApplyOptions';
import { green } from 'colorette';

@ApplyOptions<ListenerOptions>('ready', {
  event: 'ready',
  category: 'Client',
  emitter: 'client',
})
export default class extends Listener {
  public async exec() {
    console.log(`${green('[CLIENT]')} Ready ${this.client.user!.tag}`);
    await this.client.user?.setPresence({
      activity: { name: `${this.client.config.prefix}help`, type: 'LISTENING' },
      status: 'online',
    });
    await this.client.music.connect();
  }
}
