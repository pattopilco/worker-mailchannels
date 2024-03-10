# Worker MailChannels

Send emails through [MailChannels](https://api.mailchannels.net/tx/v1/documentation)
using [Cloudflare Workers](https://workers.cloudflare.com/).

## Setup

1. Run `npm install`
2. Run `npm run deploy`
3. Run `npx wrangler secret put BASIC_AUTH_USERNAME` to deploy the username for basic auth.
4. Run `npx wrangler secret put BASIC_AUTH_PASSWORD` to deploy the password for basic auth.

## Setup Domain Lockdown

Add a `TXT` record to your DNS:

- Name: `_mailchannels`
- Value: `v=mc1 cfid=example.workers.dev`

## Setup SPF

Add a `TXT` record to your DNS:

- Name: `@`
- Value: `v=spf1 include:relay.mailchannels.net -all`

## Setup DKIM

1. Run `openssl genrsa 2048 | tee priv_key.pem | openssl rsa -outform der | openssl base64 -A > priv_key.txt` to
   generate a DKIM private key.
2. Run `echo -n "v=DKIM1;p=" > pub_key_record.txt && openssl rsa -in priv_key.pem -pubout -outform der | openssl base64 -A >> pub_key_record.txt`
to generate a DKIM public key.
3. Run `npx wrangler secret put DKIM_PRIVATE_KEY` to deploy the base64 encoded DKIM private
   key.

Add a `TXT` record to your DNS:

- Name: `mcdkim._domainkey`
- Value: Record from `pub_key_record.txt`

## Usage

Make a `POST` request to `https://worker-mailchannels.example.workers.dev/api` with the following parameters. Make sure
to set the basic auth `Authorization` header.

### Parameters

```json
{
  "to": [
    {
      "email": "mail@example.com",
      "name": "Example"
    }
  ],
  "replyTo": {
    "email": "mail@example.com",
    "name": "Example"
  },
  "cc": [
    {
      "email": "mail@example.com",
      "name": "Example"
    }
  ],
  "bcc": [
    {
      "email": "mail@example.com",
      "name": "Example"
    }
  ],
  "from": {
    "email": "mail@example.com",
    "name": "Example"
  },
  "subject": "Example",
  "text": "Example",
  "html": "<h1>Example</h1>"
}
```
# worker-mailchannels
# worker-mailchannels
