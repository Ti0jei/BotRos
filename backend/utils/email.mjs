import { Resend } from 'resend';

const resend = new Resend('re_bwqCxezL_GA2h2NHsUEVqBxkrmSKQWdZ1');

export async function sendConfirmationEmail(to, token) {
  const confirmUrl = `https://bot-ros-frontend.vercel.app/confirm?token=${token}`;

  return resend.emails.send({
    from: 'noreply@fittelega.app',
    to,
    subject: 'Подтвердите ваш email',
    html: `
      <h2>Подтверждение email</h2>
      <p>Для завершения регистрации нажмите на кнопку ниже:</p>
      <a href="${confirmUrl}" style="padding: 10px 20px; background: #1E88E5; color: white; text-decoration: none; border-radius: 5px;">Подтвердить</a>
      <p>Если вы не регистрировались, просто проигнорируйте это письмо.</p>
    `
  });
}
