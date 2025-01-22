import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(req: NextResponse, res: NextResponse) {
  try {
    // Decode Pub/Sub notification
    const pubsubMessage = req.body.message.data;
    const decodedMessage = JSON.parse(
      Buffer.from(pubsubMessage, 'base64').toString('utf8')
    );
    const { historyId } = decodedMessage;
    console.log('Received historyId:', historyId);
    // Use the Gmail API to fetch changes
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const historyResponse = await gmail.users.history.list({
      userId: 'me',
      startHistoryId: historyId,
    });
    const changes = historyResponse.data.history || [];
    console.log('Mailbox changes:', changes);
    // Process new messages (if any)
    const newMessages = changes
      .flatMap((change) => change.messagesAdded || [])
      .map((item) => item.message);
    for (const message of newMessages) {
      const emailDetails = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });
      console.log('New email snippet:', emailDetails.data.snippet);
      // Save email to your database here
    }
    res.status(200).send('Notification processed successfully');
  } catch (error) {
    console.error('Error processing notification:', error);
    res.status(500).send('Error processing notification');
  }
}
