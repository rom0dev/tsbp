const db = require('./dist/db');

const sanitizedConfig = require('./config');

describe("Users functions", () => {
    test('Should register user', async () => {
        const result = await userRegister(sanitizedConfig, 'email', 'password')
    })
})