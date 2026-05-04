const AWS_IOT_ENDPOINT = "a2sar6zjc5pkxd-ats.iot.us-east-1.amazonaws.com";
const AWS_REGION = "us-east-1";
const AWS_ACCESS_KEY_ID = "AKIA3C2RJ2472JYKDHGD";
const AWS_SECRET_ACCESS_KEY = "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";
const AWS_IOT_TOPIC = "home/esp01/cmd";

async function signRequest(method: string, url: string, body: string) {
  const encoder = new TextEncoder();
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);

  const urlObj = new URL(url);
  const canonicalUri = urlObj.pathname;
  const canonicalQuerystring = "qos=1";
  const canonicalHeaders = `content-type:application/json\nhost:${urlObj.hostname}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-date";

  const bodyHash = await crypto.subtle.digest("SHA-256", encoder.encode(body));
  const bodyHashHex = Array.from(new Uint8Array(bodyHash)).map(b => b.toString(16).padStart(2, "0")).join("");

  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${bodyHashHex}`;

  const credentialScope = `${dateStamp}/${AWS_REGION}/iotdata/aws4_request`;
  const canonicalRequestHash = await crypto.subtle.digest("SHA-256", encoder.encode(canonicalRequest));
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash)).map(b => b.toString(16).padStart(2, "0")).join("");

  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHashHex}`;

  const sign = async (key: ArrayBuffer, msg: string) => {
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(msg));
  };

  const kDate = await sign(encoder.encode(`AWS4${AWS_SECRET_ACCESS_KEY}`), dateStamp);
  const kRegion = await sign(kDate, AWS_REGION);
  const kService = await sign(kRegion, "iotdata");
  const kSigning = await sign(kService, "aws4_request");
  const signature = await sign(kSigning, stringToSign);
  const signatureHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("");

  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${AWS_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;

  return {
    "Content-Type": "application/json",
    "X-Amz-Date": amzDate,
    "Authorization": authorizationHeader,
  };
}

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { device_id, action } = await req.json();

    const payload = JSON.stringify({ device_id, action });
    const url = `https://${AWS_IOT_ENDPOINT}/topics/home/esp01/cmd?qos=1`;

    console.log("Sending to URL:", url);
    console.log("Payload:", payload);

    const headers = await signRequest("POST", url, payload);
    console.log("Headers:", JSON.stringify(headers));

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: payload,
    });

    const responseText = await response.text();
    console.log("AWS Response status:", response.status);
    console.log("AWS Response body:", responseText);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: responseText, status: response.status }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Exception:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});