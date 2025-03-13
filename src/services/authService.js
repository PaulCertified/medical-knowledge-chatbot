const { 
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const jwt = require('jsonwebtoken');

class AuthService {
  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.COGNITO_REGION
    });
    this.userPoolId = process.env.COGNITO_USER_POOL_ID;
    this.clientId = process.env.COGNITO_CLIENT_ID;
  }

  async signUp(username, password, email, userAttributes = {}) {
    try {
      const command = new SignUpCommand({
        ClientId: this.clientId,
        Username: username,
        Password: password,
        UserAttributes: [
          {
            Name: 'email',
            Value: email
          },
          ...Object.entries(userAttributes).map(([key, value]) => ({
            Name: key,
            Value: value
          }))
        ]
      });

      const response = await this.cognitoClient.send(command);
      return {
        success: true,
        userSub: response.UserSub,
        message: 'User registration successful. Please check your email for verification code.'
      };
    } catch (error) {
      console.error('Error in signUp:', error);
      throw new Error(error.message);
    }
  }

  async confirmSignUp(username, confirmationCode) {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: username,
        ConfirmationCode: confirmationCode
      });

      await this.cognitoClient.send(command);
      return {
        success: true,
        message: 'Email verification successful.'
      };
    } catch (error) {
      console.error('Error in confirmSignUp:', error);
      throw new Error(error.message);
    }
  }

  async signIn(username, password) {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password
        }
      });

      const response = await this.cognitoClient.send(command);
      return {
        success: true,
        tokens: {
          accessToken: response.AuthenticationResult.AccessToken,
          idToken: response.AuthenticationResult.IdToken,
          refreshToken: response.AuthenticationResult.RefreshToken
        }
      };
    } catch (error) {
      console.error('Error in signIn:', error);
      throw new Error(error.message);
    }
  }

  async forgotPassword(username) {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.clientId,
        Username: username
      });

      await this.cognitoClient.send(command);
      return {
        success: true,
        message: 'Password reset code sent to your email.'
      };
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      throw new Error(error.message);
    }
  }

  async confirmForgotPassword(username, confirmationCode, newPassword) {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.clientId,
        Username: username,
        ConfirmationCode: confirmationCode,
        Password: newPassword
      });

      await this.cognitoClient.send(command);
      return {
        success: true,
        message: 'Password reset successful.'
      };
    } catch (error) {
      console.error('Error in confirmForgotPassword:', error);
      throw new Error(error.message);
    }
  }

  verifyToken(token) {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return {
        valid: true,
        decoded
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  // Helper method to extract user information from Cognito tokens
  extractUserInfo(idToken) {
    try {
      const decoded = jwt.decode(idToken);
      return {
        userId: decoded.sub,
        email: decoded.email,
        username: decoded['cognito:username'],
        groups: decoded['cognito:groups'] || []
      };
    } catch (error) {
      console.error('Error extracting user info:', error);
      throw new Error('Invalid token format');
    }
  }
}

module.exports = new AuthService(); 