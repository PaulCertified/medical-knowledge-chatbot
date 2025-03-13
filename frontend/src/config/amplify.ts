import { Amplify } from 'aws-amplify';

const REGION = process.env.REACT_APP_AWS_REGION || 'us-east-1';
const USER_POOL_ID = process.env.REACT_APP_COGNITO_USER_POOL_ID || 'us-east-1_03GdoUqYM';
const USER_POOL_WEB_CLIENT_ID = process.env.REACT_APP_COGNITO_CLIENT_ID || '6hi82s4s0lq420fa9jimtnmjuv';

Amplify.configure({
  Auth: {
    region: REGION,
    userPoolId: USER_POOL_ID,
    userPoolWebClientId: USER_POOL_WEB_CLIENT_ID,
    mandatorySignIn: true,
    authenticationFlowType: 'USER_SRP_AUTH',
  },
}); 