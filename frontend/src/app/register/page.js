'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Container, Typography, TextField, Button, Grid, 
  IconButton, InputAdornment, Card, Alert, CircularProgress, MenuItem
} from '@mui/material';
import { 
  Visibility, VisibilityOff, ArrowBack, PersonOutlined, LocalHospital, CheckCircle, RadioButtonUnchecked
} from '@mui/icons-material';
import { register, login } from '../../utils/api';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('Patient'); // 'Patient' or 'Physiotherapist'
  
  // Common
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Patient only
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');

  // Physio only
  const [licenseNumber, setLicenseNumber] = useState('');
  const [clinic, setClinic] = useState('');
  const [physioRole, setPhysioRole] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getPasswordRequirements = (pass) => {
    return {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
    };
  };

  const reqs = getPasswordRequirements(password);
  const getStrengthScore = () => {
    if (!password) return 0;
    let score = 0;
    if (reqs.length) score += 1;
    if (reqs.uppercase) score += 1;
    if (reqs.lowercase) score += 1;
    if (reqs.number) score += 1;
    
    if (score <= 2) return 1; // Weak
    if (score === 3) return 2; // Medium
    return 3; // Strong
  };

  const strengthScore = getStrengthScore();
  const strengthLabels = {
    0: { label: '', color: '#E5E7EB' },
    1: { label: 'Weak', color: '#EF4444' },
    2: { label: 'Medium', color: '#F59E0B' },
    3: { label: 'Strong', color: '#10B981' }
  };
  const currentStrength = strengthLabels[strengthScore];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!firstName || !lastName || !email || !password || !phone) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (role === 'Patient' && (!dateOfBirth || !gender || !address)) {
      setError('Please fill in all required patient fields.');
      setLoading(false);
      return;
    }

    if (role === 'Physiotherapist' && (!licenseNumber || !physioRole)) {
      setError('Please fill in all required physiotherapist fields.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (strengthScore < 3) {
      setError('Password does not meet strength requirements. It must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.');
      setLoading(false);
      return;
    }

    try {
      const userType = role.toLowerCase();
      const payload = {
        userType,
        firstName,
        lastName,
        email,
        password,
        phone
      };

      if (userType === 'patient') {
        payload.dateOfBirth = dateOfBirth;
        payload.gender = gender;
        payload.address = address;
      } else {
        payload.licenseNumber = licenseNumber;
        payload.clinic = clinic;
        payload.role = physioRole;
      }

      await register(payload);
      // Auto login after registration
      await login(email, password);
      if (userType === 'physiotherapist') {
        router.push('/physio-dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your credentials.');
      setLoading(false);
    }
  };

  // Simple array for the role selector
  const roles = [
    { id: 'Patient', icon: <PersonOutlined fontSize="small" /> },
    { id: 'Physiotherapist', icon: <LocalHospital fontSize="small" /> }
  ];

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
                src="/Register.png" 
                alt="Register Illustration" 
                sx={{ width: '100%', maxWidth: '150px', height: 'auto', objectFit: 'contain' }} 
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                Already have an account?
              </Typography>
              <Button 
                onClick={() => router.push('/login')}
                sx={{ textTransform: 'none', fontWeight: 600, color: '#10B981', fontSize: '0.9rem' }}
              >
                Sign in
              </Button>
            </Box>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '60%' }, backgroundColor: '#FFFFFF', p: { xs: 3, md: 4 }, position: 'relative' }}>
            
            <Button 
              size="small"
              startIcon={<ArrowBack />} 
              onClick={() => router.push('/')}
              sx={{ textTransform: 'none', color: '#6B7280', mb: 1, pl: 0, '&:hover': { backgroundColor: 'transparent', color: '#111827' } }}
            >
              Back to home
            </Button>

            <Typography variant="h5" sx={{ color: '#111827', mb: 0.5, fontWeight: 700 }}>
              Create an account
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
              Join Stawisha to start your care journey.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {roles.map((r) => (
                <Card
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: role === r.id ? '#10B981' : '#E5E7EB',
                    borderRadius: '12px',
                    backgroundColor: role === r.id ? '#ECFDF5' : '#FFFFFF',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Box sx={{ 
                    color: role === r.id ? '#10B981' : '#6B7280',
                    display: 'flex'
                  }}>
                    {r.icon}
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: role === r.id ? '#065F46' : '#374151', lineHeight: 1.2 }}>
                      {r.id}
                    </Typography>
                  </Box>
                  <Box>
                    {role === r.id ? 
                      <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} /> : 
                      <RadioButtonUnchecked sx={{ color: '#D1D5DB', fontSize: 20 }} />
                    }
                  </Box>
                </Card>
              ))}
            </Box>

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

            <form onSubmit={handleRegister}>
              <Grid container spacing={1.5}>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>First Name<span style={{ color: '#EF4444' }}> *</span></Typography>
                  <TextField 
                    fullWidth 
                    size="small"
                    placeholder="John" 
                    variant="outlined" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Last Name<span style={{ color: '#EF4444' }}> *</span></Typography>
                  <TextField 
                    fullWidth 
                    size="small"
                    placeholder="Doe" 
                    variant="outlined" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Email address<span style={{ color: '#EF4444' }}> *</span></Typography>
                  <TextField 
                    fullWidth 
                    size="small"
                    placeholder="john.doe@email.com" 
                    variant="outlined" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Phone Number<span style={{ color: '#EF4444' }}> *</span></Typography>
                  <TextField 
                    fullWidth 
                    size="small"
                    placeholder="+254 700 000 000" 
                    variant="outlined" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
                  />
                </Grid>

                {role === 'Patient' ? (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Date of Birth<span style={{ color: '#EF4444' }}> *</span></Typography>
                      <TextField 
                        fullWidth 
                        size="small"
                        type="date"
                        variant="outlined" 
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Gender<span style={{ color: '#EF4444' }}> *</span></Typography>
                      <TextField 
                        fullWidth 
                        select
                        size="small"
                        variant="outlined" 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Physical Address<span style={{ color: '#EF4444' }}> *</span></Typography>
                      <TextField 
                        fullWidth 
                        size="small"
                        placeholder="Nairobi, Kenya" 
                        variant="outlined" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>License Number<span style={{ color: '#EF4444' }}> *</span></Typography>
                      <TextField 
                        fullWidth 
                        size="small"
                        placeholder="e.g. PHY-12345" 
                        variant="outlined" 
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Job Title/Role<span style={{ color: '#EF4444' }}> *</span></Typography>
                      <TextField 
                        fullWidth 
                        size="small"
                        placeholder="e.g. Sports Therapist" 
                        variant="outlined" 
                        value={physioRole}
                        onChange={(e) => setPhysioRole(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Clinic Name</Typography>
                      <TextField 
                        fullWidth 
                        size="small"
                        placeholder="e.g. Stawisha Wellness" 
                        variant="outlined" 
                        value={clinic}
                        onChange={(e) => setClinic(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Password<span style={{ color: '#EF4444' }}> *</span></Typography>
                  <TextField 
                    fullWidth 
                    size="small"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••" 
                    variant="outlined" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
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
                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <Box sx={{ mt: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem' }}>Password Strength</Typography>
                        <Typography variant="caption" sx={{ color: currentStrength.color, fontWeight: 600, fontSize: '0.7rem' }}>{currentStrength.label}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {[1, 2, 3, 4].map((level) => (
                          <Box 
                            key={level}
                            sx={{ 
                              height: 4, 
                              flex: 1, 
                              borderRadius: 2, 
                              backgroundColor: strengthScore >= level ? currentStrength.color : '#E5E7EB',
                              transition: 'all 0.3s'
                            }} 
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#374151', mb: 0.5, fontWeight: 600, display: 'block' }}>Confirm Password<span style={{ color: '#EF4444' }}> *</span></Typography>
                  <TextField 
                    fullWidth 
                    size="small"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••" 
                    variant="outlined" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#111827' } } }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                              {showConfirmPassword ? <Visibility fontSize="small" sx={{ color: '#6B7280' }} /> : <VisibilityOff fontSize="small" sx={{ color: '#6B7280' }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sx={{ mt: 1 }}>
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
                      '&:hover': { backgroundColor: '#1F2937', boxShadow: 'none' }
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Create Account'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
