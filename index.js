const puppeteer = require('puppeteer');
const {parseISO, compareAsc, isBefore, format} = require('date-fns')
require('dotenv').config();

const {delay, sendMessage, logStep} = require('./utils');
const {siteInfo, loginCred, IS_PROD, NEXT_SCHEDULE_POLL, MAX_NUMBER_OF_POLL, NOTIFY_ON_DATE_BEFORE} = require('./config');

let isLoggedIn = false;
let maxTries = MAX_NUMBER_OF_POLL

const login = async (page) => {
  logStep('logging in');
  await page.goto(siteInfo.LOGIN_URL);

  const form = await page.$("form#sign_in_form");

  const email = await form.$('input[name="user[email]"]');
  const password = await form.$('input[name="user[password]"]');
  const privacyTerms = await form.$('input[name="policy_confirmed"]');
  const signInButton = await form.$('input[name="commit"]');

  await email.type(loginCred.EMAIL);
  await password.type(loginCred.PASSWORD);
  await privacyTerms.click();
  await signInButton.click();

  await page.waitForNavigation();

  return true;
}

const notifyMe = async (earliestDate, times) => {
  const formattedDate = format(earliestDate, 'MMM dd, yyyy');
  logStep(`sending an message to schedule for ${formattedDate} ${times}`);
  await sendMessage({
    text: `Trying to <a href="https://ais.usvisa-info.com/${siteInfo.COUNTRY_CODE}/niv/schedule/${siteInfo.SCHEDULE_ID}/appointment">reschedule</a> for ${formattedDate} ${times}.`
  })
}
const getDatesForFacility = async (page, url) => {
  await page.goto(url);
  const originalPageContent = await page.content();
  try{
    const bodyText = await page.evaluate(() => {
      return document.querySelector('body').innerText
    });
    console.log(bodyText);
    const parsedBody = JSON.parse(bodyText);

    if(!Array.isArray(parsedBody)) {
      throw "Failed to parse dates, probably because you are not logged in";
    }

    const dates = parsedBody.map(item => parseISO(item.date));
    return dates;
  }catch(err){
    console.log("Unable to parse page JSON content", originalPageContent);
    console.error(err)
    isLoggedIn = false;
  }
}
const checkForSchedules = async (page) => {
  logStep('checking for schedules');
  await page.setExtraHTTPHeaders({
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest'
  });
  const combinedDates = [];
  for (let url of siteInfo.APPOINTMENTS_JSON_URLS) {
    const dates = await getDatesForFacility(page, url);
    combinedDates.push(...dates);
  }
  const [earliest] = combinedDates.sort(compareAsc)
  return earliest;
}

const getTimesForDate = async (page, date) => {
  await page.setExtraHTTPHeaders({
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest'
  });
  await page.goto(`https://ais.usvisa-info.com/${siteInfo.COUNTRY_CODE}/niv/schedule/${siteInfo.SCHEDULE_ID}/appointment/times/${siteInfo.FACILITY_ID}.json?date=${date}&appointments\[expedite\]=false`);
  const originalPageContent = await page.content();
  const bodyText = await page.evaluate(() => {
    return document.querySelector('body').innerText
  });
  const parsedBody = JSON.parse(bodyText);
  return parsedBody["available_times"];
}


const process = async (browser) => {
  logStep(`starting process with ${maxTries} tries left`);

  if(maxTries-- <= 0){
    console.log('Reached Max tries')
    return
  }

  const page = await browser.newPage();

  if(!isLoggedIn) {
     isLoggedIn = await login(page);
  }

  const earliestDate = await checkForSchedules(page);
  if(earliestDate && isBefore(earliestDate, parseISO(NOTIFY_ON_DATE_BEFORE))){
    const times = await getTimesForDate(page, earliestDate);
    const latest_time = times[times.length - 1];
    console.log(`Available at ${earliestDate} ${latest_time} (${times})`);
    await notifyMe(earliestDate, times);
  } else {
    console.log(`Earliest date ${earliestDate} is not before the desired`);
  }

  await delay(NEXT_SCHEDULE_POLL)

  await process(browser)
}


(async () => {
  const browser = await puppeteer.launch(!IS_PROD ? {headless: "new"}: undefined);

  try{
    await process(browser);
  }catch(err){
    console.error(err);
  }

  await browser.close();
})();
