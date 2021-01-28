import { Command, CommandOptions } from 'discord-akairo';
import { Message } from 'discord.js';
import { LoadType } from '@skyra/audio';
import * as url from 'url';
import * as path from 'path';
import { ApplyOptions } from '../../lib/util/ApplyOptions';
import { CATEGORY, EMOJIS } from '../../lib/util/Constants';
import { requireUserInVoiceChannel } from '../../lib/util/MusicDecorators';

@ApplyOptions<CommandOptions>('add', {
  aliases: ['add'],
  description: {
    content: 'Play a song from literally any source you can think of.',
    usage: '<link/search>',
    examples: ['bye pewdiepie carryminati'],
  },
  category: CATEGORY.MUSIC,
  channel: 'guild',
  ratelimit: 2,
  args: [
    {
      id: 'query',
      match: 'rest',
    },
  ],
})
export default class PlayCommand extends Command {
  @requireUserInVoiceChannel()
  public async exec(message: Message, { query }: { query: string }) {
    if (!query && message.attachments.first()) {
      query = message.attachments.first()!.url;
      if (
        !['.mp3', '.ogg', '.flac', '.m4a'].includes(
          path.parse(url.parse(query).path!).ext
        )
      )
        return;
    }
    if (!query) return;
    if (!['http:', 'https:'].includes(url.parse(query).protocol!))
      query = `ytsearch:${query}`;

    const res = await this.client.music.load(query);

    if (res.loadType === LoadType.NoMatches)
      return message.channel.send(
        "I'm sorry but I wasn't able to find the track!"
      );

    if (res.loadType === LoadType.LoadFailed) {
      return message.channel.send(
        "I'm sorry but I couldn't load this song! Maybe try other song!"
      );
    }
    // Loaded playlist: filter all tracks.
    if (res.loadType === LoadType.PlaylistLoaded) {
      await message.guild!.queue.add(...res.tracks.map((track) => track.track));
      await message.channel.send(
        `${EMOJIS.tick} Added ${
          res.tracks.length === 1 ? 'song' : 'songs'
        } to the queue 🎶`
      );
    }

    if ([LoadType.SearchResult, LoadType.TrackLoaded].includes(res.loadType)) {
      await message.guild!.queue.add(res.tracks[0].track);
      await message.channel.send(
        `${EMOJIS.tick} Added **${res.tracks[0].info.title}** to the queue 🎶`
      );
    }
  }
}
