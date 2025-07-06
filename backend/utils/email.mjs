import { Resend } from 'resend';

const resend = new Resend('re_bwqCxezL_GA2h2NHsUEVqBxkrmSKQWdZ1');

export async function sendConfirmationEmail(to, token) {
  const verifyUrl = `https://ti0jei-botros-7a22.twc1.net/api/auth/verify?token=${token}`;

  return resend.emails.send({
    from: 'noreply@fittelega.app',
    to,
    subject: 'Подтвердите ваш email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Подтверждение email</h2>
        <p>Для завершения регистрации нажмите на кнопку ниже:</p>
        <p>
          <a href="${verifyUrl}" style="padding: 10px 20px; background: #1E88E5; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
            Подтвердить email
          </a>
        </p>
        <p>Если кнопка не работает, скопируйте и вставьте эту ссылку в адресную строку:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>Если вы не регистрировались, просто проигнорируйте это письмо.</p>
      </div>
    `,
  });
}
