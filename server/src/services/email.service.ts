// Sends follow-up reminder emails through Gmail SMTP

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendFollowUpReminderEmail = async (
    to: string, 
    companyName: string, 
    role: string,
    status: string,
) => {
    try {
        const info = await transporter.sendMail({
            from: `"ApplyPilot Team" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Follow up reminder: ${companyName} - ${role}`,
            html: `
                <h2>Follow-up Reminder</h2>

                <p>
                    You set a follow-up reminder for
                    ${companyName} / ${role}
                </p>

                <p>Status: ${status}</p>
            `,
        });

        console.log("Message sent: %s", info.messageId);

    } catch (err) {
        console.error("Error while sending mail:", err);
    }
};