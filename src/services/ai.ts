const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface AIResult {
    title: string;
    content: string;
}

export const aiService = {
    async optimizeNote(title: string, content: string): Promise<AIResult> {
        if (!GROQ_API_KEY || GROQ_API_KEY === 'TU_API_KEY_AQUI') {
            throw new Error('API Key de Groq no configurada.');
        }

        const prompt = `
            Actúa como un editor experto en redacción para una aplicación de notas premium llamada AstraPad.
            Tu objetivo es optimizar y mejorar la siguiente nota para que sea más clara, profesional y organizada.
            
            Título sugerido por el usuario: "${title}"
            Contenido de la nota: "${content}"
            
            Instrucciones:
            1. Mejora el título para que sea conciso y atractivo (máximo 10 palabras).
            2. Mejora el contenido corrigiendo ortografía, gramática y dándole una estructura elegante (puedes usar listas o párrafos claros).
            3. Responde ÚNICAMENTE en formato JSON con la siguiente estructura: 
               {"title": "...", "content": "..."}
        `;

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Error en la API de Groq');
            }

            const data = await response.json();
            const result = JSON.parse(data.choices[0].message.content);
            
            return {
                title: result.title || title,
                content: result.content || content
            };
        } catch (error) {
            console.error('AI Error:', error);
            throw error;
        }
    }
};
