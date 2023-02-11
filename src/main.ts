#!/usr/bin/env node
import sanitizedConfig from './config';

import express from 'express';
import bodyParser from 'body-parser';

import process from 'node:process';

// import { verify } from '@types/passport-local';
// interface Done {
//     error?: unknown;
//     user?: Express.User | false;
//     options?: IVerifyOptions;
// }
//-------------------------------------------------------------------
const app = express();
app.disable('x-powered-by'); // disable dark side of this service :)
app.use(express.json()); // support json encoded bodies
// app.use(express.urlencoded()); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

//-------------------------------------------------------------------
import cors from 'cors'; // https://expressjs.com/en/resources/middleware/cors.html
const corsOptions = {
    origin: '*', // change this to your domain !
    // TODO: get from node env
};
app.use(cors(corsOptions));
//-------------------------------------------------------------------
import helmet from 'helmet';
app.use(helmet());
//-------------------------------------------------------------------
import { log_error, log_info } from './logger';
// import config from './config';
import connect from './db';

//-------------------------------------------------------------------
import userRouter from './routes/users';
app.use('/users', userRouter);
//-------------------------------------------------------------------
// const checkConfig = () => {
//     //TODO: Check config
//     if (!sanitizedConfig.APP_PORT) {
//         console.error('Please define APP_PORT'); // FIXIT
//         process.exit(1);
//     }
// };

//-------------------------------------------------------------------
// Main code
(async () => {
    //TODO: await checkConfig();

    const DB = await connect();
    if (DB.status !== 'ok') {
        log_error("Can't connect ro database!: "); //  + DB.toString()
        process.exit(1);
    }
    const server = app
        .listen(sanitizedConfig.APP_PORT)
        .on('listening', () => {
            log_info('App started at:' + sanitizedConfig.APP_PORT);
        })
        .on('error', error => {
            console.log(error); // TODO: log error
        });

    process.on('SIGTERM', () => {
        log_info('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            log_info('HTTP server closed');
        });
    });
})();
//-------------------------------------------------------------------
// process.on('uncaughtException', (err, origin) => {
//     // TODO: write to log
//     // fs.writeSync(process.stderr.fd, `Caught exception: ${err}\n` + `Exception origin: ${origin}`);
// });
// process.on('unhandledRejection', (reason, promise) => {
//     // console.log('Unhandled Rejection at:', promise, 'reason:', reason);
//     // Application specific logging, throwing an error, or other logic here
// });
// server.close(function () {
//     console.log('Doh :(');
// });

// export const delayMillis = (delayMs: number): Promise<void> => new Promise(resolve => setTimeout(resolve, delayMs));

// export const greet = (name: string): string => `Hello ${name}`

// export const foo = async (): Promise<boolean> => {
//   console.log(greet('World'))
//   await delayMillis(1000)
//   console.log('done')
//   return true
// }
