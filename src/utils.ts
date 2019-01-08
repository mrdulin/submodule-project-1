import { createLogger, transports, format, Logger } from 'winston';
import _ from 'lodash';

function createAppLogger(): Logger {
  const { combine, timestamp, printf, colorize } = format;

  return createLogger({
    format: combine(
      colorize(),
      timestamp(),
      printf(
        (info: any): string => {
          const label: string = info.label ? ' ' + info.label + ' ' : '';
          let message = info.message ? info.message : info;
          if (typeof message === 'object') {
            message = JSON.stringify(message);
          }
          return `${info.timestamp}${label}[${info.level}] : ${message}`;
        }
      )
    ),
    transports: [new transports.Console()]
  });
}

const logger: Logger = createAppLogger();

function sleep(ms: number, verbose?: boolean): Promise<void> {
  if (verbose) {
    const unit = 1000;
    logger.info(`start the timer...${ms / unit}s`);
    const intervalId = setInterval(() => {
      ms -= unit;
      if (ms > 0) {
        logger.info(`${ms / unit}s`);
      } else {
        logger.info('timer end');
        clearInterval(intervalId);
      }
    }, unit);
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function coin(): boolean {
  return Math.random() > 0.5;
}

function genBufferMessage(message: object | string): Buffer {
  let jsonString;
  if (typeof message === 'string') {
    jsonString = message;
  } else if (_.isPlainObject(message)) {
    jsonString = JSON.stringify(message);
  } else {
    throw new Error('Wrong data type');
  }
  logger.info(`Random data: ${jsonString}`);
  const dataBuffer = Buffer.from(jsonString);
  return dataBuffer;
}

function parsePubsubEventData(event, verbose: boolean = true) {
  const pubsubMessage = event.data;
  if (verbose) {
    console.log('pubsubMessage: ', pubsubMessage);
  }
  const message = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString());
  if (verbose) {
    console.log('message:', message);
  }
  return message;
}

export { logger, sleep, coin, genBufferMessage, parsePubsubEventData };
