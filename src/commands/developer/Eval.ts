/* eslint-disable @typescript-eslint/naming-convention */
import { Command, CommandOptions } from 'discord-akairo';
import { Message, MessageAttachment, MessageEmbed } from 'discord.js';
import { inspect } from 'util';
import { ApplyOptions } from '../../lib/util/ApplyOptions';

@ApplyOptions<CommandOptions>('eval', {
  aliases: ['eval'],
  args: [
    {
      id: 'code',
      type: 'string',
      match: 'rest',
    },
    {
      id: 'Depth',
      match: 'option',
      type: 'number',
      flag: ['-d=', '--depth='],
    },
    {
      id: 'toAsync',
      match: 'flag',
      flag: '--async',
    },
    {
      id: 'silent',
      match: 'flag',
      flag: ['-s', '--silent'],
    },
  ],
  description: {
    content: 'Evaluates Code',
    usage: '<code> [flags: depth|toAsync|isSilent]',
  },
  category: 'developer',
  ownerOnly: true,
})
export default class EvalCommand extends Command {
  public async exec(
    message: Message,
    {
      code,
      Depth,
      toAsync,
      silent,
    }: { code: string; Depth: number; toAsync: boolean; silent: boolean }
  ) {
    const depth = Depth ?? 0;
    const format = (code: any) => ['```ts', code, '```'].join('\n');
    const embed = new MessageEmbed().addField('**Input:**', format(code));
    let toEval = code;
    if (toAsync) toEval = `(async () => { ${code} })();`;
    try {
      // eslint-disable-next-line no-eval
      const evaluated = await eval(toEval);
      if (silent) return;
      const output = inspect(evaluated, { depth });
      if (output.length < 1000) {
        embed.addField(
          '**Output**',
          format(output.replace(this.client.token!, 'BRUH'))
        );
        return message.channel.send(embed);
      }
      const attachment = new MessageAttachment(
        Buffer.from(evaluated),
        'evaluation.txt'
      );
      return message.channel.send({ files: [attachment] });
    } catch (err) {
      const full = err.stack ?? err;
      if (full.length < 1000) {
        embed.addField('**Error**', format(full));
        return message.channel.send(embed);
      }
      const attachment = new MessageAttachment(
        Buffer.from(full),
        'evaluation.txt'
      );
      return message.channel.send({ files: [attachment] });
    }
  }
}
