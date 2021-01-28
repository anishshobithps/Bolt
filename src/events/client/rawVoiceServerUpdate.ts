import { Listener, ListenerOptions } from 'discord-akairo';
import { ApplyOptions } from '../../lib/util/ApplyOptions';
import { GatewayDispatchEvents } from 'discord-api-types/v6';

import type { VoiceServerUpdate } from '@skyra/audio';

@ApplyOptions<ListenerOptions>('rawVoiceServerUpdate', {
  event: GatewayDispatchEvents.VoiceServerUpdate,
  category: 'Client',
  emitter: 'ws',
})
export default class extends Listener {
  public async exec(data: VoiceServerUpdate) {
    try {
      await this.client.music.voiceServerUpdate(data);
    } catch (error) {
      this.client.emit('error', error);
    }
  }
}
