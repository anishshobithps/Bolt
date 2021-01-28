import { Listener, ListenerOptions } from 'discord-akairo';
import { ApplyOptions } from '../../lib/util/ApplyOptions';
import { red } from 'colorette';

@ApplyOptions<ListenerOptions>('error', {
  event: 'error',
  category: 'Client',
  emitter: 'client',
})
export default class extends Listener {
  public exec(error: Error) {
    console.error(`${red('[CLIENT]')} ${error.stack}`);
  }
}
