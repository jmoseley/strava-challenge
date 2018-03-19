import { MailService } from '@sendgrid/mail';

// TODO: We need a domain!
const sourceEmail = 'jeremy@jeremymoseley.net';

export interface Recipient {
  name: string;
  email: string;
}

export interface SendEmailArgs {
  subject: string;
  text: string;
  html: string;
  recipients: (string | Recipient)[];
}

export async function sendEmail({
  subject,
  text,
  html,
  recipients,
}: SendEmailArgs): Promise<void> {
  if (!isEmailEnabled()) {
    console.info(`Sending email is disabled.`);
    console.info(`Subject: `, subject);
    console.info(`Text: `, text);
    console.info(`HTML: `, html);
    console.info(`Recipients: `, recipients);

    return;
  }
  const devEmail = getDevEmail();
  if (devEmail) {
    console.info(
      `Dev email target configured, rewriting recipients to ${devEmail}.`,
    );
    recipients = [devEmail];
  }
  console.info(
    `Sending email with subject '${subject}' to recipients ${recipients}.`,
  );
  const result = await MailService.sendMultiple({
    subject,
    text,
    html,
    to: recipients,
    from: sourceEmail,
  });
  console.info(`Email send result: ${JSON.stringify(result)}`);
}

function getDevEmail() {
  return process.env['DEV_EMAIL'];
}

function isEmailEnabled() {
  const haveApiKey = !!process.env['SENDGRID_API_KEY'];
  const enabled = Meteor.settings.email.enabled;
  const hasDevEmail = !!getDevEmail();

  return haveApiKey && (enabled || hasDevEmail);
}
