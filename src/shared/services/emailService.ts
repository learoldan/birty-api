import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailParams {
    to: string
    subject: string
    html: string
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
    const from = process.env.RESEND_FROM_EMAIL || 'Birty <noreply@birty.app>'

    const { error } = await resend.emails.send({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
    })

    if (error) {
        throw new Error(
            `Failed to send email to ${params.to}: ${error.message}`,
        )
    }
}
