import { Message } from './types';

// Mock a delay to simulate network request
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * MOCK: Generates a canned chat response after a short delay.
 */
export async function fetchChatCompletion(messages: Message[]): Promise<string> {
  console.log("Mocking chat completion for messages:", messages);
  await sleep(1000); // Simulate 1 second delay
  
  const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

  if (lastUserMessage.includes('hello') || lastUserMessage.includes('hi')) {
    return "Hello there! This is a simulated response from NovaTalk.";
  }
  if (lastUserMessage.includes('how are you')) {
    return "I'm just a mock interface, but I'm doing great! Thanks for asking.";
  }

  return "This is a mock response. To connect to a real AI, an API key would be required.";
}

/**
 * MOCK: Returns a placeholder image URL after a short delay.
 */
export async function fetchGeneratedImage(prompt: string): Promise<string> {
  console.log("Mocking image generation for prompt:", prompt);
  await sleep(2000); // Simulate 2 second delay

  // Return a random placeholder image using the prompt as a seed
  const seed = encodeURIComponent(prompt.substring(0, 50));
  return `https://picsum.photos/seed/${seed}/512/512`;
}
