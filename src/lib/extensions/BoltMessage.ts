import { Structures, Message } from 'discord.js';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export class BoltMessage extends Structures.get('Message') {
  public async nuke(time = 0): Promise<Message> {
    if (this.deleted) return this;
    if (time === 0) return this.nukeNow();

    const lastEditedTimestamp = this.editedTimestamp;
    await sleep(time);
    return !this.deleted && this.editedTimestamp === lastEditedTimestamp
      ? this.nukeNow()
      : (this as Message);
  }

  private async nukeNow() {
    try {
      return await this.delete();
    } catch (error) {
      if (error.code === RESTJSONErrorCodes.UnknownMessage)
        return this as Message;
      throw error;
    }
  }
}

declare module 'discord.js' {
  export interface Message {
    nuke(time?: number): Promise<Message>;
  }
}
