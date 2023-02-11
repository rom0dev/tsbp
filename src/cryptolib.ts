// source: https://lollyrock.com/posts/nodejs-encryption/

import crypto from 'crypto';

export function encrypt(text: string, algorithm: string, salt: string): string {
    const cipher = crypto.createCipher(algorithm, salt);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

export function decrypt(text: string, algorithm: string, salt: string): string {
    const decipher = crypto.createDecipher(algorithm, salt);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}
