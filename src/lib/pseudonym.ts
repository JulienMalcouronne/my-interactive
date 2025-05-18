const ADJECTIVES = [
  "Silver",
  "Crimson",
  "Midnight",
  "Shadow",
  "Golden",
  "Lunar",
  "Neon",
  "Silent",
  "Rapid",
  "Wandering",
  "Electric",
  "Broken",
  "Hidden",
  "Stormy",
  "Whispering",
];

const NOUNS = [
  "Fox",
  "Wolf",
  "Eagle",
  "Rider",
  "Wanderer",
  "Phantom",
  "Raven",
  "Nomad",
  "Blade",
  "Falcon",
  "Seeker",
  "Guardian",
  "Drifter",
  "Phoenix",
  "Specter",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePseudonym(): string {
  const adj = rand(ADJECTIVES);
  const noun = rand(NOUNS);
  const num = Math.floor(Math.random() * 90) + 10; // 10–99
  return `${adj}${noun}${num}`;
}
