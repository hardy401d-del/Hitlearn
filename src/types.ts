export interface LyricLine {
  english: string;
  french: string;
}

export interface LyricsSection {
  sectionType: string; // e.g., 'Verse 1', 'Chorus', 'Bridge'
  lines: LyricLine[];
}

export interface WordExplanation {
  term: string;
  meaningFr: string;
  explanation: string;
  type: "vocabulary" | "slang" | "idiom" | "phrasal_verb" | "grammar";
  example: string;
}

export interface LiveComment {
  lineIndexGlobal: number; // 0-based index in the flat list of all lines
  term: string;
  comment: string;
  type: "culture" | "grammar" | "pronunciation" | "vocabulary";
}

export interface QuizQuestion {
  question: string;
  options: string[]; // exactly 4 options
  correctAnswer: string;
  explanation: string;
}

export interface SongAnalysis {
  title: string;
  artist: string;
  genre: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  lyricsSections: LyricsSection[];
  explanations: WordExplanation[];
  liveComments: LiveComment[];
  quizQuestions: QuizQuestion[];
  youtubeId?: string;
  youtubeUrl?: string;
}

export interface AssessmentResult {
  feedback: string;
  scoreStars: number; // 1 to 5
  keyTakeaway: string;
}

export interface SavedSong {
  title: string;
  artist: string;
  timestamp: number;
}
