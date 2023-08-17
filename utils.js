const config = require('./config');
const https = require('https');
const FormData = require('form-data');

const debug = async (page, logName, saveScreenShot) => {
  if(saveScreenShot){
    await page.screenshot({path: `${logName}.png`});
  }

  await page.evaluate(() => {
    debugger;
  });
};

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

const sendMessage = async (input_params) => {
  // Thank you Chat GPT :')
  const url = `https://api.telegram.org/bot${config.telegram.BOT_ID}/sendMessage`;

  const params = new URLSearchParams({
    chat_id: config.telegram.CHAT_ID,
    parse_mode: "HTML",
    ...input_params
  });

  const options = {
    method: 'GET',
    headers: {
      "Content-Type": "application/octet-stream",
      "User-Agent": "Google-Cloud-Scheduler"
    }
  };

  const sendRequest = async () => {
    return new Promise((resolve, reject) => {
      const request = https.request(`${url}?${params}`, options, (response) => {
        // Handle the response here if needed
        resolve(response);
      });

      request.on('error', (error) => {
        // Handle any errors that occur during the request
        reject(error);
      });

      request.end();
    });
  };

  try {
    const response = await sendRequest();
  } catch (error) {
    console.log(error);
  }
};

const sendPhoto = async (caption, photoData) => {
  // Thank you again Chat GPT :')
  const url = `https://api.telegram.org/bot${config.telegram.BOT_ID}/sendPhoto`;

  const form = new FormData();
  form.append('chat_id', config.telegram.CHAT_ID);
  form.append('caption', caption);
  form.append('photo', photoData, {filename: 'screenshot.jpg', contentType: 'image/jpeg'});

  const options = {
    method: 'POST',
    headers: form.getHeaders()
  };

  const sendRequest = async () => {
    return new Promise((resolve, reject) => {
      const request = https.request(url, options, (response) => {
        // Handle the response here if needed
        resolve(response);
        console.log(response.statusCode);
        response.on('data', chunk => {
          console.log("response: ", '' + chunk);
        });
      });

      request.on('error', (error) => {
        // Handle any errors that occur during the request
        reject(error);
      });

      form.pipe(request);
      request.end();
    });
  };

  try {
    const response = await sendRequest();
  } catch (error) {
    console.log(error);
  }
};

const logStep = (stepTitle) => {
  console.log("=====>>> Step:", stepTitle);
}

module.exports = {
  debug,
  delay,
  sendMessage,
  sendPhoto,
  logStep
}
