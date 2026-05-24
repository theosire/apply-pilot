// Runs a daily cron job that sends follow-up reminder emails 
// for applications due based on each user's timezone

import cron from 'node-cron';
import { DateTime } from 'luxon';
import { getApplicationByFollowUpDate } from '../services/applications.service';
import { sendFollowUpReminderEmail } from '../services/email.service';
import { User } from '../models/User.model';

export const startFollowUpReminder = () => {
    // Run every day at 8:00 AM
    cron.schedule("0 0 8 * * *", async () => {
        console.log("Follow-up cron running");

        const users = await User.find();

        for (const user of users) {
            const userTimezone = user.timezone || "America/Toronto";

            // Calculate today's date range using the user's local timezone
            const startOfToday = DateTime.now()
                .setZone(userTimezone)
                .startOf("day")
                .toJSDate();

            const endOfToday = DateTime.now()
                .setZone(userTimezone)
                .endOf("day")
                .toJSDate();

            const followUpApplications = await getApplicationByFollowUpDate(
                user._id.toString(),
                startOfToday, 
                endOfToday
            );

            console.log(
                `Follow-up applications found for ${user.email}:`,
                followUpApplications.length
            );

            // Send reminder emails for applications that need follow-up today
            for (const app of followUpApplications) {
                await sendFollowUpReminderEmail(
                    user.email, 
                    app.companyName, 
                    app.role, 
                    app.status
                );
            }
        }
    });
};