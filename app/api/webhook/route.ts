import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
export const POST = async (req: Request) => {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      'Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }
  const wh = new Webhook(SIGNING_SECRET);
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    });
  }
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  // try {
  //   evt = wh.verify(body, {
  //     'svix-id': svix_id,
  //     'svix-timestamp': svix_timestamp,
  //     'svix-signature': svix_signature,
  //   }) as WebhookEvent;
  // } catch (err) {
  //   console.error('Error: Could not verify webhook:', err);
  //   return new Response('Error: Verification error', {
  //     status: 400,
  //   });
  // }
  // const eventType = evt.type;

  try {
    const { email_addresses, first_name, last_name, image_url, id } =
      payload.data;
    console.log(payload.data);
    const emailAddress = email_addresses?.[0]?.email_address;
    const firstName = first_name;
    const lastName = last_name || 'empty';
    const imgUrl = image_url;
    console.log(emailAddress);
    console.log(firstName);
    console.log(lastName);
    console.log(imgUrl);

    if (!emailAddress || !firstName || !lastName || !imgUrl || !id) {
      throw new Error('Missing required fields in the request payload');
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        id: id,
        emailAddress: emailAddress,
        firstName: firstName,
        lastName: lastName,
        imageUrl: imgUrl,
      },
    });

    console.log('User created:', user);
    return new Response('Webhook received and user created', { status: 200 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return new Response('Error processing webhook', { status: 500 });
  }
};
