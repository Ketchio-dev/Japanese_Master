
export async function generateAIContent(prompt: string, systemPrompt?: string): Promise<string> {
    try {
        const apiKey = localStorage.getItem("openrouter_api_key");
        const model = localStorage.getItem("openrouter_model") || "openai/gpt-3.5-turbo";

        if (!apiKey) {
            return "Please set your OpenRouter API Key in Settings.";
        }

        const messages = [
            { role: 'user', content: prompt }
        ];

        if (systemPrompt) {
            messages.unshift({ role: 'system', content: systemPrompt });
        }

        const res = await fetch('/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-OpenRouter-Key': apiKey
            },
            body: JSON.stringify({ messages, model })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to generate content');
        }

        return data.content;
    } catch (e: any) {
        console.error("AI Generation Failed", e);
        return `[Error: ${e.message}]`;
    }
}
