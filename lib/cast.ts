/** The friendly townsfolk of Maple Hollow. Every case has two of them, and both are nice. */

export type WitnessId =
  | "pip"
  | "bramble"
  | "juniper"
  | "otto"
  | "rosie"
  | "ziggy"
  | "fern"
  | "barnaby"
  | "luna"
  | "dot";

export interface Witness {
  id: WitnessId;
  name: string;
  animal: string;
  emoji: string;
  job: string;
}

export const CAST: Record<WitnessId, Witness> = {
  pip: { id: "pip", name: "Pip", animal: "hedgehog", emoji: "🦔", job: "the baker" },
  bramble: { id: "bramble", name: "Bramble", animal: "badger", emoji: "🦡", job: "the gardener" },
  juniper: { id: "juniper", name: "Juniper", animal: "fox", emoji: "🦊", job: "the inventor" },
  otto: { id: "otto", name: "Otto", animal: "otter", emoji: "🦦", job: "the swimming coach" },
  rosie: { id: "rosie", name: "Rosie", animal: "rabbit", emoji: "🐰", job: "the teacher" },
  ziggy: { id: "ziggy", name: "Ziggy", animal: "squirrel", emoji: "🐿️", job: "the collector" },
  fern: { id: "fern", name: "Fern", animal: "frog", emoji: "🐸", job: "the scientist" },
  barnaby: { id: "barnaby", name: "Barnaby", animal: "bear", emoji: "🐻", job: "the chef" },
  luna: { id: "luna", name: "Luna", animal: "koala", emoji: "🐨", job: "the star-gazer" },
  dot: { id: "dot", name: "Dot", animal: "ladybird", emoji: "🐞", job: "the artist" },
};

export const HOOT = { name: "Hoot", emoji: "🦉", job: "your detective partner" } as const;
