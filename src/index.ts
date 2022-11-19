import logger from './logger';
import app from './app';
import { exec } from 'child_process';
import { checkUpdates } from "./getShoppingList";

(async () => {
  await checkUpdates()
})();
const port = app.get('port');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
);

//do something when app is closing
process.on('exit', exitHandler.bind(null));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null));
process.on('SIGUSR2', exitHandler.bind(null));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null));

function exitHandler () {
  // console.log('Stopping postgres...');
  // exec('powershell .\\start.ps1 $true');
  process.exit();
}
