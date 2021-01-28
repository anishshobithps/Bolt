import { Listener, ListenerOptions } from 'discord-akairo';
import { GatewayDispatchEvents, GatewayVoiceState } from 'discord-api-types/v6';
import { ApplyOptions } from '../../lib/util/ApplyOptions';

@ApplyOptions<ListenerOptions>('rawVoiceStateUpdate', {
  event: GatewayDispatchEvents.VoiceStateUpdate,
  category: 'Client',
  emitter: 'ws',
})
export default class extends Listener {
  public async exec(data: GatewayVoiceState) {
    try {
      await this.client.music.voiceStateUpdate(data);
    } catch (error) {
      this.client.emit('error', error);
    }
  }
}
