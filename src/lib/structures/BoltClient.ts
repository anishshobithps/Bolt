import {
  AkairoClient,
  AkairoOptions,
  CommandHandler,
  ListenerHandler,
} from 'discord-akairo';
import { ClientOptions } from 'discord.js';
import { container } from 'tsyringe';
import { green } from 'colorette';
import path from 'path';
import { enumerable } from '../util/enumerable';
import { QueueClient } from '../audio/QueueClient';
import { config } from '../../config';

import '../extensions/BoltGuild';
import '../extensions/BoltGuildMember';
import '../extensions/BoltMessage';
import '../extensions/BoltVoiceChannel';
import { wait } from '../util/wait';

declare module 'discord-akairo' {
  interface AkairoClient {
    music: QueueClient;
    config: BoltClientOptions;
    commands: CommandHandler;
    events: ListenerHandler;
  }
}

export class BoltClient extends AkairoClient {
  public commands: CommandHandler;

  public events: ListenerHandler;

  @enumerable(false)
  public music: QueueClient;

  public config: BoltClientOptions;

  public constructor() {
    super({
      ownerID: config.ownerID,
      ...config,
    });
    this.config = config;

    this.commands = new CommandHandler(this, {
      directory: path.join(__dirname, '..', '..', 'commands'),
      prefix: config.prefix,
      aliasReplacement: /-/g,
      allowMention: true,
      fetchMembers: true,
      commandUtil: true,
      commandUtilLifetime: 3e5,
      commandUtilSweepInterval: 9e5,
      handleEdits: true,
      defaultCooldown: 3000,
    });

    this.events = new ListenerHandler(this, {
      directory: path.join(__dirname, '..', '..', 'events'),
    });

    this.music = new QueueClient(config.lavalink, (guildID, packet) => {
      const guild = this.guilds.cache.get(guildID);
      return Promise.resolve(guild?.shard.send(packet));
    });

    container
      .registerInstance(BoltClient, this)
      .registerInstance('BoltClient', this);
  }

  public init() {
    this.commands.useListenerHandler(this.events);
    this.events.setEmitters({
      commands: this.commands,
      events: this.events,
      lavalink: this.music,
      ws: this.ws,
      process,
    });

    this.commands.loadAll();
    this.events.loadAll();
  }

  public async start() {
    await this.init();
    return this.login(this.config.token);
  }

  public async stop() {
    console.log(`${green('[CLIENT]')} ${this.user?.username} is shutting down`);
    await wait(5000);
    await this.music.disconnect();
    await this.destroy();
    process.exit();
  }
}

export interface BoltClientOptions extends AkairoOptions, ClientOptions {
  prefix: string;
  token: string;
  lavalink: {
    password: string;
    userID: string;
    hosts: {
      rest: string;
      ws: string;
    };
  };
}
