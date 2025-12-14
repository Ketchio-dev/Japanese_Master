
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages, prompt, model } = await req.json();
        // Prefer key from client header, fallback to server env (optional)
        const apiKey = req.headers.get("X-OpenRouter-Key") || process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'OpenRouter API Key missing. Please check Settings.' },
                { status: 401 }
            );
        }

        // Construct payload
        // If 'messages' is provided (new way), use it.
        // If only 'prompt' is provided (legacy slash command), construct messages.
        let payloadMessages = messages;
        if (!payloadMessages && prompt) {
            payloadMessages = [
                { "role": "system", "content": "You are a helpful writing assistant. Continue the text or answer the user's prompt directly and concisely." },
                { "role": "user", "content": prompt }
            ];
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://note.myarchive.cc", // Optional but good practice
                "X-Title": "MyArchive Note"
            },
            body: JSON.stringify({
                "model": model || "openai/gpt-3.5-turbo", // Use user selected model or default
                "messages": payloadMessages
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message || 'OpenRouter Error');
        }

        const content = data.choices?.[0]?.message?.content || "";
        return NextResponse.json({ content });

    } catch (error: any) {
        console.error("AI API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
