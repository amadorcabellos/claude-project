const adjectives = [
  "Swift",
  "Silent",
  "Bold",
  "Quick",
  "Clever",
  "Sly",
  "Phantom",
  "Shadow",
  "Sneaky",
  "Daring",
  "Nimble",
  "Cunning",
  "Stealthy",
  "Rogue",
  "Hidden",
  "Wily",
  "Brave",
  "Frosty",
  "Lucky",
  "Midnight",
]

const colors = [
  "Crimson",
  "Azure",
  "Violet",
  "Golden",
  "Silver",
  "Obsidian",
  "Scarlet",
  "Emerald",
  "Cobalt",
  "Amber",
  "Ivory",
  "Onyx",
  "Copper",
  "Jade",
  "Ruby",
  "Indigo",
  "Sapphire",
  "Bronze",
  "Teal",
  "Ashen",
]

const nouns = [
  "Falcon",
  "Fox",
  "Wolf",
  "Raven",
  "Tiger",
  "Viper",
  "Panther",
  "Hawk",
  "Cobra",
  "Lynx",
  "Owl",
  "Jackal",
  "Badger",
  "Mantis",
  "Shark",
  "Coyote",
  "Weasel",
  "Spider",
  "Puma",
  "Otter",
]

function pick(words: string[]) {
  return words[Math.floor(Math.random() * words.length)]
}

// one word from each set in PascalCase, e.g. "SwiftCrimsonFalcon"
export function generateCodename(): string {
  return `${pick(adjectives)}${pick(colors)}${pick(nouns)}`
}
