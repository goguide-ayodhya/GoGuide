const badWords = [
  // English
  "abuse", "spam", "scam", "cheat", "bastard", "bitch", "cunt", "fuck", "fucker", "fucking",
  "shit", "asshole", "dick", "pussy", "slut", "whore", "idiot", "stupid", "crap",
  // Hindi transliterations (common offensive words)
  "chutiya", "bhenchod", "madarchod", "gandu", "harami", "kamina", "saala", "kuttiya",
  "bhosdike", "chut", "lauda", "loda", "tatte", "randi", "r@ndi"
];

export function filterProfanity(text: string): string {
  if (!text) return text;
  let filtered = text;
  for (const word of badWords) {
    // Escape characters for regex
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedWord}\\b`, "gi");
    filtered = filtered.replace(regex, (match) => "*".repeat(match.length));
  }
  return filtered;
}
