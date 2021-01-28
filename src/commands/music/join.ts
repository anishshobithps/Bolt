import { Command, CommandOptions } from 'discord-akairo';
import { Message, VoiceChannel } from 'discord.js';
import { ApplyOptions } from '../../lib/util/ApplyOptions';
import { CATEGORY, EMOJIS } from '../../lib/util/Constants';
import { Queue } from '../../lib/Audio/Queue';
import { requireUserInVoiceChannel } from '../../lib/util/MusicDecorators';

@ApplyOptions<CommandOptions>('join', {
  aliases: ['join', 'connect'],
  description: {
    content: 'Joins the voice channel you are in.',
  },
  category: CATEGORY.MUSIC,
  channel: 'guild',
  ratelimit: 2,
  clientPermissions: ['SPEAK', 'CONNECT'],
})
export default class extends Command {
  @requireUserInVoiceChannel()
  public async exec(message: Message) {
    // Get the voice channel the member is in
    const { channel } = message.member!.voice!;

    // If the member is not in a voice channel then throw
    if (!channel)
      await message.channel.send(
        `${EMOJIS.error} You are not connected in a voice channel.`
      );

    const { queue } = message.guild!;

    // Check if the bot is already playing in this guild
    await this.checkBoltPlaying(message, queue, channel!);

    /*
    // Set the ChannelID to the current channel
    await queue.setTextChannelID(message.channel.id);
    */
    queue.player
      .join(channel!.id)
      .then(async () => {
        await message.channel.send(
          `${EMOJIS.tick} Succesfully joined voice channel ${channel!.name}!`
        );
      })
      .catch(async () => {
        await message.channel.send(
          `${EMOJIS.error} I could not join your voice channel because there is something wrong with my music player.`
        );
      });
  }

  private async checkBoltPlaying(
    message: Message,
    audio: Queue,
    voiceChannel: VoiceChannel
  ): Promise<void> {
    const selfVoiceChannel = null;
    if (selfVoiceChannel === null) return;

    await message.channel.send(
      voiceChannel.id === selfVoiceChannel
        ? `${EMOJIS.error} Turn on your volume! I am playing music there!`
        : `${EMOJIS.error} I think you confused the channels! Earth to Moon, we are in another voice channel!`
    );
  }
}
