const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ResendConfirmationCodeCommand,
  ConfirmSignUpCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const { validateEmail, validatePassword } = require('../security/validation');
const logger = require('../config/logger');

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

class AuthController {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate input
      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      if (!validatePassword(password)) {
        return res.status(400).json({ 
          error: 'Password must be at least 12 characters long and contain uppercase, lowercase, numbers, and special characters' 
        });
      }

      const command = new SignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'given_name', Value: firstName },
          { Name: 'family_name', Value: lastName }
        ]
      });

      const response = await client.send(command);
      logger.info(`User registration successful for email: ${email}`);

      res.status(201).json({
        message: 'Registration successful. Please check your email for verification code.',
        userSub: response.UserSub
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  }

  async confirmRegistration(req, res) {
    try {
      const { email, code } = req.body;

      const command = new ConfirmSignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: code
      });

      await client.send(command);
      logger.info(`Email verification successful for user: ${email}`);

      res.json({ message: 'Email verification successful. You can now log in.' });
    } catch (error) {
      logger.error('Confirmation error:', error);
      res.status(500).json({ error: 'Email verification failed. Please try again.' });
    }
  }

  async resendConfirmationCode(req, res) {
    try {
      const { email } = req.body;

      const command = new ResendConfirmationCodeCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: email
      });

      await client.send(command);
      logger.info(`Confirmation code resent to: ${email}`);

      res.json({ message: 'Verification code has been resent to your email.' });
    } catch (error) {
      logger.error('Resend confirmation code error:', error);
      res.status(500).json({ error: 'Failed to resend verification code. Please try again.' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      });

      const response = await client.send(command);
      logger.info(`User logged in successfully: ${email}`);

      res.json({
        message: 'Login successful',
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
        idToken: response.AuthenticationResult.IdToken,
        expiresIn: response.AuthenticationResult.ExpiresIn
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(401).json({ error: 'Login failed. Please check your credentials.' });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const command = new ForgotPasswordCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: email
      });

      await client.send(command);
      logger.info(`Password reset requested for: ${email}`);

      res.json({ message: 'Password reset code has been sent to your email.' });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to initiate password reset. Please try again.' });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, code, newPassword } = req.body;

      if (!validatePassword(newPassword)) {
        return res.status(400).json({ 
          error: 'Password must be at least 12 characters long and contain uppercase, lowercase, numbers, and special characters' 
        });
      }

      const command = new ConfirmForgotPasswordCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword
      });

      await client.send(command);
      logger.info(`Password reset successful for: ${email}`);

      res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password. Please try again.' });
    }
  }
}

module.exports = new AuthController(); 