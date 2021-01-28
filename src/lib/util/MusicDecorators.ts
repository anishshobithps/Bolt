import { Message } from 'discord.js';
/**
 * The inhibitor interface
 */
export interface Inhibitor {
  /**
   * The arguments passed to the class' method
   */
  (...args: any[]): boolean | Promise<boolean>;
}

/**
 * The fallback interface, this is called when the inhibitor returns or resolves with a falsy value
 */
export interface Fallback {
  /**
   * The arguments passed to the class' method
   */
  (...args: any[]): unknown;
}

/**
 * Utility to make a method decorator with lighter syntax and inferred types.
 *
 * ```ts
 * // Enumerable function
 *	function enumerable(value: boolean) {
 *		return createMethodDecorator((_target, _propertyKey, descriptor) => {
 *			descriptor.enumerable = value;
 *		});
 *	}
 * ```
 * @since 1.0.0
 * @param fn The method to decorate
 */
export function createMethodDecorator(fn: MethodDecorator): MethodDecorator {
  return fn;
}

/**
 * Utility to make function inhibitors.
 *
 * ```ts
 *	// No fallback (returns undefined)
 *	function requiresPermission(value: number) {
 *		return createFunctionInhibitor((message: KlasaMessage) =>
 *			message.hasAtLeastPermissionLevel(value));
 *	}
 *
 *	// With fallback
 *	function requiresPermission(
 *		value: number,
 *		fallback: () => unknown = () => undefined
 *	) {
 *		return createFunctionInhibitor((message: KlasaMessage) =>
 *			message.hasAtLeastPermissionLevel(value), fallback);
 *	}
 * ```
 * @since 1.0.0
 * @param inhibitor The function that defines whether or not the function should be run, returning the returned value from fallback
 * @param fallback The fallback value that defines what the method should return in case the inhibitor fails
 */
export function createFunctionInhibitor(
  inhibitor: Inhibitor,
  fallback: Fallback = (): void => undefined
): MethodDecorator {
  return createMethodDecorator((_target, _propertyKey, descriptor) => {
    const method = descriptor.value;
    if (!method) throw new Error('Function inhibitors require a [[value]].');
    if (typeof method !== 'function')
      throw new Error('Function inhibitors can only be applied to functions.');

    descriptor.value = (async function descriptorValue(
      this: (...args: any[]) => any,
      ...args: any[]
    ) {
      const canRun = await inhibitor(...args);
      return canRun ? method.call(this, ...args) : fallback.call(this, ...args);
    } as unknown) as undefined;
  });
}

export function requireUserInVoiceChannel(): MethodDecorator {
  return createFunctionInhibitor(
    (message: Message) => message.member!.voice.channel !== null,
    (message: Message) =>
      message.channel.send(
        'You need to be in a voice channel to use this command!'
      )
  );
}
