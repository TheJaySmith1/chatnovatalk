import { GoogleGenAI, Content } from "@google/genai";
import { Message, Role } from './types';

// The API key is sourced from the environment variable `process.env.API_KEY`
// and is assumed to be available in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Generates a chat response from the Gemini API using the entire conversation history.
 */
export async function fetchChatCompletion(messages: Message[]): Promise<string> {
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

  try {
    const response = await ai.models.generateContent({
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