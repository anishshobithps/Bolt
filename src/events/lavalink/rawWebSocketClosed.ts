import { Listener, ListenerOptions } from 'discord-akairo';
import { VoiceCloseCodes } from 'discord-api-types/v6';
import { ApplyOptions } from '../../lib/util/ApplyOptions';
import { bgMagenta } from 'colorette';

import type { IncomingEventWebSocketClosedPayload } from '@skyra/audio';

@ApplyOptions<ListenerOptions>('rawWebSocketClosedEvent', {
  event: 'WebSocketClosedEvent',
  category: 'Lavalink',
  emitter: 'client',
})
export default class extends Listener {
  public exec(payload: IncomingEventWebSocketClosedPayload) {
    if (payload.code < 4000) return;

    // Ignore normal disconnection:
    if (payload.code === VoiceCloseCodes.Disconnected) return;

    console.error([
      `${bgMagenta('[LAVALINK]')} Websocket Close (${payload.guildId})`,
      `           Code  : ${payload.code}`,
      `           Reason: ${payload.reason}`,
    ]);
  }
}
