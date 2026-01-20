/**
 * Script Generation API - Generate video scripts from analysis data
 * Uses Google Gemini AI to create optimized scripts
 */

export interface ScriptGenerationInput {
  analysisId?: string;
  niche: string;
  topic: string;
  style: "educational" | "entertaining" | "promotional" | "storytelling" | "tutorial";
  duration: "short" | "medium" | "long"; // 15s, 30s, 60s
  tone: "casual" | "professional" | "humorous" | "inspirational";
  targetAudience?: string;
  includeHook?: boolean;
  includeCTA?: boolean;
  keywords?: string[];
}

export interface GeneratedScript {
  id: string;
  hook: string;
  body: string[];
  callToAction: string;
  estimatedDuration: number;
  suggestedHashtags: string[];
  suggestedSounds: string[];
  tipsForDelivery: string[];
  createdAt: string;
}

export interface ScriptGenerationResult {
  script: GeneratedScript;
  alternatives?: GeneratedScript[];
}

const STYLE_PROMPTS = {
  educational: "Create an informative script that teaches the viewer something valuable. Use clear explanations and memorable tips.",
  entertaining: "Create an engaging, fun script that captures attention and entertains. Use humor, surprises, or relatable content.",
  promotional: "Create a compelling promotional script that highlights benefits and creates desire without being overly salesy.",
  storytelling: "Create a narrative-driven script with a beginning, middle, and end. Make it emotionally engaging.",
  tutorial: "Create a step-by-step tutorial script that's easy to follow. Be clear, concise, and practical.",
};

const TONE_PROMPTS = {
  casual: "Use a friendly, conversational tone like you're talking to a friend.",
  professional: "Use a polished, authoritative tone that establishes credibility.",
  humorous: "Add humor, wit, and playful language to make it entertaining.",
  inspirational: "Use motivating, uplifting language that inspires action.",
};

const DURATION_SECONDS = {
  short: 15,
  medium: 30,
  long: 60,
};

