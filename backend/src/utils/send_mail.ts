import nodemailer from 'npm:nodemailer';

export async function sendVerificationEmail(to: string, url: string) {
	const transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: 'your-email@gmail.com',
			pass: 'your-email-password',
		},
	});

	const mailOptions = {
		from: 'your-email@gmail.com',
		to,
		subject: 'Email Verification',
		html: `<p>Please verify your email by clicking the link below:</p>
			 <a href="${url}">${url}</a>`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log('Verification email sent successfully!');
	} catch (error) {
		console.error('Error sending verification email:', error);
		throw new Error('Failed to send verification email');
	}
}
