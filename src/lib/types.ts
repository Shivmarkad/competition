/**
 * Shared types to avoid circular imports
 */

export interface RuleConfig {
  maxConsecutiveWins: number;
  teamMode: boolean;
  teams: number;
  targetScore: number | null;
  handicapMode: boolean;
  handicapScores: Record<string, number>;
  battleTimer: number | null;
  autoBattle: boolean;
  autoBattleInterval: number;
  soundEnabled: boolean;
  customRules: string[];
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  config: RuleConfig;
  createdAt: number;
}

export interface Character {
  id: string;
  name: string;
  image: string;
  colorTheme: number;
  accessories: string[];
  createdAt: number;
}

export interface Competitor {
  name: string;
  image: string;
  score: number;
  colorIndex: number;
}

export interface PlayerStats {
  name: string;
  colorIndex: number;
  totalWins: number;
  totalBattles: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  bestScore: number;
}

export interface Tournament {
  id: string;
  name: string;
  players: string[];
  type: "single" | "double";
  bracket: BracketNode[];
  currentRound: number;
  winner: string | null;
  createdAt: number;
}

export interface BracketNode {
  id: string;
  player1: string | null;
  player2: string | null;
  winner: string | null;
  score1: number;
  score2: number;
  round: number;
  position: number;
  parentId: string | null;
  isLoserBracket?: boolean;
}