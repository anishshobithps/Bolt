import { Listener, ListenerOptions } from 'discord-akairo';
import { ApplyOptions } from '../../lib/util/ApplyOptions';
import { config } from '../../config';

import type { VoiceState } from 'discord.js';

@ApplyOptions<ListenerOptions>('voiceStateUpdate', {
  event: 'voiceStateUpdate',
  category: 'Client',
  emitter: 'client',
})
export default class extends Listener {
  public async exec(oldState: VoiceState, newState: VoiceState) {
    // const { queue } = newState.guild;
    // if (newState.id === config.lavalink.userID) {
    //   // If both channels were the same, skip
    //   if (oldState.channelID === newState.channelID) return;
    //   if (newState.channel === null) {
    //     const channel = await queue.getTextChannel();
    //     await channel?.send(`Left Voice Channel ${queue.voiceChannel?.name}`);
    //     await queue.setTextChannelID(null);
    //   } else {
    //     const channel = await queue.getTextChannel();
    //     await channel?.send(`Joined Voice Channel ${queue.voiceChannel?.name}`);
    //   }
    // } else if (queue.voiceChannelID) {
    //   if (queue.playing) {
    //     if (queue.voiceChannel?.listeners.length === 0)
    //       await queue.player.pause(true);
    //   } else if (queue.paused) {
    //     if (queue.voiceChannel?.listeners.length)
    //       await queue.player.pause(false);
    //   }
    // }
  }
}
