/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HistoryItem {
  id: number;
  year: string;
  title: string;
  description: string;
  detail: string;
  iconName: string;
}

export interface RightItem {
  id: number;
  title: string;
  description: string;
  kidsExample: string;
  iconName: string;
  scenarioTitle: string;
  scenarioText: string;
}

export interface DutyItem {
  id: number;
  title: string;
  description: string;
  kidsScene: string;
  isCorrect: boolean;
  iconName: string;
}

export interface QuizQuestion {
  id: number;
  type?: "mcq" | "boolean" | "blank";
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  blankAnswer?: string; // The correct answer for fill-in-the-blank questions
}

export interface Candidate {
  id: number;
  name: string;
  symbol: string;
  color: string;
  party: string;
  votes: number;
  agenda: string;
}

export type MascotMood = "happy" | "thinking" | "excited" | "proud" | "speaking" | "greeting";
