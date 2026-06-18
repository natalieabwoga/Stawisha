'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Container, Typography, TextField, Button, 
  Card, Alert 
} from '@mui/material';
import { 
  ArrowBack, VerifiedUser 
} from '@mui/icons-material';
import { forgotPassword } from '../../utils/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setSuccess(data.message || 'Reset link sent successfully. Please check your email.');
    } catch (err) {
      setError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
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
                src="/ForgotPassword.png" 
                alt="Forgot Password Illustration" 
                sx={{ width: '100%', maxWidth: '180px', height: 'auto', objectFit: 'contain' }} 
              />
            </Box>

            {/* Back to Login Link */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                Remember your password?
              </Typography>
              <Button 
                onClick={() => router.push('/login')}
                sx={{ textTransform: 'none', fontWeight: 600, color: '#10B981', fontSize: '0.9rem' }}
              >
                Sign in
              </Button>
            </Box>
          </Box>

          {/* RIGHT COLUMN: The Form */}
          <Box sx={{ width: { xs: '100%', md: '60%' }, backgroundColor: '#FFFFFF', p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column' }}>
            
            {/* Back to Sign In */}
            <Button 
              size="small"
              startIcon={<ArrowBack />} 
              onClick={() => router.push('/login')}
              sx={{ textTransform: 'none', color: '#6B7280', mb: 2, pl: 0, alignSelf: 'flex-start', '&:hover': { backgroundColor: 'transparent', color: '#111827' } }}
            >
              Back to sign in
            </Button>

            <Typography variant="h5" sx={{ color: '#111827', mb: 0.5, fontWeight: 700 }}>
              Reset your password
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              No worries! Enter your email and we'll send you a link to reset your password.
            </Typography>

            <form onSubmit={handleSubmit}>
              
              {/* Messages */}
              {error && <Alert severity="error" sx={{ mb: 2, py: 0, borderRadius: '8px' }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2, py: 0, borderRadius: '8px' }}>{success}</Alert>}

              {/* Email Field */}
              <Typography variant="subtitle2" sx={{ color: '#374151', mb: 0.5, fontWeight: 600 }}>Email address</Typography>
              <TextField 
                fullWidth 
                size="small"
                placeholder="john.doe@email.com" 
                variant="outlined" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />

              {/* Submit Button */}
              <Button 
                type="submit"
                disabled={loading}
                fullWidth 
                variant="contained" 
                sx={{ 
                  backgroundColor: '#111827', 
                  color: 'white', 
                  py: 1, 
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: 'none',
                  mb: 3,
                  '&:hover': { backgroundColor: '#1F2937', boxShadow: 'none' }
                }}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>

              {/* Security Alert Box */}
              <Box 
                sx={{ 
                  backgroundColor: '#ECFDF5', 
                  borderRadius: '12px', 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'flex-start' 
                }}
              >
                <VerifiedUser sx={{ color: '#10B981', mr: 2, mt: 0.2 }} />
                <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.5 }}>
                  We'll send a secure link to your email address. Please check your inbox and spam folder.
                </Typography>
              </Box>

            </form>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
