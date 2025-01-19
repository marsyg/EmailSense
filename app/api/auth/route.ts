import { NextResponse } from 'next/server';
import { getOAuth2Client } from '../../../lib/gmail';
import { redirect } from 'next/navigation';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = `http://localhost:3000/api/auth/callback`;
const oAuth2Client = getOAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
export async function GET(request: Request) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
  });

  return redirect(authUrl);
}
