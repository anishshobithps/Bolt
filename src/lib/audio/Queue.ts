/* eslint-disable @typescript-eslint/naming-convention */
import { container } from 'tsyringe';
import { EventEmitter } from 'events';

import type { Guild, TextChannel, VoiceChannel } from 'discord.js';
import type { Player } from '@skyra/audio';
import type { BoltClient } from '../structures/BoltClient';
import type { QueueStore } from './QueueStore';

interface QueueKeys {
  readonly next: string;
  readonly prev: string;
  readonly pos: string;
  readonly loop: string;
  readonly text: string;
}

interface lavalinkPlayerUpdate {
  op: string;
  state: {
    position: number;
    time: string;
  };
  guildId: string;
}

export class Queue extends EventEmitter {
  public readonly keys: {
    next: string;
    pos: string;
    prev: string;
    loop: string;
  };

  private guild: string;
  public constructor(public readonly store: QueueStore, guild: string) {
    super();
    this.store = store;
    this.guild = guild;
    this.keys = {
      next: `${this.guild}.next`,
      pos: `${this.guild}.pos`,
      prev: `${this.guild}.prev`,
      loop: `${this.guild}.loop`,
    };

    this.on('event', async (d) => {
      if (
        !['TrackEndEvent', 'TrackStartEvent', 'WebSocketClosedEvent'].includes(
          d.type
        ) ||
        (d.type === 'TrackEndEvent' &&
          !['REPLACED', 'STOPPED'].includes(d.reason!))
      ) {
        const count = d.type === 'TrackEndEvent' ? undefined : 1;
        try {
          await this._next({ count, previous: d });
        } catch (e) {
          this.client.emit('error', e);
        }
      }
    });

    this.on('playerUpdate', (d: lavalinkPlayerUpdate) => {
      try {
        this._store.set(this.keys.pos, d.state.position);
      } catch (e) {
        this.client.emit('error', e);
      }
    });
  }

  public get client(): BoltClient {
    return container.resolve<BoltClient>('BoltClient');
  }

  public get player(): Player {
    return this.store.client.players.get(this.guild);
  }

  public async start(): Promise<boolean> {
    const np = this.current();
    if (!np) return this._next();
    await this.player.play(np.track, { start: np.position });
    return true;
  }

  public add(...tracks: Array<string>) {
    if (!tracks.length) return Promise.resolve(0);
    const oldTracks = this._store.get(this.keys.next) || [];
    oldTracks.push(...tracks);
    return this._store.set(this.keys.next, oldTracks);
  }

  public unshift(...tracks: Array<string>) {
    if (!tracks.length) return Promise.resolve(0);
    const oldTracks = this._store.get(this.keys.next) || [];
    oldTracks.unshift(...tracks);
    return this._store.set(this.keys.next, oldTracks);
  }

  public remove(track: string) {
    const tracks = this._store.get(this.keys.next) || [];
    if (tracks.includes(track)) {
      const index = tracks.indexOf(track);
      tracks.splice(index, 1);
      this._store.set(this.keys.next, tracks);

      return true;
    }
    return false;
  }

  public next(count = 1) {
    return this._next({ count });
  }

  public length() {
    const tracks = this._store.get(this.keys.next);
    return tracks ? tracks.length : 0;
  }

  public async sort(predicate?: (a: string, b: string) => number) {
    const tracks = await this.tracks();
    tracks.sort(predicate);
    return this._store.set(this.keys.next, [...tracks]);
  }

  public move(from: number, to: number) {
    const tracks = this._store.get(this.keys.next) || [];
    from = from >= 1 ? from - 1 : tracks.length - (~from + 1);
    to = to >= 1 ? to - 1 : tracks.length - (~to + 1);

    const element = tracks[from];
    tracks.splice(from, 1);
    tracks.splice(to, 0, element);

    this._store.set(this.keys.next, tracks);
    return tracks;
  }

  public shuffle() {
    const tracks = this._store.get(this.keys.next) || [];
    const shuffled = tracks
      .map((track: string) => ({ sort: Math.random(), track }))
      .sort((a: { sort: number }, b: { sort: number }) => a.sort - b.sort)
      .map((a: { track: number }) => a.track);
    return this._store.set(this.keys.next, shuffled);
  }

