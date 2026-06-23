'use client';

import * as React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Stawisha brand palette — kept in one place so every page (existing and new)
// draws from the same tokens instead of re-declaring hex values everywhere.
export const stawishaPalette = {
  ink: '#111827',
  inkHover: '#1F2937',
  body: '#374151',
  muted: '#6B7280',
  faint: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  emerald: '#10B981',
  emeraldDark: '#065F46',
  emeraldSoft: '#ECFDF5',
  amber: '#F59E0B',
  red: '#EF4444',
  blue: '#3B82F6',
  blueSoft: '#EFF6FF',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: stawishaPalette.ink, contrastText: '#FFFFFF' },
    secondary: { main: stawishaPalette.emerald, contrastText: '#FFFFFF' },
    error: { main: stawishaPalette.red },
    warning: { main: stawishaPalette.amber },
    success: { main: stawishaPalette.emerald },
    background: { default: stawishaPalette.background, paper: stawishaPalette.surface },
    text: { primary: stawishaPalette.ink, secondary: stawishaPalette.muted },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});

export default function ThemeRegistry({ children }) {
  const [cache] = React.useState(() => {
    const c = createCache({ key: 'mui' });
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => {
    const names = Object.keys(cache.inserted).join(' ');
    if (!names) return null;
    return (
      <style
        data-emotion={`${cache.key} ${names}`}
        dangerouslySetInnerHTML={{
          __html: Object.values(cache.inserted).join(' '),
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
