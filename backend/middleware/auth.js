import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'connect_maratha_secret_key_2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'प्रमाणीकरण आवश्यक आहे (Token missing)' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'अवैध टोकन (Invalid or expired token)' });
    }
    req.user = user;
    next();
  });
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role || 'member', tier: user.tier || 'Gold' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export default { authenticateToken, generateToken };
