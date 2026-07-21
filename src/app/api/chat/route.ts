const AI_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const AI_MODEL = 'llama-3.3-70b-versatile';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error('GROQ_API_KEY environment variable is not set');
    return Response.json({ error: 'GROQ_API_KEY not configured. Get a free key at https://console.groq.com' }, { status: 500 });
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
      console.error(`Groq API error (${res.status}): ${errorText}`);
      return Response.json({ error: `Groq API error (${res.status}): ${errorText.slice(0, 300)}` }, { status: 502 });
    }

    const data = await res.json();
    return Response.json({ content: data.choices?.[0]?.message?.content ?? '' });
  } catch (err) {
    console.error('Chat API route error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
