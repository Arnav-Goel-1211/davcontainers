import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, phone, product, message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ message: 'Name, phone, and message are required' });
    }

    const targetEmail = process.env.CONTACT_EMAIL || 'test@example.com';

    const { data, error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: [targetEmail],
      subject: `New Inquiry from ${name} - ${product}`,
      text: `Name: ${name}\nPhone: ${phone}\nProduct Interest: ${product}\n\nMessage:\n${message}`,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ success: false, message: 'Error sending email', error: error.message });
  }
}
