import { Listener, ListenerOptions } from 'discord-akairo';
import { ConnectionEvents } from '@skyra/audio';
import { ApplyOptions } from '../../lib/util/ApplyOptions';
import { magenta } from 'colorette';

@ApplyOptions<ListenerOptions>('rawLavalinkclose', {
  event: ConnectionEvents.Close,
  category: 'Lavalink',
  emitter: 'lavalink',
})
export default class extends Listener {
  public exec(code: number, reason: string) {
    if (code >= 4000) {
      console.error([
        `${magenta(
          '[LAVALINK]'
        )} Websocket Close\n           Code  : ${code}\n           Reason: ${reason}`,
      ]);
    }
  }
}
