// netlify/functions/submit-kyc.js
//
// This function receives the KYC form submission from the browser
// and forwards it to Power Automate. Because this runs server-side,
// CORS does not apply — only browser-to-server requests are subject
// to CORS, not server-to-server requests.

const POWER_AUTOMATE_URL = 'https://default95c00780be724754b2dad597d483e6.5b.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/e757dff071bf448aae5a45c9f6263a92/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=hdG2l-q45FhUAvExy1rIOfYMnBL8bCC0ctozUt87cpM';

exports.handler = async function (event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Forward the exact JSON body the browser sent
    const response = await fetch(POWER_AUTOMATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body
    });

    // Power Automate returns 202 Accepted on success
    if (response.status === 202 || response.status === 200) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true })
      };
    } else {
      const errorText = await response.text();
      console.error('Power Automate rejected the request:', response.status, errorText);
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, status: response.status, detail: errorText })
      };
    }
  } catch (err) {
    console.error('Error forwarding to Power Automate:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
