'use client';
import { Button } from './ui/button';
import React from 'react';
import { getAurinkoAuthUrl } from '@/lib/aurinko';
import { useState } from 'react';
function LinkAccountButton() {
  const [url, setUrl] = useState('');
  console.log(url);
  return (
    <Button
      onClick={async () => {
        const authUrl = await getAurinkoAuthUrl('Google');
        setUrl(authUrl);
        console.log('clicked');
        console.log(authUrl);
        window.location.href = authUrl;
      }}
    >
      link account
    </Button>
  );
}

export default LinkAccountButton;
