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

export async function sendChangePasswordEmail(to: string, url: string) {
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
		subject: 'Reset Your Password',
		html: `<p>Please click the link below to change password:</p>
			 <a href="${url}">Verify</a>`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log('Password email sent successfully!');
	} catch (error) {
		console.error('Error sending password email:', error);
		throw new Error('Failed to send password email');
	}
}

export async function sendDeleteAccountEmail(to: string, reason: string) {
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
		subject: 'Account Deletion Information',
		html: `<p>Your account has been deleted for the following reason:</p>
			 <p>${reason}</p>`,
	};
	try {
		await transporter.sendMail(mailOptions);
		console.log('Account deletion email sent successfully!');
	} catch (error) {
		console.error('Error sending account deletion email:', error);
		throw new Error('Failed to send account deletion email');
	}
}
