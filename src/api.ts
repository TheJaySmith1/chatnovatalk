import { type Message } from './types';

// Hardcode the provided API key and endpoint.
const API_KEY = 'sk-voidai-HhAaP6NWhsfIe3hJIF8uTpm90OUCtSgE5A5H32ycmUl3xmOOno5o8Uz0M0AMgAwizt5dEV99ktHoM3AfdGjpiZZo7VrMxvSiqIzf';
const API_BASE_URL = 'https://api.void.ai/v1'; // Standard for OpenAI-compatible services

/**
 * Fetches a chat response from the live AI model.
 */
export async function fetchChatCompletion(messages: Message[]): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // A common, powerful, and efficient model
        messages: messages.map(({ role, content }) => ({ role, content })), // Format messages for the API
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      throw new Error("Received an empty response from the AI.");
    }

    return aiResponse;
  } catch (error) {
    console.error("Failed to fetch chat completion:", error);
    // Re-throw the error to be handled by the calling component
    throw error;
  }
}

/**
 * Generates an image from a prompt using the live AI model.
 */
export async function fetchGeneratedImage(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3', // A standard high-quality image generation model
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error("API did not return a valid image URL.");
    }

    return imageUrl;
  } catch (error) {
    console.error("Failed to generate image:", error);
    // Re-throw the error to be handled by the calling component
    throw error;
  }
}
