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

    // Get all records
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

    const alerts: any[] = [];

    items.forEach((item: any) => {
      const isAttack = item.prediction?.M?.alert_status?.S === "attack_detected";
      const isTempAlert = item.temperature_alert?.M?.temperature_alert?.BOOL === true;

      if (isAttack) {
        alerts.push({
          device_id: item.device_id?.S || "unknown",
          timestamp: item.timestamp?.N
            ? new Date(Number(item.timestamp.N) * 1000).toISOString()
            : new Date().toISOString(),
          title: item.prediction?.M?.friendly_alert?.M?.title?.S || "Security Alert",
          message: item.prediction?.M?.friendly_alert?.M?.message?.S || "An anomaly was detected.",
          severity: item.prediction?.M?.friendly_alert?.M?.severity?.S || "High",
          advice: item.prediction?.M?.friendly_alert?.M?.advice?.S || "Check your devices.",
          category: item.prediction?.M?.Category?.S || "Unknown",
          subcategory: item.prediction?.M?.SubCategory?.S || "",
          type: "attack"
        });
      }

      if (isTempAlert) {
        alerts.push({
          device_id: item.device_id?.S || "unknown",
          timestamp: item.timestamp?.N
            ? new Date(Number(item.timestamp.N) * 1000).toISOString()
            : new Date().toISOString(),
          title: item.temperature_alert?.M?.temperature_title?.S || "Temperature Alert",
          message: item.temperature_alert?.M?.temperature_message?.S || "Unusual temperature detected.",
          severity: item.temperature_alert?.M?.temperature_severity?.S || "Medium",
          advice: item.temperature_alert?.M?.temperature_advice?.S || "Check your temperature sensor.",
          category: "Temperature",
          subcategory: "",
          type: "temperature"
        });
      }
    });

    // Sort by timestamp descending
    alerts.sort((a: any, b: any) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return new Response(JSON.stringify({ alerts }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Exception:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});