import { loadFile, saveFile } from './file';
import Logger from './logger';

interface Connection {
  host: string;
  port: number;
}

interface Action {
  when: 'pgm' | 'preview';
  source: number;
  action: 'play';
  args: unknown[];
}

interface ValidConfig {
  atem?: Connection;
  playcast?: Connection;
  actions?: Action[];
}

export default class Config {
  private static VALID_CONFIG = {
    atem: {
      host: 'string',
      port: 'number',
    },
    playcast: {
      host: 'string',
      port: 'number',
    },
    actions: [
      {
        when: 'string',
        source: 'number',
        action: 'string',
        args: [],
      },
    ],
  };

  private static _path = '';

  static _config: ValidConfig = {};

  static get config(): ValidConfig {
    return Config._config;
  }

  static setPath(path: string): void {
    Config._path = path;
  }

  static load(): ValidConfig | null {
    const { contents, error } = loadFile(Config._path);
    if (error) {
      Logger.error('failed to load config', error);
    }
    if (!Config.validate(contents as Record<string, unknown>)) {
      Logger.warn('invalid config');
      return null;
    }
    Config._config = (contents as Record<string, unknown>) || {};
    return Config.config;
  }

  static save(config: Record<string, unknown>): boolean {
    if (!Config.validate(config)) {
      Logger.warn('invalid config');
      return false;
    }
    const { error } = saveFile(Config._path, config, 2);
    if (error) {
      Logger.warn('failed to save config file', error);
      return false;
    }
    Config._config = config;
    return true;
  }

  static validate(
    config?: ValidConfig,
    valid?: Record<string, unknown>,
  ): boolean {
    if (!config) {
      // eslint-disable-next-line no-param-reassign
      config = Config.config;
    }
    if (!valid) {
      // eslint-disable-next-line no-param-reassign
      valid = Config.VALID_CONFIG;
    }
    if (Array.isArray(valid)) {
      let elements;
      if (Array.isArray(config)) {
        elements = config;
      }
      if (!elements || !elements.length) {
        Logger.warn('invalid', config);
        Logger.warn('expected array');
        return false;
      }
      if (!valid.length) {
        // valid = []
        // config = [{"whatever": "you"}, "want", 123]
        return true;
      }
      if (typeof valid[0] !== 'object') {
        // valid = ['string', 'number', 'object']
        // config = ["123", 123, {"test": 123}]
        // eslint-disable-next-line no-restricted-syntax
        for (const [c, i] of elements.entries()) {
          if (typeof c !== valid[i]) {
            Logger.warn('invalid type of', c);
            Logger.warn(`expected key of type`, valid[i]);
            return false;
          }
        }
        return true;
      }
      // valid = [{"expectedKey1": "string", "expectedKey2": "number"}]
      // config = [{"expectedKey1": "123", "expectedKey2": 123}, {"expectedKey1": "456", "expectedKey2": 456}, ...]
      // eslint-disable-next-line no-restricted-syntax
      for (const e of elements) {
        if (!Config.validate(e, valid[0])) {
          Logger.warn(`invalid element ${JSON.stringify(e, null, 2)}`);
          return false;
        }
      }
      return true;
    }
    // valid = {"expectedKey1": "string", "expectedKey2": "number"}
    // config = {"expectedKey1": "123", "expectedKey2": 123}
    // eslint-disable-next-line no-restricted-syntax
    for (const [k, v] of Object.entries(valid)) {
      if (config[k] === undefined) {
        Logger.warn('invalid', config);
        Logger.warn(`expected key '${k}'`);
        return false;
      }
      if (typeof v === 'object') {
        if (
          !Config.validate(
            config[k] as Record<string, unknown>,
            v as Record<string, unknown>,
          )
        ) {
          Logger.warn(`invalid element '${k}'`);
          return false;
        }
      } else if (typeof config[k] !== v) {
        Logger.warn('invalid', config);
        Logger.warn(`expected key '${k}' of type '${v}'`);
        return false;
      }
    }
    return true;
  }
}
