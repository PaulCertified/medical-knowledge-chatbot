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
  CircularProgress,
  Grid
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(12, 'Password must be at least 12 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  firstName: Yup.string()
    .required('First name is required'),
  lastName: Yup.string()
    .required('Last name is required'),
});

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState<string>('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (values: RegisterFormValues, { setSubmitting }: any) => {
    try {
      await register(values.email, values.password, values.firstName, values.lastName);
      setVerificationSent(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (verificationSent) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" align="center" gutterBottom>
              Verification Email Sent
            </Typography>
            <Typography align="center" paragraph>
              Please check your email to verify your account. Once verified, you can proceed to login.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/login"
              sx={{ mt: 2 }}
            >
              Go to Login
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
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Formik
            initialValues={{
              email: '',
              password: '',
              confirmPassword: '',
              firstName: '',
              lastName: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, touched, errors }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      name="firstName"
                      as={TextField}
                      label="First Name"
                      fullWidth
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      name="lastName"
                      as={TextField}
                      label="Last Name"
                      fullWidth
                      error={touched.lastName && Boolean(errors.lastName)}
                      helperText={touched.lastName && errors.lastName}
                    />
                  </Grid>
                </Grid>

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
                  name="password"
                  as={TextField}
                  label="Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                />

                <Field
                  name="confirmPassword"
                  as={TextField}
                  label="Confirm Password"
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
                  {isSubmitting ? <CircularProgress size={24} /> : 'Sign Up'}
                </Button>

                <Box sx={{ mt: 2 }}>
                  <Link component={RouterLink} to="/login" variant="body2">
                    {"Already have an account? Sign in"}
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

export default Register; 