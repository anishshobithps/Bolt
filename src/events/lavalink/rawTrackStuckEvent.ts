import { Listener, ListenerOptions } from 'discord-akairo';
import { ApplyOptions } from '../../lib/util/ApplyOptions';
import { EMOJIS } from '../../lib/util/Constants';
import { formatDuration } from '../../lib/util/timeString';

import type { IncomingEventTrackStuckPayload } from '@skyra/audio';

@ApplyOptions<ListenerOptions>('rawTrackStuckEvent', {
  event: 'TrackStuckEvent',
  category: 'Lavalink',
  emitter: 'client',
})
export default class extends Listener {
  public async exec(payload: IncomingEventTrackStuckPayload) {
    // If the threshold is small, send nothing.
    if (payload.thresholdMs < 1000) return;

    // If there is no guild, for some weird reason, skip all other operations.
    const guild = this.client.guilds.cache.get(payload.guildId);
    if (!guild) return;

    // Retrieve the queue from the guild.
    const { queue } = guild;

    // // If there is no text channel set-up, skip.
    // const channel = await queue.getTextChannel();
    // if (!channel) return;

    // // Send the message and automatically delete it once the threshold is reached.
    // const response = await channel.send(
    //   `${
    //     EMOJIS.loading
    //   } Hold on, I got a little problem, I'll be back in ${formatDuration(
    //     payload.thresholdMs
    //   )}!`
    // );
    // await response.nuke(payload.thresholdMs);
  }
}
