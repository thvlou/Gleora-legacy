// Vercel Edge Function — Input section에서 제출된 URL을 Slack Incoming
// Webhook으로 전달한다. 실제 "레퍼런스 등록"은 이 함수가 하지 않는다 —
// 알림만 보내고, 사람이 링크를 확인해 나중에 큐레이션 후 refs.ts에 직접
// 추가하는 방식(사용자가 정한 워크플로)이라 이걸로 충분하다.
//
// 웹훅 URL은 클라이언트에 절대 노출하면 안 되므로(누구나 스팸을 보낼 수
// 있게 됨) 이 서버 함수 안에서만, 환경 변수(SLACK_WEBHOOK_URL)로 읽는다.
// Vercel 프로젝트 설정에 이 값을 추가해야 실제로 동작한다 — .env.example 참고.
export const config = {
  runtime: "edge",
};

const MAX_URL_LENGTH = 2048;

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return jsonResponse(500, { error: "Slack webhook is not configured" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const url = body && typeof body === "object" && "url" in body ? (body as { url: unknown }).url : null;
  if (typeof url !== "string" || url.length === 0 || url.length > MAX_URL_LENGTH || !isHttpUrl(url)) {
    return jsonResponse(400, { error: "Invalid url" });
  }

  const slackResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: `새 레퍼런스 제출: ${url}` }),
  });

  if (!slackResponse.ok) {
    return jsonResponse(502, { error: "Failed to notify Slack" });
  }

  return jsonResponse(200, { ok: true });
}
