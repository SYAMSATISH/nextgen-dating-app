export async function POST(request: Request) {
  const body = await request.json();
  const { currentUser, otherUser } = body;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: 'You are a dating app compatibility analyzer. Give a score 0-100 and one short reason max 10 words. User 1: ' + currentUser.name + ' Intent: ' + currentUser.intent + ' Bio: ' + (currentUser.bio || 'Not provided') + ' User 2: ' + otherUser.name + ' Intent: ' + otherUser.intent + ' Bio: ' + (otherUser.bio || 'Not provided') + ' Respond in JSON only: {"score": 85, "reason": "Both seeking serious relationships"}',
        },
      ],
    }),
  });
  const data = awai  const data = awai  const data = awai  constt[  const data = awai  const dat.parse(text);
  return Response.json(parsed);
}
