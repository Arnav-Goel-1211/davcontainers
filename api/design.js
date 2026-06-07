import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      name, phone, email, company,
      boxType, dimensions, ply, quantity,
      printType, finish, notes
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const targetEmail = process.env.CONTACT_EMAIL || 'test@example.com';

    const formatVal = (val) => {
      if (!val) return 'N/A';
      return val.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #e61c38; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">📦 New Custom Package Request</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">From Design Your Package page</p>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #eee;">
          <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #e61c38; padding-bottom: 8px;">Contact Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888; width: 35%;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Phone</td><td style="padding: 8px 0; font-weight: 600;">${phone}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;">${email || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Company</td><td style="padding: 8px 0;">${company || 'N/A'}</td></tr>
          </table>
          
          <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #00b359; padding-bottom: 8px; margin-top: 25px;">Package Specifications</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888; width: 35%;">Box Type</td><td style="padding: 8px 0; font-weight: 600;">${formatVal(boxType)}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Dimensions</td><td style="padding: 8px 0; font-weight: 600;">${dimensions || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Board Ply</td><td style="padding: 8px 0;">${formatVal(ply)}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Quantity</td><td style="padding: 8px 0; font-weight: 600;">${quantity ? Number(quantity).toLocaleString() + ' units' : 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Printing</td><td style="padding: 8px 0;">${formatVal(printType)}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Surface Finish</td><td style="padding: 8px 0;">${formatVal(finish)}</td></tr>
          </table>
          
          ${notes ? `
          <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #e61c38; padding-bottom: 8px; margin-top: 25px;">Special Requirements</h2>
          <p style="color: #555; line-height: 1.6;">${notes}</p>
          ` : ''}
        </div>
        <div style="background: #f8f8f8; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #eee; border-top: none;">
          <p style="color: #999; font-size: 12px; margin: 0;">Sent from DAV Containers — Design Your Package</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'DAV Containers <onboarding@resend.dev>',
      to: [targetEmail],
      subject: `📦 Custom Package Request from ${name} — ${formatVal(boxType)}`,
      html: emailHtml,
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
