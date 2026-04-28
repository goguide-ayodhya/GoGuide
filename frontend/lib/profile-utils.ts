// lib/profile-utils.ts

export interface ProfileData {
  // Step 1: Profile
  bio: string;
  profileImage: File | null;

  // Step 2: Services
  specialities: string[];
  locations: string[];

  // Step 3: Pricing
  price: number;
  duration: string;

  // Step 4: Experience & Docs
  yearsOfExperience: number;
  languages: string[];
  certificates: Array<{
    name: string;
    image: File | null;
  }>;
}

export const SPECIALITIES = [
  "Historical Tours",
  "Adventure Tours",
  "Cultural Tours",
  "Food Tours",
  "Nature Tours",
  "City Tours",
  "Photography Tours",
  "Wildlife Tours",
  "Heritage Tours",
  "Art & Museum Tours",
  "Religious Tours",
  "Spiritual Retreats",
];

export const COMMON_LOCATIONS = [
  "Ram Mandir",
  "Hanuman Garhi",
  "Kanak Bhawan",
  "Tulsi Chaura",
  "Dashashwamedh Ghat",
  "Ramkot",
  "Janakpur",
  "Chitrakoot",
  "Gaya",
  "Varanasi",
];

export const DURATIONS = [
  "2 hours",
  "4 hours",
  "6 hours",
  "8 hours",
  "Full day",
  "2 days",
  "3 days",
  // "Custom",
];

export const LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Russian",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
];

// Calculate profile completion percentage
export function calculateProfileCompletion(data: ProfileData): number {
  const fields = [
    !!data.profileImage,
    !!data.bio?.trim(),
    data.specialities.length > 0,
    data.locations.length > 0,
    data.price > 0,
    !!data.duration,
    data.yearsOfExperience >= 0,
    data.languages.length > 0,
    data.certificates.length > 0 && data.certificates.some((c) => c.image),
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

// Save profile data to localStorage
export function saveProfileToLocalStorage(data: ProfileData, key = "guide_profile_draft") {
  try {
    const serialized = {
      ...data,
      profileImage: null, // Don't serialize File objects
      certificates: data.certificates.map((c) => ({
        ...c,
        image: null,
      })),
    };
    localStorage.setItem(key, JSON.stringify(serialized));
  } catch (err) {
    console.error("Failed to save profile to localStorage:", err);
  }
}

// Load profile data from localStorage
export function loadProfileFromLocalStorage(
  key = "guide_profile_draft"
): Partial<ProfileData> | null {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as Partial<ProfileData>;
  } catch (err) {
    console.error("Failed to load profile from localStorage:", err);
    return null;
  }
}

// Clear profile draft
export function clearProfileDraft(key = "guide_profile_draft") {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error("Failed to clear profile draft:", err);
  }
}
