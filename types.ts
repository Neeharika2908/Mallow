
export interface Reminder {
  id: string;
  title: string;
  reason: string;
  timeframe: string;
  createdAt: number;
}

export interface UserProfile {
  name: string;
  age?: number;
  medicalInfo?: string; // Legacy/General note
  emergencyContact?: string;
  reminders?: Reminder[];
  
  // Detailed Medical History
  chronicConditions?: string;
  pastIllnesses?: string;
  familyHistory?: string;
  allergies?: string;
}

export interface User extends UserProfile {
  email: string;
}

export enum AuthState {
  UNAUTHENTICATED,
  LOGIN,
  SIGNUP,
  AUTHENTICATED
}

export interface Hospital {
  name: string;
  address: string;
  rating?: number;
  openNow?: boolean;
}

// Minimal type for Grounding Metadata from standard generateContent (not Live API specific, used for helper)
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeId?: string;
  };
}
