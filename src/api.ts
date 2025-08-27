import { GoogleGenAI, Content } from "@google/genai";
import { Message, Role } from './types';

let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI client.
 * This prevents the app from crashing on startup if the API key is missing.
 */
function getAiClient(): GoogleGenAI {
  if (ai) {
    return ai;
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // This error will be caught by the calling function and handled gracefully.
    throw new Error("Gemini API key is not configured. Please set the API_KEY environment variable.");
  }

  ai = new GoogleGenAI({ apiKey });
  return ai;
}


/**
 * Generates a chat response from the Gemini API using the entire conversation history.
 */
export async function fetchChatCompletion(messages: Message[]): Promise<string> {
  try {
    const client = getAiClient();
    const modelName = 'gemini-2.5-flash';

    if (messages.length === 0) {
      return "I'm sorry, there was no message to process.";
    }

    // Convert the entire message history to Gemini's format.
    // 'assistant' role is mapped to 'model'.
    const contents: Content[] = messages.map(msg => ({
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await client.models.generateContent({
      model: modelName,
      contents: contents,
    });
    // Extract text directly from the response object, providing a fallback.
    return response.text ?? 'Sorry, I could not process that.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'An error occurred while trying to connect to the AI service.';
  }
}

/**
 * Generates an image from a text prompt using the Gemini API.
 */
export async function fetchGeneratedImage(prompt: string): Promise<string> {
  try {
    const client = getAiClient();
    const response = await client.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    // Safely access the image data using optional chaining to prevent build errors.
    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;

    if (base64ImageBytes) {
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
        // This case might occur if the generation is blocked or returns no images.
        throw new Error('No image was generated or image data is missing.');
    }
  } catch (error) {
    console.error('Gemini Image Generation Error:', error);
    // Propagate error to be handled by the UI component.
    throw new Error('Failed to generate image.');
  }
}