  public looping(boolean?: boolean) {
    if (boolean === undefined) return this._store.get(this.keys.loop);
    this._store.set(this.keys.loop, boolean);
    return this._store.get(this.keys.loop);
  }

  public splice(start: number, deleteCount?: number, ...arr: Array<string>) {
    const tracks = this._store.get(this.keys.next) || [];
    tracks.splice(start, deleteCount, ...arr);
    return this._store.set(this.keys.next, tracks);
  }

  public trim(start: number, end: number) {
    const tracks = this._store.get(this.keys.next) || [];
    const trimmed = tracks.slice(start, end);
    return this._store.set(this.keys.next, trimmed);
  }

  public async stop() {
    await this.player.stop();
  }

  public clear() {
    this._store.delete(this.keys.pos);
    this._store.delete(this.keys.prev);
    this._store.delete(this.keys.next);
    this._store.delete(this.keys.loop);
    return true;
  }

  public current() {
    const [track, position] = [
      this._store.get(this.keys.prev),
      this._store.get(this.keys.pos),
    ];
    if (track) {
      return {
        track,
        position: Math.floor(position) || 0,
      };
    }
    return null;
  }

  public tracks() {
    const tracks = this._store.get(this.keys.next);
    return tracks || [];
  }

  private _next({
    count,
    previous,
  }: {
    count?: number;
    previous?: { position: number; track: string } | null;
  } = {}) {
    this._store.set(this.keys.pos, 0);
    if (!previous) previous = this.current();
    if (count === undefined && previous) {
      const length = this.length();
      count = this.store.client.advanceBy(this, {
        previous: previous.track,
        remaining: length,
      });
    }
    if (count === 0) return this.start();
    const skipped = this._replace(count);
    if (skipped.length) return this.start();
    this.clear();
    return false;
  }

  private _replace(count = 1) {
    const tracks = this._store.get(this.keys.next) || [];
    if (count > tracks.length || count < -tracks.length) return [];
    count = count >= 1 ? count - 1 : tracks.length - (~count + 1);
    this._store.set(this.keys.prev, tracks[count]);
    const skipped = tracks.slice(count + 1, tracks.length);
    this._store.set(this.keys.next, skipped);
    return { length: (skipped.length as number) + 1 };
  }

