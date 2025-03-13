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
});

interface ForgotPasswordValues {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [error, setError] = useState<string>('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (values: ForgotPasswordValues, { setSubmitting }: any) => {
    try {
      await forgotPassword(values.email);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (resetSent) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" align="center" gutterBottom>
              Reset Code Sent
            </Typography>
            <Typography align="center" paragraph>
              Please check your email for the password reset code. You will be redirected to reset your password.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/reset-password"
              sx={{ mt: 2 }}
            >
              Reset Password
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
            Forgot Password
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography align="center" paragraph>
            Enter your email address and we'll send you a code to reset your password.
          </Typography>

          <Formik
            initialValues={{
              email: '',
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

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Send Reset Code'}
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

export default ForgotPassword; 