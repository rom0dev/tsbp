import sanitizedConfig from '../config';

import * as express from 'express';
import { Request, Response /* NextFunction*/ } from 'express';
import { userRegister, userGetByEmail, userGetById } from '../db';

import jwt from 'jsonwebtoken';

import passport from 'passport';
import * as passportJWT from 'passport-jwt';

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'joanlouji',
        },
        async (jwtPayload, done) => {
            if (jwtPayload.id) {
                const result = await userGetById(jwtPayload.id);
                const user = JSON.parse(result);
                // console.log('----', user);
                if (user.data) {
                    return done(null, jwtPayload);
                } else {
                    return done(null, false);
                }
            } else {
                return done(null, false);
            }
        },
    ),
);

const router = express.Router();

//-------------------------------------------------------------------
const genToken = (id: number | string) => {
    console.log('! genToken:', id);
    return jwt.sign(
        {
            iss: 'Joan_Louji', //TODO: брать из конфига
            id: id,
            iat: new Date().getTime(),
            exp: new Date().setDate(new Date().getDate() + 100000), // TODO : вынести в конфиг
        },
        'joanlouji',
    );
};

function isValidPassword(password: string) {
    if (password.length >= 6) {
        return true;
    }
    return false;
}

function isValidEmail(email: string) {
    const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
//-------------------------------------------------------------------
function sendResult(res: Response, statusCode: number, data: object) {
    // statsuCode - HTTP код статуса
    // data - объект с данными
    res.header('Content-Type', 'application/json').status(statusCode).end(JSON.stringify(data));
}
//-------------------------------------------------------------------
// User routes
router.post('/register', async (req: Request, res: Response /*, next: NextFunction*/) => {
    if (isValidEmail(req.body.email)) {
        if (isValidPassword(req.body.password)) {
            const result = await userRegister(sanitizedConfig, req.body.email, req.body.password);
            const user = JSON.parse(result);

            if (user.data[1]) {
                // Generate JWT token
                const token = genToken(user.data.id);

                sendResult(res, 201, { status: 'ok', data: token });
            } else {
                sendResult(res, 409, { status: 'error', data: 'User already exists' });
            }
        } else {
            sendResult(res, 400, { status: 'error', data: 'Password is not valid' });
        }
    } else {
        sendResult(res, 400, { status: 'error', data: 'Email is not valid' });
    }
    // next;
});

router.post('/login', async (req: Request, res: Response /*, next: NextFunction*/) => {
    if (isValidEmail(req.body.email)) {
        if (isValidPassword(req.body.password)) {
            // console.log('Login:', req.body.email, req.body.password);
            const result = await userGetByEmail(sanitizedConfig, req.body.email);
            const user = JSON.parse(result);
            console.log('==== res:', res, req.body.email);
            // console.log('Login-user:', user.data.id);
            if (user.data.disabledAt) {
                sendResult(res, 403, { status: 'error', data: 'User blocked' });
            } else {
                sendResult(res, 200, { status: 'ok', data: genToken(user.data.id) });
            }
        } else {
            sendResult(res, 400, { status: 'error', data: 'Password is not valid' });
        }
    } else {
        sendResult(res, 400, { status: 'error', data: 'Email is not valid' });
    }
});

router.get('/user', passport.authenticate('jwt', { session: false }), (req: Request, res: Response) => {
    req;
    sendResult(res, 200, { status: 'ok' });
});

export default router;
