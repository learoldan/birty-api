import { MonthDay } from '../domain/birthday'
import { IReminderRepository } from '../domain/reminder.repository'
import { sendEmail } from '../../shared/services/emailService'

function buildReminderEmailHtml(
    userName: string,
    birthdayName: string,
): string {
    return `<!DOCTYPE html>
<html lang="es">
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
    <h2 style="color: #3a86ff;">🔔 Recuerda el cumpleaños de ${birthdayName}</h2>
    <p>Hola <strong>${userName}</strong>,</p>
    <p>Recuerda que se acerca el cumpleaños de <strong>${birthdayName}</strong>. ¡No olvides enviarle un saludo cuando llegue el día!</p>
    <br>
    <small style="color: #aaa;">— Birty</small>
</body>
</html>`
}

export async function sendReminderEmails(
    reminderRepository: IReminderRepository,
): Promise<void> {
    const now = new Date()
    const today = MonthDay.fromString(
        `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    )

    const reminders = await reminderRepository.findByAlertDate(today)

    if (reminders.length === 0) return

    const results = await Promise.allSettled(
        reminders.map((reminder) =>
            sendEmail({
                to: reminder.getUserEmail(),
                subject: `🔔 Recuerda el cumpleaños de ${reminder.getBirthdayName()}`,
                html: buildReminderEmailHtml(
                    reminder.getUserName(),
                    reminder.getBirthdayName(),
                ),
            }),
        ),
    )

    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.error(
                `Failed to send reminder email for birthdayId ${reminders[index].getBirthdayId()}:`,
                result.reason,
            )
        }
    })
}
