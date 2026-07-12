import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with telemetry header as required
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint 1: Analyze song and generate lyrics, translations, live comments, and quiz
app.post("/api/analyze-song", async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, artist, lyrics } = req.body;

    if (!title || !artist) {
      res.status(400).json({ error: "Title and Artist are required." });
      return;
    }

    if (!apiKey) {
      res.status(500).json({ 
        error: "GEMINI_API_KEY environment variable is not configured. Please add it in the Secrets panel." 
      });
      return;
    }

    // Build the prompt
    let prompt = "";
    if (lyrics && lyrics.trim().length > 0) {
      prompt = `You are an expert English-as-a-Second-Language (ESL) teacher who is native in both English and French. 
Analyze the song "${title}" by "${artist}" using the lyrics provided below:

LYRICS:
${lyrics}

Please:
1. Divide the lyrics into logical sections (e.g., Verse 1, Chorus, Verse 2, Bridge, etc.).
2. Translate the lyrics line-by-line into natural, beautiful French. Ensure the line counts match perfectly so they can be shown side-by-side.
3. Identify 5-8 key vocabulary words, slang, or idioms in the song, translate them, and provide clean explanations in French, including practical alternative examples.
4. Generate 5-6 real-time teacher comments that explain language structures, cultural meanings, or tricky phrases. Map these precisely to a flat global index of the lines (first line is index 0, second line is index 1, etc.) for simulated live playback mode.
5. Create a 5-question multiple-choice interactive quiz about the song's language, vocabulary, and meaning to help French speakers learn English. Ensure options include correct and incorrect answers with helpful explanations in French.`;
    } else {
      prompt = `You are an expert English-as-a-Second-Language (ESL) teacher who is native in both English and French.
Use your knowledge to find the lyrics of the song "${title}" by "${artist}". If the song is extremely obscure, please approximate or generate high-quality appropriate lyrics in the style of the artist.

Please:
1. Retrieve the full English lyrics and divide them into logical sections (e.g., Verse 1, Chorus, Verse 2, Bridge, etc.).
2. Translate the lyrics line-by-line into natural, beautiful French. Ensure the line counts match perfectly so they can be shown side-by-side.
3. Identify 5-8 key vocabulary words, slang, or idioms in the song, translate them, and provide clean explanations in French, including practical alternative examples.
4. Generate 5-6 real-time teacher comments that explain language structures, cultural meanings, or tricky phrases. Map these precisely to a flat global index of the lines (first line is index 0, second line is index 1, etc.) for simulated live playback mode.
5. Create a 5-question multiple-choice interactive quiz about the song's language, vocabulary, and meaning to help French speakers learn English. Ensure options include correct and incorrect answers with helpful explanations in French.`;
    }

    // Generate content using gemini-3.5-flash with a structured JSON schema
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a bilingual English-French music and language professor. Your job is to make learning English through songs incredibly fun, clear, and comprehensive. Always output valid JSON conforming exactly to the responseSchema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "artist", "genre", "difficulty", "summary", "lyricsSections", "explanations", "liveComments", "quizQuestions"],
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            genre: { type: Type.STRING },
            difficulty: { 
              type: Type.STRING, 
              description: "English level of the song: 'Beginner', 'Intermediate', or 'Advanced'" 
            },
            summary: { 
              type: Type.STRING, 
              description: "A 2-3 sentence overview of what the song is about and its main message, in French." 
            },
            lyricsSections: {
              type: Type.ARRAY,
              description: "Lyrics divided into logical parts like Verses and Chorus.",
              items: {
                type: Type.OBJECT,
                required: ["sectionType", "lines"],
                properties: {
                  sectionType: { 
                    type: Type.STRING, 
                    description: "e.g., 'Verse 1', 'Chorus', 'Bridge', 'Outro'" 
                  },
                  lines: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["english", "french"],
                      properties: {
                        english: { type: Type.STRING, description: "The original line in English" },
                        french: { type: Type.STRING, description: "The French translation of this exact line" }
                      }
                    }
                  }
                }
              }
            },
            explanations: {
              type: Type.ARRAY,
              description: "Detailed breakdowns of tricky vocabulary, slang, idioms, or grammar from the song.",
              items: {
                type: Type.OBJECT,
                required: ["term", "meaningFr", "explanation", "type", "example"],
                properties: {
                  term: { type: Type.STRING, description: "The English word, idiom, or slang phrase" },
                  meaningFr: { type: Type.STRING, description: "Brief translation of the term in French" },
                  explanation: { type: Type.STRING, description: "Linguistic or cultural context and usage explanation in French" },
                  type: { 
                    type: Type.STRING, 
                    description: "Classification: 'vocabulary', 'slang', 'idiom', 'phrasal_verb', or 'grammar'" 
                  },
                  example: { type: Type.STRING, description: "Another example sentence in English using this exact term" }
                }
              }
            },
            liveComments: {
              type: Type.ARRAY,
              description: "Pop-up teacher notes that appear in real-time as the song plays.",
              items: {
                type: Type.OBJECT,
                required: ["lineIndexGlobal", "term", "comment", "type"],
                properties: {
                  lineIndexGlobal: { 
                    type: Type.INTEGER, 
                    description: "The 0-based index of the line in the flat, ordered array of ALL lyric lines where this comment is relevant" 
                  },
                  term: { type: Type.STRING, description: "The vocabulary, idiom, or pronunciation note being commented on" },
                  comment: { type: Type.STRING, description: "The teacher's note/comment, in French" },
                  type: { type: Type.STRING, description: "Category: 'culture', 'grammar', 'pronunciation', or 'vocabulary'" }
                }
              }
            },
            quizQuestions: {
              type: Type.ARRAY,
              description: "A multi-question language learning quiz tailored to the vocabulary in the song.",
              items: {
                type: Type.OBJECT,
                required: ["question", "options", "correctAnswer", "explanation"],
                properties: {
                  question: { type: Type.STRING, description: "The quiz question, in French or simple English" },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Exactly 4 options"
                  },
                  correctAnswer: { type: Type.STRING, description: "The exact correct option string from the options list" },
                  explanation: { type: Type.STRING, description: "Detailed explanation of why this answer is correct, in French" }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }

    const result = JSON.parse(text);
    res.json(result);
  } catch (error: any) {
    console.error("Error analyzing song:", error);
    res.status(500).json({ error: error.message || "An error occurred while analyzing the song." });
  }
});

