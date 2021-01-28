import { Listener, ListenerOptions } from 'discord-akairo';
import { ConnectionEvents, IncomingEventPayload } from '@skyra/audio';
import { ApplyOptions } from '../../lib/util/ApplyOptions';

@ApplyOptions<ListenerOptions>('rawLavalinkEvent', {
  event: ConnectionEvents.Event,
  category: 'Lavalink',
  emitter: 'lavalink',
})
export default class extends Listener {
  public exec(playload: IncomingEventPayload) {
    this.client.emit(playload.type, playload);
  }
}
