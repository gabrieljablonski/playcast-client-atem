/* eslint-disable no-console */
export default class Logger {
  private static _enabled = false;

  static enable(): void {
    // eslint-disable-next-line global-require
    require('log-timestamp');
    Logger._enabled = true;
  }

  static disable(): void {
    Logger._enabled = false;
  }

  static log(message: string, ...args: unknown[]): void {
    if (Logger._enabled) console.error(`  [LOG] ${message}`, ...args);
  }

  static info(message: string, ...args: unknown[]): void {
    if (Logger._enabled) console.error(` [INFO] ${message}`, ...args);
  }

  static error(message: string, ...args: unknown[]): void {
    if (Logger._enabled) console.error(`[ERROR] ${message}`, ...args);
  }

  static warn(message: string, ...args: unknown[]): void {
    if (Logger._enabled) console.error(` [WARN] ${message}`, ...args);
  }

  static debug(message: string, ...args: unknown[]): void {
    if (Logger._enabled) console.error(`[DEBUG] ${message}`, ...args);
  }
}
