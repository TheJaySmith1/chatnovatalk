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

export interface UserProfile {
  displayName: string | null;
  photoURL: string | null;
}