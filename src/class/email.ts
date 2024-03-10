import {ContactType, EmailType} from '../schema/email';

type MailchannelsPersonalizationsType = {
  to: MailchannelsContactType[],
  dkim_domain: string,
  dkim_selector: string,
  dkim_private_key: string
};
type MailchannelsContactType = { email: string; name: string | undefined };
type MailchannelsContentType = { type: string; value: string };

interface MailchannelsEmailType {
  personalizations: MailchannelsPersonalizationsType[];
  from: MailchannelsContactType;
  reply_to: MailchannelsContactType | undefined;
  cc: MailchannelsContactType[] | undefined;
  bcc: MailchannelsContactType[] | undefined;
  subject: string;
  content: MailchannelsContentType[];
}

class Email {
  static async send(email: EmailType, dkim_private_key: string) {
    const mcEmail: MailchannelsEmailType = Email.convertEmail(email, dkim_private_key);

    const response = await fetch(
      new Request('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(mcEmail)
      })
    );
            const respText = await response.text();
 let respContent = "";
        respContent = response.status + " " + response.statusText + "\n\n"; 
        console.log("Response: ", respContent );

    return !(response.status > 299 || response.status < 200);
  }

  protected static convertEmail(email: EmailType, dkim_private_key: string): MailchannelsEmailType {
    const from: MailchannelsContactType = Email.convertContact(email.from);
    const toContacts: MailchannelsContactType[] = Email.convertContacts(email.to);

    const personalizations: MailchannelsPersonalizationsType[] = [];
    personalizations.push({
      to: toContacts,
      dkim_domain: from.email.replace(/.*@/, ''),
      dkim_selector: 'mcdkim',
      dkim_private_key: dkim_private_key
    });

    let replyTo: MailchannelsContactType | undefined = undefined;
    let bccContacts: MailchannelsContactType[] | undefined = undefined;
    let ccContacts: MailchannelsContactType[] | undefined = undefined;
    if (email.replyTo) {
      const replyToContacts: MailchannelsContactType[] = Email.convertContacts(email.replyTo);
      replyTo = replyToContacts.length > 0 ? replyToContacts[0] : {email: '', name: undefined};
    }
    if (email.cc) ccContacts = Email.convertContacts(email.cc);
    if (email.bcc) bccContacts = Email.convertContacts(email.bcc);

    const subject: string = email.subject;

    const textContent: MailchannelsContentType[] = [];
    if (email.text) textContent.push({type: 'text/plain', value: email.text});

    const htmlContent: MailchannelsContentType[] = [];
    if (email.html) htmlContent.push({type: 'text/html', value: email.html});

    const content: MailchannelsContentType[] = [...textContent, ...htmlContent];

    return {
      personalizations,
      from,
      cc: ccContacts,
      bcc: bccContacts,
      reply_to: replyTo,
      subject,
      content
    };
  }

  protected static convertContacts(contacts: ContactType | ContactType[]): MailchannelsContactType[] {
    if (!contacts) return [];
    return Array.isArray(contacts) ? contacts.map(Email.convertContact) : [contacts].map(Email.convertContact);
  }

  protected static convertContact(contact: ContactType): MailchannelsContactType {
    if (typeof contact === 'string') return {email: contact, name: undefined};
    return {email: contact.email, name: contact.name};
  }
}

export default Email;