  private get _store() {
    return this.store.cached;
  }
}
/*
export class Queue extends EventEmitter {
  public keys: QueueKeys;

  public constructor(
    public readonly store: QueueStore,
    public readonly guildID: string
  ) {
    super();
    this.keys = {
      next: `${this.guildID}.next`,
      pos: `${this.guildID}.pos`,
      prev: `${this.guildID}.prev`,
      loop: `${this.guildID}.loop`,
      text: `${this.guildID}.text`,
    };
  }

  public get client(): BoltClient {
    return container.resolve<BoltClient>('BoltClient');
  }

  public get player(): Player {
    return this.store.client.players.get(this.guildID);
  }

  public get playing(): boolean {
    return this.player.playing;
  }

  public get paused(): boolean {
    return this.player.paused;
  }

  public get guild(): Guild {
    return this.client.guilds.cache.get(this.guildID)!;
  }

  public async getTextChannel(): Promise<TextChannel | null> {
    const id = this['_store'].get(this.keys.text);
    if (id === null) return null;

    const channel = this.guild.channels.cache.get(id) ?? null;
    if (channel === null) {
      await this.setTextChannelID(null);
      return null;
    }

    return channel as TextChannel;
  }

  public get voiceChannel(): VoiceChannel | null {
    const id = this.voiceChannelID;
    return id
      ? (this.guild.channels.cache.get(id) as VoiceChannel) ?? null
      : null;
  }

  public get voiceChannelID(): string | null {
    return this.player.voiceState?.channel_id ?? null;
  }

  public add(...tracks: Array<string>) {
    if (!tracks.length) return Promise.resolve(0);
    const oldTracks = this._store.get(this.keys.next) || [];
    oldTracks.push(...tracks);
    return this._store.set(this.keys.next, oldTracks);
  }

  public clear() {
    this._store.delete(this.keys.pos);
    this._store.delete(this.keys.prev);
    this._store.delete(this.keys.next);
    this._store.delete(this.keys.loop);
    return true;
  }

  public current() {
    const [track, position] = [
      this._store.get(this.keys.prev),
      this._store.get(this.keys.pos),
    ];
    if (track) {
      return {
        track,
        position: Math.floor(position) || 0,
      };
    }
    return null;
  }

  public length() {
    const tracks = this._store.get(this.keys.next);
    return tracks ? tracks.length : 0;
  }

  public looping(boolean?: boolean) {
    if (boolean === undefined) return this._store.get(this.keys.loop);
    this._store.set(this.keys.loop, boolean);
    return this._store.get(this.keys.loop);
  }

  public move(from: number, to: number) {
    const tracks = this._store.get(this.keys.next) || [];
    from = from >= 1 ? from - 1 : tracks.length - (~from + 1);
    to = to >= 1 ? to - 1 : tracks.length - (~to + 1);

    const element = tracks[from];
    tracks.splice(from, 1);
    tracks.splice(to, 0, element);

    this._store.set(this.keys.next, tracks);
    return tracks;
  }

  public next(count = 1) {
    return this._next({ count });
  }

  public setTextChannelID(channelID: null): Promise<null>;
  public async setTextChannelID(channelID: string): Promise<string>;
  public async setTextChannelID(
    channelID: string | null
  ): Promise<string | null> {
    if (channelID === null) {
      await this['_store'].delete(this.keys.text);
    } else {
      await this['_store'].set(this.keys.text, channelID);
    }

    return channelID;
  }

  public shuffle() {
    const tracks = this._store.get(this.keys.next) || [];
    const shuffled = tracks
      .map((track: string) => ({ sort: Math.random(), track }))
      .sort((a: { sort: number }, b: { sort: number }) => a.sort - b.sort)
      .map((a: { track: number }) => a.track);
    return this._store.set(this.keys.next, shuffled);
  }

  public async sort(predicate?: (a: string, b: string) => number) {
    const tracks = await this.tracks();
    tracks.sort(predicate);
    return this._store.set(this.keys.next, [...tracks]);
  }

  public splice(start: number, deleteCount?: number, ...arr: Array<string>) {
    const tracks = this._store.get(this.keys.next) || [];
    tracks.splice(start, deleteCount, ...arr);
    return this._store.set(this.keys.next, tracks);
  }

  public async start(): Promise<boolean> {
    const np = this.current();
    if (!np) return this._next();
    await this.player.play(np.track, { start: np.position });
    return true;
  }

  public async stop() {
    await this.player.stop();
  }

  public tracks() {
    const tracks = this._store.get(this.keys.next);
    return tracks || [];
  }

  public trim(start: number, end: number) {
    const tracks = this._store.get(this.keys.next) || [];
    const trimmed = tracks.slice(start, end);
    return this._store.set(this.keys.next, trimmed);
  }

  public unshift(...tracks: Array<string>) {
    if (!tracks.length) return Promise.resolve(0);
    const oldTracks = this._store.get(this.keys.next) || [];
    oldTracks.unshift(...tracks);
    return this._store.set(this.keys.next, oldTracks);
  }

  private _next({
    count,
    previous,
  }: {
    count?: number;
    previous?: { position: number; track: string } | null;
  } = {}) {
    this._store.set(this.keys.pos, 0);
    if (!previous) previous = this.current();
    if (count === undefined && previous) {
      const length = this.length();
      count = this.store.client.advanceBy(this, {
        previous: previous.track,
        remaining: length,
      });
    }
    if (count === 0) return this.start();
    const skipped = this._replace(count);
    if (skipped.length) return this.start();
    this.clear();
    return false;
  }

  private _replace(count = 1) {
    const tracks = this._store.get(this.keys.next) || [];
    if (count > tracks.length || count < -tracks.length) return [];
    count = count >= 1 ? count - 1 : tracks.length - (~count + 1);
    this._store.set(this.keys.prev, tracks[count]);
    const skipped = tracks.slice(count + 1, tracks.length);
    this._store.set(this.keys.next, skipped);
    return { length: (skipped.length as number) + 1 };
  }

  private get _store() {
    return this.store.cached;
  }
}
*/
