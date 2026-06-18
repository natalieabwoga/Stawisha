'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, Container, Typography, TextField, Button, 
  Card, Alert, InputAdornment, IconButton, LinearProgress
} from '@mui/material';
import { 
  ArrowBack, VerifiedUser, Visibility, VisibilityOff
} from '@mui/icons-material';
import { resetPassword } from '../../utils/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Strength calculation
  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[a-z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    return score;
  };

  const strength = calculateStrength(password);
  
  let progressColor = '#EF4444'; // Red for weak
  let strengthLabel = 'Weak';
  if (strength >= 50) { progressColor = '#F59E0B'; strengthLabel = 'Medium'; } // Orange for medium
  if (strength === 100) { progressColor = '#10B981'; strengthLabel = 'Strong'; } // Green for strong

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (strength < 100) {
      setError('Password does not meet all security requirements.');
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword(token, password);
      setSuccess(data.message);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
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
          {/* LEFT COLUMN */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%', justifyContent: 'center' }}>
              <Box 
                component="img" 
                src="/StawishaLogo.png" 
                alt="Stawisha Logo" 
                sx={{ height: '70px', objectFit: 'contain' }} 
              />
            </Box>

            <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Box 
                component="img" 
                src="/Login.png" 
                alt="Reset Password" 
                sx={{ width: '100%', maxWidth: '180px', height: 'auto', objectFit: 'contain' }} 
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button 
                onClick={() => router.push('/login')}
                sx={{ textTransform: 'none', fontWeight: 600, color: '#10B981', fontSize: '0.9rem' }}
              >
                Return to Login
              </Button>
            </Box>
          </Box>

          {/* RIGHT COLUMN */}
          <Box sx={{ width: { xs: '100%', md: '60%' }, backgroundColor: '#FFFFFF', p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column' }}>
            
            <Typography variant="h5" sx={{ color: '#111827', mb: 0.5, fontWeight: 700 }}>
              Set new password
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              Your new password must be different from previous used passwords.
            </Typography>

            <form onSubmit={handleSubmit}>
              
              {/* Messages */}
              {error && <Alert severity="error" sx={{ mb: 2, py: 0, borderRadius: '8px' }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2, py: 0, borderRadius: '8px' }}>{success} Redirecting to login...</Alert>}

              {/* Password Field */}
              <Typography variant="subtitle2" sx={{ color: '#374151', mb: 0.5, fontWeight: 600 }}>New Password</Typography>
              <TextField 
                fullWidth 
                size="small"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••" 
                variant="outlined" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <Visibility fontSize="small" sx={{ color: '#6B7280' }} /> : <VisibilityOff fontSize="small" sx={{ color: '#6B7280' }} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Password Strength</Typography>
                    <Typography variant="caption" sx={{ color: progressColor, fontWeight: 700 }}>{strengthLabel}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={strength} 
                    sx={{ 
                      height: 4, 
                      borderRadius: 2, 
                      backgroundColor: '#E5E7EB',
                      '& .MuiLinearProgress-bar': { backgroundColor: progressColor }
                    }} 
                  />
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 0.5, lineHeight: 1.3 }}>
                    Must be at least 8 characters, and contain 1 uppercase letter, 1 lowercase letter, and 1 number.
                  </Typography>
                </Box>
              )}
              {password.length === 0 && <Box sx={{ mb: 2 }} />}

              {/* Confirm Password Field */}
              <Typography variant="subtitle2" sx={{ color: '#374151', mb: 0.5, fontWeight: 600 }}>Confirm Password</Typography>
              <TextField 
                fullWidth 
                size="small"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••" 
                variant="outlined" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <Visibility fontSize="small" sx={{ color: '#6B7280' }} /> : <VisibilityOff fontSize="small" sx={{ color: '#6B7280' }} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
              />

              {/* Submit Button */}
              <Button 
                type="submit"
                disabled={loading || !token}
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
                  mb: 1,
                  '&:hover': { backgroundColor: '#1F2937', boxShadow: 'none' }
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>

            </form>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LinearProgress sx={{ width: '50%' }} /></Box>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
