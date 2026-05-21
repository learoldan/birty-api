import { MonthDay } from '../domain/birthday'
import { IBirthdayRepository } from '../domain/birthday.repository'
import { sendEmail } from '../../shared/services/emailService'

function buildBirthdayEmailHtml(
    userName: string,
    birthdayName: string,
): string {
    return `<!DOCTYPE html>
<html lang="es">
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
    <h2 style="color: #e85d04;">🎂 Hoy es el cumpleaños de ${birthdayName}</h2>
    <p>Hola <strong>${userName}</strong>,</p>
    <p>Recuerda que hoy es el cumpleaños de <strong>${birthdayName}</strong>. ¡No olvides enviarle un saludo!</p>
    <br>
    <small style="color: #aaa;">— Birty</small>
</body>
</html>`
}

export async function sendBirthdayEmails(
    birthdayRepository: IBirthdayRepository,
): Promise<void> {
    const now = new Date()
    const today = MonthDay.fromString(
        `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    )

    const birthdays = await birthdayRepository.findByBirthDate(today)

    if (birthdays.length === 0) return

    const results = await Promise.allSettled(
        birthdays.map((birthday) =>
            sendEmail({
                to: birthday.getUserEmail(),
                subject: `🎂 Hoy es el cumpleaños de ${birthday.getName()}`,
                html: buildBirthdayEmailHtml(
                    birthday.getUserName(),
                    birthday.getName(),
                ),
            }),
        ),
    )

    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.error(
                `Failed to send birthday email for birthday ${birthdays[index].getId().getValue()}:`,
                result.reason,
            )
        }
    })
}
