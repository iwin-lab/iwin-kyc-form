// netlify/functions/submit-kyc.js
//
// This function receives the KYC form submission from the browser
// and forwards it to Power Automate. Because this runs server-side,
// CORS does not apply — only browser-to-server requests are subject
// to CORS, not server-to-server requests.

const POWER_AUTOMATE_URL = process.env.POWER_AUTOMATE_URL;

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Received body size:', event.body ? event.body.length : 0);
    console.log('Power Automate URL:', POWER_AUTOMATE_URL ? 'SET' : 'NOT SET');

    const paResponse = await fetch(POWER_AUTOMATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body
    });

    console.log('PA status:', paResponse.status);
    console.log('PA headers:', JSON.stringify([...paResponse.headers.entries()]));
    const responseText = await paResponse.text();
    console.log('PA response body:', responseText || 'EMPTY');

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
          detail: responseText || 'EMPTY RESPONSE FROM POWER AUTOMATE',
          urlSet: !!POWER_AUTOMATE_URL
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
