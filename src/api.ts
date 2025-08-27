import { type Message } from './types';

const API_KEY = 'sk-voidai-HhAaP6NWhsfIe3hJIF8uTpm90OUCtSgE5A5H32ycmUl3xmOOno5o8Uz0M0AMgAwizt5dEV99ktHoM3AfdGjpiZZo7VrMxvSiqIzf';
const CHAT_API_URL = 'https://api.void.cat/v1/chat/completions';
const IMAGE_API_URL = 'https://api.void.cat/v1/images/generations';

/**
 * Generates a chat response from a live AI model.
 */
export async function fetchChatCompletion(messages: Message[]): Promise<string> {
  const payload = {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are NovaTalk, a helpful and concise assistant.' },
      // Map app's message format to the API's format and take the last 10 messages for context
      ...messages.slice(-10).map(msg => ({ role: msg.role, content: msg.content }))
    ],
  };

  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('API Error Response:', errorBody);
    throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'I am unable to provide a response at this time.';
}

/**
 * Generates an image from a prompt using a live AI model.
 */
export async function fetchGeneratedImage(prompt: string): Promise<string> {
  const payload = {
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: '1024x1024',
    response_format: 'url',
  };

  const response = await fetch(IMAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('API Error Response:', errorBody);
    throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0]?.url || '';
}