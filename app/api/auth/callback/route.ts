import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client, listEmails } from '../../../../lib/gmail';

import { google } from 'googleapis';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
const CLIENT_ID = process.env.CLIENT_ID!;
const CLIENT_SECRET = process.env.CLIENT_SECRET!;
const REDIRECT_URI = `http://localhost:3000/api/auth/callback`;

const oAuth2Client = getOAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'Authorization code is missing' },
      { status: 400 }
    );
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);

    oAuth2Client.setCredentials(tokens);

    // Fetch emails using the Gmail API
    const peopleService = google.people({ version: 'v1', auth: oAuth2Client });
    const response = await peopleService.people.get({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses',
    });

    const userDetails = response.data;

    // Extract name and email
    const name = userDetails.names?.[0]?.displayName || 'Name not found';
    const email = userDetails.emailAddresses?.[0]?.value || 'Email not found';

    await prisma.account.upsert({
      where: {
        id: tokens.id_token.toString(),
      },
      update: {
        accessToken: tokens.access_token || '',
      },
      create: {
        id: tokens.id_token.toString(),
        userId: userId,
        emailAddress: email,
        name: name,
        accessToken: tokens.access_token || '',
      },
    });
    // console.log('Account upserted in Prisma');
    const emails = await listEmails(oAuth2Client);

    return NextResponse.json(emails, { status: 200 });
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
