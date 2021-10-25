import { Atem } from 'atem-connection';
import { Playcast } from '@viacast/playcast-client';

import { configPath, version, commit } from './config.json';
import { Config, Logger } from './utils';

const onlyPrintVersion =
  process.argv.includes('--version') || process.argv.includes('-v');

if (!onlyPrintVersion) {
  Logger.enable();
  Logger.log(`Playcast Middleware ATEM custom client ${version} ${commit}`);
}

if (onlyPrintVersion) {
  // eslint-disable-next-line no-console
  console.log(`Playcast Middleware ${version} ${commit}`);
  process.exit(0);
}

Config.setPath(configPath);
if (!Config.load()) {
  process.exit(-1);
}

const atem = new Atem();

atem.on('error', process.stderr.write);
atem.on('connected', async () => {
  Logger.info('ATEM connected');

  const playcast = new Playcast(Config.config.playcast);
  await playcast.connect();
  Logger.info('Playcast connected');

  const { actions } = Config.config;

  atem.addListener('receivedCommands', command => {
    const commandName = command[2]?.constructor.name;
    const commandSource = command[2]?.properties.source;
    if (!commandName || !commandSource) {
      return;
    }

    Logger.debug('command from atem:', commandName, commandSource);

    actions.forEach(action => {
      if (action.when !== 'pgm' && action.when !== 'preview') {
        return;
      }
      if (commandSource !== action.source) {
        return;
      }
      if (
        action.when === 'pgm' &&
        commandName !== 'ProgramInputUpdateCommand'
      ) {
        return;
      }
      if (
        action.when === 'preview' &&
        commandName !== 'PreviewInputUpdateCommand'
      ) {
        return;
      }
      if (action.action === 'play') {
        Logger.debug('sending play to Playcast unit', action.args[0]);
        playcast.play(action.args[0] as number);
      }
    });
  });
});

atem.connect(Config.config.atem.host, Config.config.atem.port);
