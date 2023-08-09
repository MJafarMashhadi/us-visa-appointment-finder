# US-visa-appointment-notifier
This project is a modified version of [us-visa-appointment-notifier](https://github.com/theoomoregbee/US-visa-appointment-notifier). Credits to the original author.
Compared to the original project, this one uses Sendgrid (free 100 emails/day) instead of MailGun (30 day free trial) and it allows to simultaneosly monitor mutliple location schedules.
This is just a script I put together to check and notify me via email ([SendGrid](https://sendgrid.com/)) when there's an earlier date before my initial appointment date. It doesn't handle **rescheduling**.

## How it works

* Logs you into the portal
* checks for schedules by day
* If there's a date before your initial appointment, it notifies you via email
* If no dates found, the process waits for set amount of seconds to cool down before restarting and will stop when it reaches the set max retries.

> see `config.js` or `.env.example` for values you can configure

## Configuration

copy the example configuration file exampe in `.env.example`, rename the copied version to `.env` and replace the values.

### Telegram config values

Create a bot and add it to a channel as admin. Config the CHAT_ID and BOT_ID in the env file.


## FAQ

* How do I get my facility ID - https://github.com/theoomoregbee/US-visa-appointment-notifier/issues/3
* If required, enter more than one facility id in .env file comma separated without spaces
* How do I get my schedule ID - https://github.com/theoomoregbee/US-visa-appointment-notifier/issues/8, https://github.com/theoomoregbee/US-visa-appointment-notifier/issues/7#issuecomment-1372565292

## How to use it

* clone the repo
* run `npm i` within the cloned repo directory
* start the process with `npm start`