export async function generateScript(
  input: ScriptGenerationInput
): Promise<ScriptGenerationResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("No Gemini API key found, using mock script generation");
    return generateMockScript(input);
  }

  try {
    const targetDuration = DURATION_SECONDS[input.duration];
    const wordsPerSecond = 2.5; // Average speaking rate
    const targetWords = Math.round(targetDuration * wordsPerSecond);

    const prompt = `You are an expert TikTok/Instagram Reels script writer. Generate a viral video script with the following requirements:

CONTENT REQUIREMENTS:
- Niche: ${input.niche}
- Topic: ${input.topic}
- Style: ${STYLE_PROMPTS[input.style]}
- Tone: ${TONE_PROMPTS[input.tone]}
- Target Duration: ${targetDuration} seconds (approximately ${targetWords} words)
${input.targetAudience ? `- Target Audience: ${input.targetAudience}` : ""}
${input.keywords?.length ? `- Include Keywords: ${input.keywords.join(", ")}` : ""}

SCRIPT STRUCTURE:
${input.includeHook !== false ? "1. HOOK (first 2-3 seconds): A pattern-interrupt opening that stops scrolling" : ""}
2. BODY: ${input.style === "tutorial" ? "Clear steps" : "Main content"} that delivers value
${input.includeCTA !== false ? "3. CTA: A clear call-to-action at the end" : ""}

FORMAT YOUR RESPONSE AS JSON:
{
  "hook": "The opening hook text (2-3 seconds worth)",
  "body": ["Array of", "body sections", "each 5-10 seconds"],
  "callToAction": "The closing CTA",
  "estimatedDuration": ${targetDuration},
  "suggestedHashtags": ["5-7 relevant hashtags without #"],
  "suggestedSounds": ["2-3 trending sound suggestions for this type of content"],
  "tipsForDelivery": ["3-4 tips for how to deliver this script effectively"]
}

Make the script punchy, engaging, and optimized for vertical video. Focus on value and engagement.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return generateMockScript(input);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error("No content in Gemini response");
      return generateMockScript(input);
    }

    // Parse JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response");
      return generateMockScript(input);
    }

    const scriptData = JSON.parse(jsonMatch[0]);

    const script: GeneratedScript = {
      id: `script-${Date.now()}`,
      hook: scriptData.hook || "Start with an attention-grabbing statement",
      body: Array.isArray(scriptData.body) ? scriptData.body : [scriptData.body],
      callToAction: scriptData.callToAction || "Follow for more!",
      estimatedDuration: scriptData.estimatedDuration || targetDuration,
      suggestedHashtags: scriptData.suggestedHashtags || [],
      suggestedSounds: scriptData.suggestedSounds || [],
      tipsForDelivery: scriptData.tipsForDelivery || [],
      createdAt: new Date().toISOString(),
    };

    return { script };
  } catch (error) {
    console.error("Script generation error:", error);
    return generateMockScript(input);
  }
}

function generateMockScript(input: ScriptGenerationInput): ScriptGenerationResult {
  const targetDuration = DURATION_SECONDS[input.duration];

  const mockScripts: Record<string, GeneratedScript> = {
    educational: {
      id: `script-${Date.now()}`,
      hook: `Stop! Here's the ${input.topic} secret nobody talks about...`,
      body: [
        `Most people get ${input.topic} completely wrong. Here's why:`,
        `The key insight is understanding the fundamentals first.`,
        `Once you grasp this concept, everything else becomes easier.`,
        targetDuration >= 30 ? `Pro tip: Start small and build consistency.` : "",
      ].filter(Boolean),
      callToAction: "Save this and follow for more tips!",
      estimatedDuration: targetDuration,
      suggestedHashtags: [input.niche.toLowerCase(), "tips", "education", "learnontiktok", "viral"],
      suggestedSounds: ["Trending educational background music", "Lofi beats"],
      tipsForDelivery: [
        "Maintain eye contact with the camera",
        "Use hand gestures to emphasize points",
        "Speak clearly and with confidence",
        "Add text overlays for key points",
      ],
      createdAt: new Date().toISOString(),
    },
    entertaining: {
      id: `script-${Date.now()}`,
      hook: `POV: You finally understand ${input.topic}`,
      body: [
        `It's giving main character energy...`,
        `And honestly? We're here for it.`,
        targetDuration >= 30 ? `The way this just hits different.` : "",
      ].filter(Boolean),
      callToAction: "Drop a 🔥 if this is you!",
      estimatedDuration: targetDuration,
      suggestedHashtags: [input.niche.toLowerCase(), "relatable", "fyp", "viral", "trending"],
      suggestedSounds: ["Current trending sound", "Popular remix"],
      tipsForDelivery: [
        "Have fun with it - energy is contagious",
        "Use trending transitions",
        "Add meme-style text overlays",
        "React naturally to the content",
      ],
      createdAt: new Date().toISOString(),
    },
    promotional: {
      id: `script-${Date.now()}`,
      hook: `If you're struggling with ${input.topic}, this is for you`,
      body: [
        `I used to spend hours trying to figure this out.`,
        `Then I discovered this game-changing approach.`,
        `Now I save so much time and get better results.`,
        targetDuration >= 30 ? `Here's exactly how it works...` : "",
      ].filter(Boolean),
      callToAction: "Link in bio to learn more!",
      estimatedDuration: targetDuration,
      suggestedHashtags: [input.niche.toLowerCase(), "musthave", "gamechanger", "lifehack", "recommended"],
      suggestedSounds: ["Upbeat background music", "Success/transformation sound"],
      tipsForDelivery: [
        "Be genuine - don't oversell",
        "Show don't just tell",
        "Include before/after if possible",
        "Make the CTA clear and simple",
      ],
      createdAt: new Date().toISOString(),
    },
    storytelling: {
      id: `script-${Date.now()}`,
      hook: `I'll never forget the day I learned about ${input.topic}...`,
      body: [
        `It started when I least expected it.`,
        `Everything changed after that moment.`,
        `And now I want to share this with you.`,
        targetDuration >= 30 ? `Because you deserve to know the truth.` : "",
      ].filter(Boolean),
      callToAction: "Comment your experience below!",
      estimatedDuration: targetDuration,
      suggestedHashtags: [input.niche.toLowerCase(), "storytime", "emotional", "realstory", "authentic"],
      suggestedSounds: ["Emotional piano", "Cinematic background"],
      tipsForDelivery: [
        "Build tension and release",
        "Use pauses for dramatic effect",
        "Show genuine emotion",
        "Connect with viewers personally",
      ],
      createdAt: new Date().toISOString(),
    },
    tutorial: {
      id: `script-${Date.now()}`,
      hook: `Here's the fastest way to master ${input.topic}`,
      body: [
        `Step 1: Start with the basics.`,
        `Step 2: Practice the core technique.`,
        `Step 3: Add your personal touch.`,
        targetDuration >= 30 ? `Step 4: Refine and repeat until it's perfect.` : "",
      ].filter(Boolean),
      callToAction: "Follow for part 2!",
      estimatedDuration: targetDuration,
      suggestedHashtags: [input.niche.toLowerCase(), "tutorial", "howto", "stepbystep", "tips"],
      suggestedSounds: ["Tutorial background music", "Focused/productive beats"],
      tipsForDelivery: [
        "Show each step clearly",
        "Use screen recording or demos",
        "Add numbered text overlays",
        "Keep each step concise",
      ],
      createdAt: new Date().toISOString(),
    },
  };

  return {
    script: mockScripts[input.style] || mockScripts.educational,
  };
}

export function formatScriptForDisplay(script: GeneratedScript): string {
  const parts: string[] = [];

  if (script.hook) {
    parts.push(`🎬 HOOK:\n"${script.hook}"`);
  }

  if (script.body.length > 0) {
    parts.push(`\n📝 BODY:\n${script.body.map((line, i) => `${i + 1}. "${line}"`).join("\n")}`);
  }

  if (script.callToAction) {
    parts.push(`\n🎯 CTA:\n"${script.callToAction}"`);
  }

  return parts.join("\n");
}
