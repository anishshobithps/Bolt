import { Listener, ListenerOptions } from 'discord-akairo';
import { ApplyOptions } from '../../lib/util/ApplyOptions';
import { magenta } from 'colorette';

import type { IncomingEventTrackExceptionPayload } from '@skyra/audio';

@ApplyOptions<ListenerOptions>('rawTrackExceptionEvent', {
  event: 'TrackExceptionEvent',
  category: 'Lavalink',
  emitter: 'client',
})
export default class extends Listener {
  public async exec(payload: IncomingEventTrackExceptionPayload) {
    // Emit an error message if there is an error message to emit
    // The if case is because exceptions without error messages are pretty useless
    if (payload.exception) {
      console.error([
        `${magenta('[LAVALINK]')} Exception (${payload.guildId})`,
        `           Track: ${payload.track}`,
        `           Error: ${payload.exception.message} [${payload.exception.severity}]`,
      ]);
    }

    const queue = this.client.music.queues!.get(payload.guildId);
    await queue.next();
  }
}
