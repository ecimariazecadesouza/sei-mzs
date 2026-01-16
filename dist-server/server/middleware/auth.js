import jwt from 'jsonwebtoken';
export function authMiddleware(req, res, next) {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: 'Token not provided' });
    }
    const [, token] = authorization.split(' ');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { id, role } = decoded;
        req.userId = id;
        req.userRole = role;
        return next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Token invalid' });
    }
}
