import { AkairoModule, AkairoModuleOptions } from 'discord-akairo';

export type Constructor<T> = new (...args: any[]) => T;

const createClassDecorator = <T extends (...args: any[]) => void>(
  fn: T
): ClassDecorator => fn;

/**
 * Applies options onto a given `AkairoModule` using a class decorator.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function ApplyOptions<T extends AkairoModuleOptions>(
  id: string,
  options: T
) {
  return createClassDecorator(
    (target: Constructor<AkairoModule>) =>
      class extends target {
        public constructor() {
          super(id, options);
        }
      }
  );
}
