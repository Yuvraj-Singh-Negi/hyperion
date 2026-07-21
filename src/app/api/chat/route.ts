const AI_ENDPOINT = 'https://api.x.ai/v1/chat/completions';
const AI_MODEL = 'grok-4.5';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const { systemPrompt, messages, userMessage } = await request.json();

    const conversation: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(messages || []).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: conversation,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`xAI API error (${res.status}): ${errorText}`);
      return Response.json({ error: `API error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    return Response.json({ content: data.choices?.[0]?.message?.content ?? '' });
  } catch (err) {
    console.error('Chat API route error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
