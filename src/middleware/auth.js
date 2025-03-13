const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');
const logger = require('../config/logger');

let pems = {};

// Fetch the JWT signing keys from Cognito
const fetchCognitoKeys = async () => {
  try {
    const region = process.env.COGNITO_REGION;
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const url = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
    
    const response = await axios.get(url);
    const keys = response.data.keys;

    keys.forEach(key => {
      pems[key.kid] = jwkToPem(key);
    });

    logger.info('Cognito JWT signing keys fetched successfully');
  } catch (error) {
    logger.error('Error fetching Cognito JWT signing keys:', error);
    throw new Error('Failed to fetch JWT signing keys');
  }
};

// Initialize the PEM keys
fetchCognitoKeys().catch(error => {
  logger.error('Initial PEM key fetch failed:', error);
});

// Refresh PEM keys periodically (every 24 hours)
setInterval(() => {
  fetchCognitoKeys().catch(error => {
    logger.error('PEM key refresh failed:', error);
  });
}, 24 * 60 * 60 * 1000);

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // Decode the JWT token header to get the key ID (kid)
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const kid = decodedHeader.header.kid;
    const pem = pems[kid];

    if (!pem) {
      // If PEM not found, try refreshing the keys
      await fetchCognitoKeys();
      if (!pems[kid]) {
        return res.status(401).json({ error: 'Invalid token signature' });
      }
    }

    // Verify the JWT token
    jwt.verify(token, pem, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        logger.error('Token verification failed:', err);
        return res.status(401).json({ error: 'Token verification failed' });
      }

      // Check token expiration
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        return res.status(401).json({ error: 'Token expired' });
      }

      // Add the decoded token to the request object
      req.user = decoded;
      next();
    });
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = {
  authenticateToken
}; 