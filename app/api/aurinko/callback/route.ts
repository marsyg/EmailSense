// /api/aurinko/callback
import { exchangeCodeForAccessToken, getAccountDetails } from '@/lib/aurinko';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
  console.log('--- Aurinko OAuth Callback ---');

  // // Authentication Check
  const { userId } = await auth();
  if (!userId) {
    console.error('User is not authenticated');
    return NextResponse.json({ message: 'Unauthorized', status: 401 });
  } else {
    console.log('User authenticated:', userId);
  }

  // // Get Parameters from URL
  const params = req.nextUrl.searchParams;
  // const status = params.get('status');
  // if (status !== 'success') {
  //   console.error('Failed to link account. Status:', status);
  //   return NextResponse.json({
  //     message: 'Failed to link account',
  //     status: 400,
  //   });
  // } else {
  //   console.log('Status parameter:', status);
  // }

  // // Get Authorization Code
  const code = params.get('code');
  if (!code) {
    console.error('No authorization code provided');
    return NextResponse.json({ message: 'No code provided', status: 400 });
  } else {
    console.log('Authorization code:', code);
  }

  // // Exchange Code for Access Token
  const tokenResponse = await exchangeCodeForAccessToken(code);
  if (!tokenResponse) {
    console.error('Failed to exchange code for access token');
    return NextResponse.json({
      message: 'Failed to exchange code for access token',
      status: 400,
    });
  } else {
    console.log('Access Token Response:', tokenResponse);
  }

  // // Get Account Details
  // const accountDetails = await getAccountDetails(tokenResponse.accessToken);
  // if (!accountDetails) {
  //   console.error('Failed to get account details');
  //   // Consider retrying or handling the error differently
  //   return NextResponse.json({
  //     message: 'Failed to get account details',
  //     status: 500,
  //   });
  // } else {
  //   console.log('Account Details:', accountDetails);
  // }

  // // Update or Create Account in Prisma
  // await prisma.account.upsert({
  //   where: {
  //     id: tokenResponse.accountId.toString(),
  //   },
  //   update: {
  //     accessToken: tokenResponse.accessToken,
  //   },
  //   create: {
  //     id: tokenResponse.accountId.toString(),
  //     userId,
  //     emailAddress: accountDetails.email,
  //     name: accountDetails.name,
  //     accessToken: tokenResponse.accessToken,
  //   },
  // });
  // console.log('Account upserted in Prisma');

  // Redirect to Mail View
  return NextResponse.json({ msg: `${tokenResponse}` });
};
