import 'reflect-metadata';
import { BoltClient } from './lib/structures/BoltClient';

const client = new BoltClient();
client.start().catch((err: Error) => console.error(err.message));
