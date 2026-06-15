'use client';

import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#171717',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
        },
        success: {
          iconTheme: { primary: '#16a34a', secondary: '#ffffff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
        },
      }}
    />
  );
}
