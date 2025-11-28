import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function hashToken(token) {
    if (!token) return null;
    return bcrypt.hashSync(String(token), SALT_ROUNDS);
}

export function compareToken(token, hash) {
    if (!token || !hash) return false;
    try {
        return bcrypt.compareSync(String(token), String(hash));
    } catch (e) {
        return false;
    }
}

export default { hashToken, compareToken };
