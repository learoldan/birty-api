import { ScheduledEvent } from 'aws-lambda'
import { DynamoBirthdayRepository } from '../../infrastructure/dynamoBirthdayRepository'
import { sendBirthdayEmails } from '../../application/sendBirthdayEmails'

const birthdayRepository = new DynamoBirthdayRepository()

export const handler = async (_event: ScheduledEvent): Promise<void> => {
    console.log('Running sendBirthdayEmails cron')
    await sendBirthdayEmails(birthdayRepository)
    console.log('sendBirthdayEmails cron finished')
}
