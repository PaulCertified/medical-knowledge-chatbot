import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  code: Yup.string()
    .required('Verification code is required')
    .matches(/^\d+$/, 'Code must contain only numbers'),
  newPassword: Yup.string()
    .min(12, 'Password must be at least 12 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

interface ResetPasswordValues {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [error, setError] = useState<string>('');
  const [resetComplete, setResetComplete] = useState(false);

  const handleSubmit = async (values: ResetPasswordValues, { setSubmitting }: any) => {
    try {
      await resetPassword(values.email, values.code, values.newPassword);
      setResetComplete(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (resetComplete) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" align="center" gutterBottom>
              Password Reset Complete
            </Typography>
            <Typography align="center" paragraph>
              Your password has been successfully reset. You can now sign in with your new password.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/login"
              sx={{ mt: 2 }}
            >
              Sign In
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Reset Password
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography align="center" paragraph>
            Enter the verification code sent to your email and your new password.
          </Typography>

          <Formik
            initialValues={{
              email: '',
              code: '',
              newPassword: '',
              confirmPassword: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, touched, errors }) => (
              <Form>
                <Field
                  name="email"
                  as={TextField}
                  label="Email Address"
                  fullWidth
                  margin="normal"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />

                <Field
                  name="code"
                  as={TextField}
                  label="Verification Code"
                  fullWidth
                  margin="normal"
                  error={touched.code && Boolean(errors.code)}
                  helperText={touched.code && errors.code}
                />

                <Field
                  name="newPassword"
                  as={TextField}
                  label="New Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={touched.newPassword && Boolean(errors.newPassword)}
                  helperText={touched.newPassword && errors.newPassword}
                />

                <Field
                  name="confirmPassword"
                  as={TextField}
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Reset Password'}
                </Button>

                <Box sx={{ mt: 2 }}>
                  <Link component={RouterLink} to="/login" variant="body2">
                    {"Back to Sign In"}
                  </Link>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword; 