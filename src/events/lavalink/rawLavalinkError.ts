import { Listener, ListenerOptions } from 'discord-akairo';
import { ConnectionEvents } from '@skyra/audio';
import { ApplyOptions } from '../../lib/util/ApplyOptions';
import { magenta } from 'colorette';

@ApplyOptions<ListenerOptions>('rawLavalinkError', {
  event: ConnectionEvents.Error,
  category: 'Lavalink',
  emitter: 'lavalink',
})
export default class extends Listener {
  public exec(error: Error) {
    console.error(`${magenta('[LAVALINK]')} ${error.stack}`);
  }
}
