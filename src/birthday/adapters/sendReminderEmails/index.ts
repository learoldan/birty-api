import { ScheduledEvent } from 'aws-lambda'
import { DynamoReminderRepository } from '../../infrastructure/dynamoReminderRepository'
import { sendReminderEmails } from '../../application/sendReminderEmails'

const reminderRepository = new DynamoReminderRepository()

export const handler = async (_event: ScheduledEvent): Promise<void> => {
    console.log('Running sendReminderEmails cron')
    await sendReminderEmails(reminderRepository)
    console.log('sendReminderEmails cron finished')
}
