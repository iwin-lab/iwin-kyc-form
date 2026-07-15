// netlify/functions/submit-kyc.js
//
// This function receives the KYC form submission from the browser
// and forwards it to Power Automate. Because this runs server-side,
// CORS does not apply — only browser-to-server requests are subject
// to CORS, not server-to-server requests.

// FORCE REDEPLOYMENT TIMESTAMP: 2026-07-15_15:20
// (This comment breaks Netlify's cache so it physically builds your logs!)

const POWER_AUTOMATE_URL = process.env.POWER_AUTOMATE_URL;

exports.handler = async function (event) {
  // 1. Log the absolute first line the server executes
  console.log("===!!! INCOMING SUBMISSION ATTEMPT !!!===");

  try {
    // 2. Log the environment variables
    console.log("LOG: Power Automate URL is:", POWER_AUTOMATE_URL ? "DETECTED (Length: " + POWER_AUTOMATE_URL.length + ")" : "MISSING/NOT_SET");

    // 3. Log the raw payload details
    if (!event.body) {
      console.log("LOG ERROR: The request arrived with an EMPTY body!");
    } else {
      console.log("LOG: Incoming body size is:", event.body.length, "bytes");
      // Grab a tiny snippet of the payload so we can see if it's formatted correctly
      console.log("LOG: Body snippet (first 100 chars):", event.body.substring(0, 100));
    }

    // 4. Attempt to forward to Power Automate
    console.log("LOG: Forwarding payload to Power Automate...");
    const paResponse = await fetch(POWER_AUTOMATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body
    });

    console.log("LOG: Power Automate responded with HTTP Status:", paResponse.status);
    
    const responseText = await paResponse.text();
    console.log("LOG: Power Automate response text:", responseText || "EMPTY RESPONSE");

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: paResponse.ok, 
        status: paResponse.status, 
        detail: responseText 
      })
    };

  } catch (err) {
    // 5. Catch-all for code failures
    console.log("===!!! CRITICAL FUNCTION ERROR !!!===");
    console.log("Error Message:", err.message);
    console.log("Error Stack:", err.stack);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
