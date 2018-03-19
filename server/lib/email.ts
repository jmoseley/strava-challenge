import { MailService } from '@sendgrid/mail';

// TODO: We need a domain!
const sourceEmail = 'jeremy@jeremymoseley.net';

export enum EMAIL_TEMPLATES {
  CHALLENGE_INVITE = 'ee409f8f-4d1b-4b67-ab2f-1df34de5af04',
}

// So far this is generic for all templates. We should figure out a way to pair the right types to the right
// template ID.
// Maybe we want to persist the templates as code? https://github.com/niftylettuce/email-templates
export interface EmailSubstitutions {
  inviter: {
    fullName: string;
  };
  acceptUrl: string;
  challenge: {
    name: string;
    distanceMiles: number;
  };
  [key: string]: any;
}

export interface Recipient {
  name: string;
  email: string;
}

export interface SendEmailArgs {
  subject?: string;
  recipients: (string | Recipient)[];
  templateId: EMAIL_TEMPLATES;
  substitutions: EmailSubstitutions;
}

export async function sendEmail({
  subject,
  recipients,
  templateId,
  substitutions,
}: SendEmailArgs): Promise<void> {
  if (!isEmailEnabled()) {
    console.info(`Sending email is disabled.`);
    console.info(`Subject: `, subject);
    console.info(`Template ID: `, templateId);
    console.info(`Substitutions: `, substitutions);
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
    templateId,
    substitutions,
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