// Endpoint 2: Evaluate what the user understood from the song
app.post("/api/assess-understanding", async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, artist, userUnderstanding } = req.body;

    if (!title || !artist || !userUnderstanding) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }

    if (!apiKey) {
      res.status(500).json({ 
        error: "GEMINI_API_KEY environment variable is not configured. Please add it in the Secrets panel." 
      });
      return;
    }

    const prompt = `You are an encouraging and pedagogical English teacher. 
A French speaker just finished listening to and studying the song "${title}" by "${artist}". 
They wrote down what they understood from the song's lyrics. 

USER'S EXPLANATION OF UNDERSTANDING:
"${userUnderstanding}"

Please analyze their understanding:
1. Provide warm, encouraging feedback in French.
2. Confirm what they understood correctly.
3. Gently correct any misunderstandings or clarify nuances they might have missed based on the actual meaning of the song.
4. Highlight 1 or 2 interesting idioms or words from the song that reinforce their understanding.
5. Give them a quick 'understanding score' from 1 to 5 stars (with 5 being perfect), but keep the tone supportive and positive.

Keep the response structured and easy to read. Output valid JSON in the requested schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a friendly, encouraging, and clear English-French language coach. Always output valid JSON conforming exactly to the responseSchema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["feedback", "scoreStars", "keyTakeaway"],
          properties: {
            feedback: { 
              type: Type.STRING, 
              description: "Structured, rich markdown commentary in French encouraging the user, highlighting what they got right, correcting minor errors, and teaching key phrases." 
            },
            scoreStars: { 
              type: Type.INTEGER, 
              description: "A score from 1 to 5 indicating their comprehension level." 
            },
            keyTakeaway: { 
              type: Type.STRING, 
              description: "A brief 1-sentence inspirational lesson or takeaway in French." 
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }

    const result = JSON.parse(text);
    res.json(result);
  } catch (error: any) {
    console.error("Error assessing understanding:", error);
    res.status(500).json({ error: error.message || "An error occurred while assessing understanding." });
  }
});

// Endpoint 3: Provide pronunciation feedback and phonetic analysis
app.post("/api/pronunciation-feedback", async (req: Request, res: Response): Promise<void> => {
  try {
    const { term, userTranscription } = req.body;

    if (!term) {
      res.status(400).json({ error: "The 'term' field is required." });
      return;
    }

    if (!apiKey) {
      res.status(500).json({ 
        error: "GEMINI_API_KEY environment variable is not configured. Please add it in the Secrets panel." 
      });
      return;
    }

    let prompt = `You are an expert bilingual English-French phonetics coach.
