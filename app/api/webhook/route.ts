import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const POST = async (req: Request) => {
  try {
    const { data } = await req.json();
    const { email_addresses, first_name, last_name, image_url, id } = data;

    // Validate and extract fields
   const emailAddress = email_addresses?.[0]?.email_address;
   const firstName = first_name;
   const lastName = last_name;
   const imgUrl = image_url;


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
