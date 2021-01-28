import { Permissions, Structures } from 'discord.js';

export class BoltGuildMember extends Structures.get('GuildMember') {
  public isDJ() {
    return this.checkDj() || this.checkModerator() || this.checkAdministrator();
  }

  private checkDj() {
    return this.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES);
  }

  private checkModerator() {
    return this.permissions.has(Permissions.FLAGS.BAN_MEMBERS);
  }

  private checkAdministrator() {
    return this.permissions.has(Permissions.FLAGS.MANAGE_GUILD);
  }
}

declare module 'discord.js' {
  export interface GuildMember {
    isDJ(): boolean;
  }
}

Structures.extend('GuildMember', () => BoltGuildMember);
