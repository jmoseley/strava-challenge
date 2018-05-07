import * as _ from 'lodash';
import * as sendgrid from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);
}
sendgrid.setSubstitutionWrappers('{{', '}}');

// TODO: We need a domain!
const sourceEmail = 'jeremy@jeremymoseley.net';

// This is used in the to field so batch emails are bcc'd and we always get a copy of emails that were sent
// for debugging purposes.
const toEmail = 'jeremy+challenge_emails@jeremymoseley.net';

export enum EMAIL_TEMPLATES {
  CHALLENGE_INVITE = 'ee409f8f-4d1b-4b67-ab2f-1df34de5af04',
  ACTIVITY_NOTIFICATION = '245bf3b2-f527-48a6-89bb-4a289a15aa06',
}

export interface ChallengeInviteEmailSubstitutions {
  inviterName: string;
  acceptUrl: string;
  challengeName: string;
  challengeDistanceMiles: number;
}

export interface ActivityNotificationEmailSubstitutions {
  challengerName: string;
  challengerMiles: string;
  // challengerPercentage: string;
  // receiverMiles: string;
  // receiverPercentage: string;
  challengeName: string;
}

export interface Recipient {
  name: string;
  email: string;
}

export interface SendEmailArgs {
  subject?: string;
  recipients: (string | Recipient)[];
}

export async function sendChallengeInviteEmail(
  sendArgs: SendEmailArgs,
  substitutions: ChallengeInviteEmailSubstitutions,
): Promise<void> {
  return await sendEmail(
    sendArgs,
    EMAIL_TEMPLATES.CHALLENGE_INVITE,
    substitutions,
  );
}

export async function sendActivityNotificationEmail(
  sendArgs: SendEmailArgs,
  substitutions: ActivityNotificationEmailSubstitutions,
): Promise<void> {
  return await sendEmail(
    sendArgs,
    EMAIL_TEMPLATES.ACTIVITY_NOTIFICATION,
    substitutions,
  );
}

async function sendEmail(
  { subject, recipients }: SendEmailArgs,
  templateId: string,
  substitutions: { [key: string]: any },
): Promise<void> {
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
    `Sending email with templateId '${templateId}' to recipients ${recipients}.`,
  );
  const result = await sendgrid.send({
    subject,
    templateId,
    substitutions,
    to: [toEmail],
    bcc: recipients,
    from: sourceEmail,
  });
  console.info(`Email send result: ${JSON.stringify(result)}`);
}

function getDevEmail() {
  return process.env.DEV_EMAIL;
}

function isEmailEnabled() {
  const haveApiKey = !!process.env.SENDGRID_API_KEY;
  const enabled = _.get(Meteor.settings, 'email.enabled', false);
  const hasDevEmail = !!getDevEmail();

  return haveApiKey && (enabled || hasDevEmail);
}
