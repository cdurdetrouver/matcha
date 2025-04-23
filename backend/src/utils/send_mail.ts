import nodemailer from 'npm:nodemailer';
import { GMAIL_PASS, GMAIL_EMAIL } from '../secret.ts';

export async function sendVerificationEmail(to: string, url: string) {
	const transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: GMAIL_EMAIL,
			pass: GMAIL_PASS,
		},
	});

	const mailOptions = {
		from: GMAIL_EMAIL,
		to,
		subject: 'Email Verification',
		html: `<p>Please verify your email by clicking the link below:</p>
			 <a href="${url}">Verify</a>`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log('Verification email sent successfully!');
	} catch (error) {
		console.error('Error sending verification email:', error);
		throw new Error('Failed to send verification email');
	}
}
