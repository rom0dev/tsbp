import { Sequelize, DataTypes } from 'sequelize';
import sanitizedConfig from './config';
import type Config from './config';
import bcrypt from 'bcrypt';

import { encrypt /* decrypt */ } from './cryptolib';
import { log_error, log_info } from './logger';

const sequelize = new Sequelize(
    `postgres://${sanitizedConfig.DB_USER}:${sanitizedConfig.DB_PASS}@${sanitizedConfig.DB_HOST}:${sanitizedConfig.DB_PORT}/${sanitizedConfig.DB_NAME}`,
);
//-------------------------------------------------------------------
type connectResult = {
    status: string; //"ok" | "error";
    data: string;
    sequelize?: Sequelize;
};

// type user = {
//     id: number;
//     email: string;
//     name: string;
//     comment: string;
//     password: string;
//     salt: string;
//     disabledAt: typeof DataTypes.DATE;
//     createdAt: typeof DataTypes.DATE;
// };

export type dbResult = {
    status: 'ok' | 'error';
    data?: string | undefined; //[object: user, boolean] | undefined | string;
};
//-------------------------------------------------------------------
export const TableUsers = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING,
    },
    name: {
        // как называется компания
        type: DataTypes.STRING,
    },
    comment: {
        // коммент для нас
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING(100),
    },
    salt: {
        type: DataTypes.STRING,
    },
    disabledAt: {
        type: DataTypes.DATE,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
});
//-------------------------------------------------------------------
// const asyncForEach = async (array, callback) => {
//     for (let index = 0; index < array.length; index++) {
//         await callback(array[index], index, array);
//     }
// };
//-------------------------------------------------------------------
// подключение к БД
export default async function connect(): Promise<connectResult> {
    return await sequelize
        .authenticate()
        .then(async () => {
            // await TableUsers.sync({ alter: true });
            return {
                status: 'ok',
                data: 'Connection to DB has been established successfully.',
                sequelize: sequelize,
            };
        })
        .catch(error => {
            return {
                status: 'error',
                data: 'PG: Unable to connect to the database: ' + JSON.stringify(error),
            };
        });
}
//-------------------------------------------------------------------
export async function userRegister(config: typeof Config, email: string, password: string): Promise<string> {
    log_info('');

    let salt = '';
    try {
        salt = await bcrypt.genSalt(parseInt(config.PASSSWORD_SALT_ROUNDS || '7'));
    } catch {
        (error: unknown) => {
            log_error(error + ''); //TODO
        };
    }

    let passwordHash = '';
    try {
        passwordHash = await bcrypt.hash(password, salt);
    } catch {
        (error: unknown) => {
            log_error(error + ''); //TODO
        };
    }

    const cEmail: string = encrypt(email, config.CIPHER_ALGORITHM, config.EMAIL_SALT);

    try {
        const result = await TableUsers.findOrCreate({
            where: { email: cEmail },
            defaults: {
                email: cEmail,
                password: passwordHash,
                salt: salt,
            },
        });
        return JSON.stringify({ status: 'ok', data: result }); // TODO: send as object
        // return { status: 'ok', data: result }; // TODO: send as object
    } catch (error) {
        return JSON.stringify({ status: 'error', data: error });
        // return { status: 'error', data: error || {} };
    }
}
//-------------------------------------------------------------------
export async function userGetByEmail(config: typeof Config, email: string): Promise<string> {
    const cEmail: string = encrypt(email, config.CIPHER_ALGORITHM, config.EMAIL_SALT);
    try {
        const result = await TableUsers.findOne({ where: { email: cEmail } });
        return JSON.stringify({ status: 'ok', data: result });
    } catch (error) {
        return JSON.stringify({ status: 'error', data: error });
    }
}
//-------------------------------------------------------------------
export async function userGetById(id: string | number): Promise<string> {
    try {
        const result = await TableUsers.findOne({ where: { id: id } });
        return JSON.stringify({ status: 'ok', data: result });
    } catch (error) {
        return JSON.stringify({ status: 'error', data: error });
    }
}
//-------------------------------------------------------------------
