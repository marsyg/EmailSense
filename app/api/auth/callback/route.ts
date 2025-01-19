import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client, listEmails } from '../../../../lib/gmail';

const CLIENT_ID = process.env.CLIENT_ID!;
const CLIENT_SECRET = process.env.CLIENT_SECRET!;
const REDIRECT_URI = `http://localhost:3000/api/auth/callback`;

const oAuth2Client = getOAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'Authorization code is missing' },
      { status: 400 }
    );
  }

  try {
    // Exchange the authorization code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Fetch emails using the Gmail API
    const emails = await listEmails(oAuth2Client);

    return NextResponse.json(emails, { status: 200 });
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
