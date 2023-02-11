// https://dev.to/asjadanis/parsing-env-with-typescript-3jjm

import path from 'path';
import dotenv from 'dotenv';

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
    DB_USER: string | undefined;
    DB_PASS: string | undefined;
    DB_HOST: string | undefined;
    DB_PORT: string | undefined;
    DB_NAME: string | undefined;
    DB_TYPE: string | undefined;
    NODE_ENV: string | undefined;
    APP_PORT: number | string | undefined;
    // Secrets for hashing data in DB
    PASSWORD_SECRET: string | undefined;
    // EMAIL_SECRET: string | undefined;
    // NAME_SECRET: string | undefined;
    // COMMENT_SECRET: string | undefined;
    // Salt config
    EMAIL_SALT: string;
    PASSSWORD_SALT_ROUNDS: string | undefined;
    // EMAIL_SALT_ROUNDS: number | undefined;
    // NAME_SALT_ROUNDS: number | undefined;
    // COMMENT_SALT_ROUNDS: number | undefined;
    CIPHER_ALGORITHM: string;
}

export interface Config {
    DB_USER: string | undefined;
    DB_PASS: string | undefined;
    DB_HOST: string | undefined;
    DB_PORT: string | undefined;
    DB_NAME: string | undefined;
    DB_TYPE: string | undefined;
    NODE_ENV: string | undefined;
    APP_PORT: number | string | undefined;
    CIPHER_ALGORITHM: string;
    // Secrets for hashing data in DB
    PASSWORD_SECRET: string | undefined;
    // EMAIL_SECRET: string | undefined;
    // NAME_SECRET: string | undefined;
    // COMMENT_SECRET: string | undefined;
    // Salt config
    PASSSWORD_SALT_ROUNDS: string | undefined;
    EMAIL_SALT: string;
    // EMAIL_SALT_ROUNDS: number | undefined;
    // NAME_SALT_ROUNDS: number | undefined;
    // COMMENT_SALT_ROUNDS: number | undefined;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
    return {
        DB_PORT: process.env.DB_PORT, // ? Number(process.env.PORT) : undefined,
        DB_USER: process.env.DB_USER,
        DB_PASS: process.env.DB_PASS,
        DB_HOST: process.env.DB_HOST,
        DB_NAME: process.env.DB_NAME,
        DB_TYPE: process.env.DB_TYPE, // postgres || ...
        NODE_ENV: process.env.NODE_ENV,
        CIPHER_ALGORITHM: process.env.CIPHER_ALGORITHM || 'aes-256-ctr',
        APP_PORT: process.env.APP_PORT,
        // Secrets for hashing data in DB
        PASSWORD_SECRET: process.env.PASSWORD_SECRET,
        // EMAIL_SECRET: process.env.EMAIL_SECRET,
        // NAME_SECRET: process.env.NAME_SECRET,
        // COMMENT_SECRET: process.env.COMMENT_SECRET,
        // Salt config
        PASSSWORD_SALT_ROUNDS: process.env.PASSSWORD_SALT_ROUNDS,
        EMAIL_SALT: process.env.EMAIL_SALT || '',
        // EMAIL_SALT_ROUNDS: process.env.EMAIL_SALT_ROUNDS,
        // NAME_SALT_ROUNDS: process.env.NAME_SALT_ROUNDS,
        // COMMENT_SALT_ROUNDS: process.env.COMMENT_SALT_ROUNDS,
    };
};

// Throwing an Error if any field was undefined we don't
// want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type
// definition.

const getSanitzedConfig = (config: ENV): Config => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            throw new Error(`Missing key ${key} in config.env`);
        }
    }
    return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
