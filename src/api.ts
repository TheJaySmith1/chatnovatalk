// FIX: Import GoogleGenAI from @google/genai.
import { GoogleGenAI } from "@google/genai";
import { Message, Role } from './types';

// FIX: Use process.env.API_KEY as per coding guidelines.
// The API key is sourced from the environment variable `process.env.API_KEY`
// and is made available during the build process via Vite configuration.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// FIX: Refactor to use Gemini API for chat completions.
export async function fetchChatCompletion(messages: Message[]): Promise<string> {
  // Use the recommended model for general text tasks.
  const modelName = 'gemini-2.5-flash';

  if (messages.length === 0) {
    return "I'm sorry, there was no message to process.";
  }

  // Gemini requires 'user' and 'model' roles. 'assistant' is mapped to 'model'.
  // The history is all messages except the last one.
  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === Role.USER ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const lastMessage = messages[messages.length - 1];

  try {
    const chat = ai.chats.create({
        model: modelName,
        history: history,
    });

    const result = await chat.sendMessage({ message: lastMessage.content });
    // Extract text directly from the response object as per guidelines.
    const text = result.text;
    return text || 'Sorry, I could not process that.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'An error occurred while trying to connect to the AI service.';
  }
}

// FIX: Refactor to use Gemini API for image generation.
export async function fetchGeneratedImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
        // This case might occur if the generation is blocked or returns no images.
        throw new Error('No image was generated.');
    }
  } catch (error) {
    console.error('Gemini Image Generation Error:', error);
    // Propagate error to be handled by the UI component.
    throw new Error('Failed to generate image.');
  }
}
