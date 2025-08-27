export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export interface Message {
  role: Role;
  content: string;
  imageUrl?: string;
  id: string;
}
