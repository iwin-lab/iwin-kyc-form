// netlify/functions/submit-kyc.js
//
// This function receives the KYC form submission from the browser
// and forwards it to Power Automate. Because this runs server-side,
// CORS does not apply — only browser-to-server requests are subject
// to CORS, not server-to-server requests.

const POWER_AUTOMATE_URL = 'https://default95c00780be724754b2dad597d483e6.5b.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/25/workflows/e757dff071bf448aae5a45c9f6263a92/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=hdG2l-q45FhUAvExy1rIOfYMnBL8bCC0ctozUt87cpM';

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  try {
    const paResponse = await fetch(POWER_AUTOMATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body
    });

    const responseText = await paResponse.text();
    console.log('PA status:', paResponse.status);
    console.log('PA response:', responseText);

    if (paResponse.status === 202 || paResponse.status === 200) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true })
      };
    } else {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          status: paResponse.status,
          detail: responseText || 'No response from Power Automate'
        })
      };
    }
  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