The student wants to practice pronouncing the English word/phrase: "${term}".
`;

    if (userTranscription) {
      prompt += `The student recorded themselves trying to say "${term}". 
Our speech recognition transcribed their spoken attempt as: "${userTranscription}".

Please analyze their pronunciation attempt:
1. Provide the International Phonetic Alphabet (IPA) representation ("phonetics") of "${term}".
2. Provide a physical mouth/tongue placement guide ("mouthGuideFr") in French to pronounce "${term}" perfectly.
3. Provide constructive, warm feedback ("feedbackFr") in French. Compare their spoken attempt ("${userTranscription}") with the target ("${term}"). Explain what they did well and what went wrong (e.g., did they drop the silent 'h', pronounce a silent 'e', misplace the syllable stress, or make vowel substitutions?).
4. Rate their accuracy ("accuracyPercentage") with an integer percentage between 10 and 100. Be encouraging but realistic. If the transcription matches perfectly, score them 90-100. If there are minor differences, score them 70-89. If it's very different, score lower.`;
    } else {
      prompt += `Please provide general, expert pronunciation guidance:
1. Provide the International Phonetic Alphabet (IPA) representation ("phonetics") of "${term}".
2. Provide a physical mouth/tongue placement guide ("mouthGuideFr") in French to pronounce "${term}" perfectly (e.g. sound transitions, tongue posture, aspiration, vocal cord activation).
3. Provide common mistakes/pitfalls ("feedbackFr") in French that native French speakers typically make with this word or phrase.
4. Set the default "accuracyPercentage" to 100.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert bilingual phonetics coach specializing in helping French speakers perfect their English pronunciation. Output valid JSON in the requested schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["term", "phonetics", "mouthGuideFr", "feedbackFr", "accuracyPercentage"],
          properties: {
            term: { type: Type.STRING },
            phonetics: { type: Type.STRING, description: "IPA phonetics representation, e.g. /ˈsɛt.əl daʊn/" },
            mouthGuideFr: { type: Type.STRING, description: "Detailed guide in French of how to place the tongue, lips, and throat to make the sound." },
            feedbackFr: { type: Type.STRING, description: "Linguistic feedback or common pitfalls explained in French." },
            accuracyPercentage: { type: Type.INTEGER, description: "Score from 10 to 100 reflecting the quality of the pronunciation attempt compared to the target." }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }

    const result = JSON.parse(text);
    res.json(result);
  } catch (error: any) {
    console.error("Error analyzing pronunciation:", error);
    res.status(500).json({ error: error.message || "An error occurred while analyzing pronunciation." });
  }
});

// Vite Middleware for React Asset Serving and Hot Module Reloading in Dev
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
