'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Container, Typography, TextField, Button, 
  IconButton, InputAdornment, Card, Link, Checkbox, 
  FormControlLabel, Alert, CircularProgress
} from '@mui/material';
import { 
  Visibility, VisibilityOff, ArrowBack
} from '@mui/icons-material';
import { login } from '../../utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('registered') === 'true') {
        setSuccessMessage('Registration successful! Please give us a few minutes to verify your credentials. An email will be sent once verified.');
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const data = await login(email, password);
      if (data?.role === 'physiotherapist') {
        router.push('/physio-dashboard');
      } else {
        router.push('/dashboard'); 
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', py: 4 }}>
      <Container maxWidth="md">
        <Card 
          elevation={0} 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
            border: '1px solid #F3F4F6'
          }}
        >
          {/* LEFT COLUMN: Branding & Illustration */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: '40%' }, 
              backgroundColor: '#FFFFFF', 
              borderRight: { md: '1px solid #F3F4F6' },
              borderBottom: { xs: '1px solid #F3F4F6', md: 'none' },
              p: { xs: 3, md: 4 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%', justifyContent: 'center' }}>
              <Box 
                component="img" 
                src="/StawishaLogo.png" 
                alt="Stawisha Logo" 
                sx={{ height: '70px', objectFit: 'contain' }} 
              />
            </Box>

            {/* Brand Illustration */}
            <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Box 
                component="img" 
                src="/Login.png" 
                alt="Login Illustration" 
                sx={{ width: '100%', maxWidth: '180px', height: 'auto', objectFit: 'contain' }} 
              />
            </Box>

            {/* Registration Link */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                Don't have an account?
              </Typography>
              <Button 
                onClick={() => router.push('/register')}
                sx={{ textTransform: 'none', fontWeight: 600, color: '#10B981', fontSize: '0.9rem' }}
              >
                Sign up
              </Button>
            </Box>
          </Box>

          {/* RIGHT COLUMN: The Login Form */}
          <Box sx={{ width: { xs: '100%', md: '60%' }, backgroundColor: '#FFFFFF', p: { xs: 3, md: 4 } }}>
            
            {/* Back to Home */}
            <Button 
              size="small"
              startIcon={<ArrowBack />} 
              onClick={() => router.push('/')}
              sx={{ textTransform: 'none', color: '#6B7280', mb: 2, pl: 0, '&:hover': { backgroundColor: 'transparent', color: '#111827' } }}
            >
              Back to home
            </Button>

            <Typography variant="h5" sx={{ color: '#111827', mb: 0.5, fontWeight: 700 }}>
              Welcome back
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              Sign in to continue your care journey.
            </Typography>

            {successMessage && (
              <Alert 
                severity="success" 
                variant="outlined"
                sx={{ 
                  mb: 2, 
                  py: 0,
                  borderRadius: '8px',
                  color: '#10B981',
                  borderColor: '#10B981'
                }}
              >
                {successMessage}
              </Alert>
            )}

            {error && (
              <Alert 
                severity="error" 
                variant="outlined"
                sx={{ 
                  mb: 2, 
                  py: 0,
                  borderRadius: '8px',
                  color: '#ef4444',
                  borderColor: '#ef4444'
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              
              {/* Email Field */}
              <Typography variant="subtitle2" sx={{ color: '#374151', mb: 0.5, fontWeight: 600 }}>Email address</Typography>
              <TextField 
                fullWidth 
                size="small"
                placeholder="john.doe@email.com" 
                variant="outlined" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />

              {/* Password Field with Inline Forgot Password Link */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 600 }}>Password</Typography>
                <Link 
                  onClick={() => router.push('/forgot-password')} 
                  underline="hover" 
                  sx={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Forgot password?
                </Link>
              </Box>
              <TextField 
                fullWidth 
                size="small"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••" 
                variant="outlined" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <Visibility fontSize="small" sx={{ color: '#6B7280' }} /> : <VisibilityOff fontSize="small" sx={{ color: '#6B7280' }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Remember Me Checkbox */}
              <FormControlLabel 
                control={<Checkbox size="small" sx={{ color: '#10B981', '&.Mui-checked': { color: '#10B981' }, py: 0.5 }} />} 
                label={<Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 500 }}>Remember me</Typography>} 
                sx={{ mb: 3 }}
              />

              {/* Submit Button */}
              <Button 
                type="submit"
                fullWidth 
                variant="contained" 
                disabled={loading}
                sx={{ 
                  backgroundColor: '#111827', 
                  color: 'white', 
                  py: 1, 
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: 'none',
                  mb: 1,
                  '&:hover': { backgroundColor: '#1F2937', boxShadow: 'none' }
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Sign in'}
              </Button>

            </form>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
