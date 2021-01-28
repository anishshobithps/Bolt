import { Listener, ListenerOptions } from 'discord-akairo';
import { ConnectionEvents } from '@skyra/audio';
import { ApplyOptions } from '../../lib/util/ApplyOptions';
import { magenta } from 'colorette';

@ApplyOptions<ListenerOptions>('rawLavalinkOpen', {
  event: ConnectionEvents.Open,
  category: 'Lavalink',
  emitter: 'lavalink',
})
export default class ReadyListener extends Listener {
  public exec() {
    console.log(`${magenta('[LAVALINK]')} Connected.`);
  }
}
