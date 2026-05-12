const AWS_REGION = "us-east-1";
const DYNAMODB_TABLE = "IoT_Hardware_Logs";

async function signRequest(method: string, url: string, body: string, service: string) {
  const encoder = new TextEncoder();
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);

  const urlObj = new URL(url);
  const canonicalUri = "/";
  const canonicalQuerystring = "";
  const canonicalHeaders = `content-type:application/x-amz-json-1.0\nhost:${urlObj.hostname}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-date";

  const bodyHash = await crypto.subtle.digest("SHA-256", encoder.encode(body));
  const bodyHashHex = Array.from(new Uint8Array(bodyHash)).map(b => b.toString(16).padStart(2, "0")).join("");

  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${bodyHashHex}`;

  const credentialScope = `${dateStamp}/${AWS_REGION}/${service}/aws4_request`;
  const canonicalRequestHash = await crypto.subtle.digest("SHA-256", encoder.encode(canonicalRequest));
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash)).map(b => b.toString(16).padStart(2, "0")).join("");

  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHashHex}`;

  const sign = async (key: ArrayBuffer, msg: string) => {
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(msg));
  };

  const AWS_SECRET = Deno.env.get("AWS_SECRET_ACCESS_KEY") ?? "";
  const AWS_KEY = Deno.env.get("AWS_ACCESS_KEY_ID") ?? "";

  const kDate = await sign(encoder.encode(`AWS4${AWS_SECRET}`), dateStamp);
  const kRegion = await sign(kDate, AWS_REGION);
  const kService = await sign(kRegion, service);
  const kSigning = await sign(kService, "aws4_request");
  const signature = await sign(kSigning, stringToSign);
  const signatureHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("");

  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${AWS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;

  return {
    "Content-Type": "application/x-amz-json-1.0",
    "X-Amz-Date": amzDate,
    "Authorization": authorizationHeader,
    "X-Amz-Target": "DynamoDB_20120810.Scan"
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
    const url = `https://dynamodb.${AWS_REGION}.amazonaws.com/`;

    const body = JSON.stringify({
      TableName: DYNAMODB_TABLE,
      Limit: 50
    });

    const headers = await signRequest("POST", url, body, "dynamodb");

    const response = await fetch(url, {
      method: "POST",
      headers,
      body
    });

    const responseText = await response.text();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: responseText }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = JSON.parse(responseText);
    const items = data.Items || [];

    // Filter items that have temp - check both top level and inside features
    const tempItems = items.filter((item: any) => {
      const hasTopLevelTemp = item.temp !== undefined;
      const hasFeaturesTemp = item.features?.M?.temp !== undefined;
      return hasTopLevelTemp || hasFeaturesTemp;
    });

    console.log("Total items:", items.length);
    console.log("Items with temp:", tempItems.length);

    if (tempItems.length === 0) {
      return new Response(JSON.stringify({ 
        temperature: null, 
        message: "No temperature records found" 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Sort by timestamp descending
    tempItems.sort((a: any, b: any) => {
      const aTime = Number(a.timestamp?.N || 0);
      const bTime = Number(b.timestamp?.N || 0);
      return bTime - aTime;
    });

    const latest = tempItems[0];

    // Try top level first, then inside features
    const tempValue = latest.temp?.N || 
                      latest.temp?.S || 
                      latest.features?.M?.temp?.N || 
                      latest.features?.M?.temp?.S || 
                      null;

    const humidity = latest.humidity?.N || 
                     latest.humidity?.S || 
                     latest.features?.M?.humidity?.N || 
                     latest.features?.M?.humidity?.S || 
                     null;

    const timestamp = latest.timestamp?.N
      ? new Date(Number(latest.timestamp.N) * 1000).toISOString()
      : new Date().toISOString();

    console.log("Latest temp value:", tempValue);
    console.log("Latest humidity:", humidity);

    return new Response(JSON.stringify({
      temperature: tempValue ? parseFloat(tempValue).toFixed(1) : null,
      humidity: humidity ? parseFloat(humidity).toFixed(1) : null,
      timestamp,
      device_id: latest.device_id?.S || "unknown"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Exception:", error.message);
    return new Response(JSON.ERROR({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});