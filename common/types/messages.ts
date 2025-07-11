// A generic structure for all messages
export interface WebSocketMessage<T> {
  type: string;
  payload: T;
}

// --- Client to Server Message Payloads ---

export interface PlayerJoinPayload {
  id: string;
  name: string;
  avatar: number;
}

export interface AdminActionPayload {
  password: string;
}

export interface SubmitAnswerPayload {
  answerIndex: number;
}

export interface PassTurnPayload {} // No payload needed

// --- Server to Client Message Payloads ---

export interface ErrorPayload {
  message: string;
}

// --- Message Types ---

export type ClientMessageType =
  | 'player_join'
  | 'admin_start_game'
  | 'admin_reset_game'
  | 'submit_answer'
  | 'pass_turn';

export type ServerMessageType =
  | 'game_state_update'
  | 'player_joined'
  | 'error';
