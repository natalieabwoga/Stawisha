'use client';

import { useRouter } from 'next/navigation';
import { 
  Container, Box, Typography, Button, Grid, Stack, Avatar, AppBar, Toolbar
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function LandingPage() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB', pb: 8 }}>
      
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'transparent', py: 1 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box 
              component="img" 
              src="/StawishaLogo.png" 
              alt="Stawisha Logo" 
              sx={{ height: '70px', objectFit: 'contain' }} 
            />
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Box 
          sx={{ 
            position: 'relative',
            borderRadius: '24px', 
            minHeight: '80vh',    
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,1) 35%, rgba(255,255,255,0.85) 55%, rgba(255,255,255,0) 75%), url('/landingPage.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            backgroundColor: '#FFFFFF'
          }}
        >
          <Container maxWidth="lg" sx={{ py: 8, zIndex: 2, position: 'relative' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Box sx={{ maxWidth: 650 }}>
                  
                  {/* COMPACT: Main Heading */}
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      color: '#111827', 
                      fontWeight: 800,
                      fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                      lineHeight: 1.1,
                      letterSpacing: '-1px',
                      mb: 2
                    }}
                  >
                    Your <span style={{ color: '#10B981' }}>recovery</span> doesn't take a vacation.
                  </Typography>

                  {/* COMPACT: Subheading */}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#4B5563', 
                      fontSize: '1.15rem',
                      fontWeight: 400,
                      lineHeight: 1.5,
                      mb: 4 
                    }}
                  >
                    Stawisha ensures your care continues, wherever life takes you.
                  </Typography>

                  <Stack spacing={3} sx={{ mb: 4 }}>
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Avatar sx={{ bgcolor: '#ECFDF5', color: '#10B981', width: 48, height: 48, borderRadius: '12px', mr: 2 }}>
                        <PublicIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: '#111827', fontWeight: 600, lineHeight: 1.2, fontSize: '1.1rem' }}>
                          Global Care Network
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, fontSize: '0.95rem' }}>
                          Find trusted physiotherapists wherever you are.
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Avatar sx={{ bgcolor: '#ECFDF5', color: '#10B981', width: 48, height: 48, borderRadius: '12px', mr: 2 }}>
                        <FolderSharedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: '#111827', fontWeight: 600, lineHeight: 1.2, fontSize: '1.1rem' }}>
                          Easy Record Transfer
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, fontSize: '0.95rem' }}>
                          Your medical records, securely shared in minutes.
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Avatar sx={{ bgcolor: '#ECFDF5', color: '#10B981', width: 48, height: 48, borderRadius: '12px', mr: 2 }}>
                        <CalendarMonthIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: '#111827', fontWeight: 600, lineHeight: 1.2, fontSize: '1.1rem' }}>
                          Stay on Track
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, fontSize: '0.95rem' }}>
                          Book appointments and manage your recovery with ease.
                        </Typography>
                      </Box>
                    </Box>

                  </Stack>

                  <Button 
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => router.push('/register')}
                    sx={{ 
                      backgroundColor: '#111827',
                      color: '#FFFFFF',
                      padding: '12px 32px',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      '&:hover': {
                        backgroundColor: '#1F2937',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                      }
                    }}
                  >
                    Get Started
                  </Button>

                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Container>
    </Box>
  );
}
