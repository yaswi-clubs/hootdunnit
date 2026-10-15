import type { Side } from "./types";

/* ------------------------------------------------------------------ */
/* Topics                                                              */
/* ------------------------------------------------------------------ */

export type TopicCategory = "School" | "Animals" | "Tech" | "Planet" | "Society" | "Health";

export interface Topic {
  id: string;
  motion: string;
  question: string;
  category: TopicCategory;
  emoji: string;
  /** Opening statement the sparring coach uses when it argues this side (< 40 words). */
  openings: Record<Side, string>;
  /** Extra arguments the coach can raise for each side. */
  counterpoints: Record<Side, string[]>;
}

export const TOPICS: Topic[] = [
  {
    id: "ban-homework",
    motion: "Ban homework",
    question: "Should homework be banned?",
    category: "School",
    emoji: "📚",
    openings: {
      for: "Homework should be banned. You already learn for six hours a day. Evenings are for family, sport and rest. Does a tired brain really learn better?",
      against: "Homework should stay. Practising at home helps lessons stick. It also teaches you to plan your time. Without it, wouldn't you forget most things by morning?",
    },
    counterpoints: {
      for: ["A lot of homework is just copying, not real learning.", "Not every child has a quiet place to work at home."],
      against: ["Teachers use homework to see who needs extra help.", "Practising on your own gets you ready for tests."],
    },
  },
  {
    id: "abolish-zoos",
    motion: "Abolish zoos",
    question: "Should zoos be closed down?",
    category: "Animals",
    emoji: "🦁",
    openings: {
      for: "Zoos should close. Elephants walk miles every day in the wild, but in a zoo they get a small pen. Is it fair to keep animals just so we can look?",
      against: "Zoos should stay. Many breed animals that are nearly extinct. They also teach millions of children to care about nature. Who protects those animals if zoos shut?",
    },
    counterpoints: {
      for: ["Some zoo animals show stress, like pacing up and down.", "Wildlife films can teach us without keeping animals locked up."],
      against: ["Some species only survive today because of zoo breeding.", "Zoo ticket money helps protect wild habitats."],
    },
  },
  {
    id: "ten-am-start",
    motion: "10 AM school start",
    question: "Should school start at 10 AM?",
    category: "School",
    emoji: "⏰",
    openings: {
      for: "School should start at 10. Scientists say teenagers' body clocks run later. Tired students struggle to focus. Why fight biology when we could just start later?",
      against: "Keep the early start. Parents need to get to work, and a later start means a later finish. When would clubs and sport happen?",
    },
    counterpoints: {
      for: ["Extra sleep can help with mood and memory.", "Fewer students would arrive late or skip breakfast."],
      against: ["Younger children often wake up early anyway.", "Buses and parents' work times are hard to change."],
    },
  },
  {
    id: "phones-in-school",
    motion: "Ban phones in school",
    question: "Should phones be banned in schools?",
    category: "Tech",
    emoji: "📱",
    openings: {
      for: "Ban phones in school. Notifications pull attention away from learning. Phones can also make bullying easier. Couldn't break time be better with real conversations?",
      against: "Don't ban phones. They help in emergencies and can be useful for learning. Using them sensibly is a skill. Isn't a ban just avoiding the problem?",
    },
    counterpoints: {
      for: ["Even a phone sitting on the desk can distract you.", "Some students feel left out without the latest phone."],
      against: ["Parents may need to reach their children after school.", "Phones can be used for research and quick quizzes."],
    },
  },
  {
    id: "scrap-uniform",
    motion: "Scrap school uniform",
    question: "Should school uniforms be scrapped?",
    category: "School",
    emoji: "👔",
    openings: {
      for: "Scrap uniforms. Clothes let you show who you are. Uniforms can also be expensive for families. Why should everyone look the same to learn?",
      against: "Keep uniforms. They stop competition over expensive brands, so nobody is judged for their clothes. Wouldn't mornings be harder without them?",
    },
    counterpoints: {
      for: ["Uniforms can be uncomfortable or too hot in summer.", "Choosing clothes helps you make your own decisions."],
      against: ["Uniforms can make a school feel like one team.", "Without uniforms, some kids might be teased about clothes."],
    },
  },
  {
    id: "four-day-week",
    motion: "Four-day school week",
    question: "Should schools have a four-day week?",
    category: "School",
    emoji: "📅",
    openings: {
      for: "Have a four-day week. Students and teachers would come back rested. Some schools trying it saw better attendance. Wouldn't a rested class learn more?",
      against: "Keep five days. Squeezing lessons into four days means longer, tiring days. Some families can't arrange childcare for the extra day. Who looks after younger kids then?",
    },
    counterpoints: {
      for: ["An extra day could be used for hobbies and family.", "Schools could save money on heating and buses."],
      against: ["Long school days make it harder to concentrate.", "Students might forget more over a three-day weekend."],
    },
  },
  {
    id: "votes-at-16",
    motion: "Votes at 16",
    question: "Should 16-year-olds be allowed to vote?",
    category: "Society",
    emoji: "🗳️",
    openings: {
      for: "Let 16-year-olds vote. Decisions about climate and schools affect young people most. In Scotland and Wales, 16-year-olds already vote in some elections. Why should others wait?",
      against: "Keep voting at 18. At 16, many people are still learning how government works. Most adult rights start at 18. Why make voting different?",
    },
    counterpoints: {
      for: ["Voting young might build a habit that lasts for life.", "Sixteen-year-olds can work and pay some taxes."],
      against: ["Teenagers might just copy their parents' views.", "Lots of 16-year-olds say they aren't interested yet."],
    },
  },
  {
    id: "junk-food-ads",
    motion: "Ban junk food adverts",
    question: "Should junk food adverts be banned?",
    category: "Health",
    emoji: "🍔",
    openings: {
      for: "Ban junk food adverts. Bright ads make sugary snacks look exciting, so children ask for them more. Why let companies sell unhealthy food so easily?",
      against: "Don't ban them. Families decide what to eat, not adverts. Treats are fine sometimes. Wouldn't teaching healthy eating work better than a ban?",
    },
    counterpoints: {
      for: ["Adverts often use cartoons to target children.", "Fewer adverts might mean fewer unhealthy snacks."],
      against: ["TV channels need advert money to make shows.", "People still see junk food in shops anyway."],
    },
  },
  {
    id: "games-are-sport",
    motion: "Video games are a sport",
    question: "Should video games count as a sport?",
    category: "Tech",
    emoji: "🎮",
    openings: {
      for: "Video games are a sport. Top players train for hours, react in milliseconds and compete in huge tournaments. Isn't skill and teamwork what sport is about?",
      against: "Video games aren't a sport. Sport means using your body and getting fit. Sitting still with a controller is different. Shouldn't sport mean being active?",
    },
    counterpoints: {
      for: ["Chess is called a mind sport, so why not games?", "Esports teams have coaches, practice and fans, just like football."],
      against: ["Gaming for hours isn't good for fitness.", "Calling games a sport might mean less real exercise."],
    },
  },
  {
    id: "single-use-plastic",
    motion: "Ban single-use plastic",
    question: "Should single-use plastic be banned?",
    category: "Planet",
    emoji: "🌊",
    openings: {
      for: "Ban single-use plastic. It's used for minutes but lasts hundreds of years. It ends up in oceans and hurts sea life. Why make rubbish that never goes away?",
      against: "A total ban goes too far. Some disabled people need plastic straws. Hospitals use plastic to keep things clean. Shouldn't we cut it down instead?",
    },
    counterpoints: {
      for: ["Reusable bottles and bags already work well.", "Recycling only catches a small part of our plastic."],
      against: ["Some replacements use more energy to make.", "Small shops might struggle to pay for alternatives."],
    },
  },
  {
    id: "ai-homework",
    motion: "AI for homework",
    question: "Should students be allowed to use AI for homework?",
    category: "Tech",
    emoji: "🤖",
    openings: {
      for: "Allow AI for homework. It can explain tricky ideas like a patient tutor. Adults already use AI at work. Why not learn to use it well now?",
      against: "Don't allow it. If AI does the thinking, you don't learn. Teachers can't see what you really know. Isn't homework about practising yourself?",
    },
    counterpoints: {
      for: ["AI can help instantly when no adult is around.", "Learning to check AI's answers is a useful skill."],
      against: ["AI sometimes makes mistakes but sounds confident.", "Copying from AI is unfair on students who work alone."],
    },
  },
  {
    id: "class-pet",
    motion: "A pet in every classroom",
    question: "Should every classroom have a pet?",
    category: "Animals",
    emoji: "🐹",
    openings: {
      for: "Every class should have a pet. Caring for an animal teaches responsibility and helps people feel calm. Wouldn't a hamster make Monday mornings better?",
      against: "No class pets. Some children have allergies or fears. Who looks after the pet in the holidays? Is a noisy classroom fair on an animal?",
    },
    counterpoints: {
      for: ["Pets can help shy pupils feel relaxed.", "Looking after a pet teaches science and nature."],
      against: ["Pets need care at weekends when school is closed.", "Classroom noise can stress small animals."],
    },
  },
];

export function getTopic(id: string | null | undefined): Topic | undefined {
  if (!id) return undefined;
  return TOPICS.find((t) => t.id === id);
}

export function randomTopic(excludeId?: string): Topic {
  const pool = excludeId ? TOPICS.filter((t) => t.id !== excludeId) : TOPICS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function topicOfTheDay(date: Date = new Date()): Topic {
  const dayNumber = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  return TOPICS[dayNumber % TOPICS.length];
}

/** Reads ?topic=<id> from the current URL (client only). */
export function topicIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("topic");
}

export function opposite(side: Side): Side {
  return side === "for" ? "against" : "for";
}

/* ------------------------------------------------------------------ */
/* Switch Sides sentence stems                                         */
/* ------------------------------------------------------------------ */

export const ARENA_STEMS: Record<Side, string[]> = {
  for: ["This is a good idea because", "One big benefit is", "This would help people by", "Imagine if"],
  against: ["The problem with this is", "This could go wrong because", "Some people would lose out because", "A better idea would be"],
};

export const REASON_STEMS: string[] = [
  "it affects more people",
  "it lasts longer",
  "the evidence is stronger",
  "it is fairer to everyone",
];

/* ------------------------------------------------------------------ */
/* PEEL                                                                */
/* ------------------------------------------------------------------ */

export type PeelKey = "point" | "evidence" | "explanation" | "link";

export interface PeelStep {
  key: PeelKey;
  letter: string;
  label: string;
  prompt: string;
  tip: string;
  placeholder: string;
  stems: string[];
  /** Full Tailwind class strings (kept literal so Tailwind can see them). */
  tone: {
    solid: string;
    soft: string;
    text: string;
    border: string;
  };
}

export const PEEL_STEPS: PeelStep[] = [
  {
    key: "point",
    letter: "P",
    label: "Point",
    prompt: "Make your main point in one clear sentence.",
    tip: "Answer the question straight away. You don't need \"I think\".",
    placeholder: "The main reason homework should be banned is that…",
    stems: ["The main reason is that", "One important point is that", "Firstly,"],
    tone: { solid: "bg-tang text-white", soft: "bg-tang/15", text: "text-tang-dark", border: "border-tang" },
  },
  {
    key: "evidence",
    letter: "E",
    label: "Evidence",
    prompt: "Back it up with a fact, a number or a real example.",
    tip: "Facts beat feelings. What did an expert say? What actually happened?",
    placeholder: "For example, a survey of 1,000 pupils found…",
    stems: ["For example,", "According to", "Research shows that", "A good example is"],
    tone: { solid: "bg-iris text-white", soft: "bg-iris/15", text: "text-iris-dark", border: "border-iris" },
  },
  {
    key: "explanation",
    letter: "E",
    label: "Explain",
    prompt: "Explain how your evidence proves your point.",
    tip: "Answer \"so what?\". Why does your evidence matter?",
    placeholder: "This shows that…",
    stems: ["This shows that", "This means that", "As a result,", "This matters because"],
    tone: { solid: "bg-sun text-plum", soft: "bg-sun/30", text: "text-plum", border: "border-sun" },
  },
  {
    key: "link",
    letter: "L",
    label: "Link",
    prompt: "Link back to the question.",
    tip: "Use words from the question so the reader sees you've answered it.",
    placeholder: "Therefore, homework should be banned because…",
    stems: ["Therefore,", "Overall, this proves that", "This is why"],
    tone: { solid: "bg-leaf text-white", soft: "bg-leaf/15", text: "text-leaf-dark", border: "border-leaf" },
  },
];

export const PEEL_KEYS: PeelKey[] = PEEL_STEPS.map((s) => s.key);

export interface ConnectorGroup {
  id: string;
  title: string;
  use: string;
  words: string[];
}

export const CONNECTOR_GROUPS: ConnectorGroup[] = [
  { id: "adding", title: "Adding ideas", use: "Add another point on the same side.", words: ["Furthermore,", "Moreover,", "In addition,", "Also,", "As well as this,"] },
  { id: "results", title: "Showing results", use: "Show what happens because of something.", words: ["Consequently,", "Therefore,", "As a result,", "This means that", "Because of this,"] },
  { id: "contrast", title: "Contrasting", use: "Bring in the other side.", words: ["Conversely,", "However,", "On the other hand,", "Nevertheless,", "Although"] },
  { id: "examples", title: "Giving examples", use: "Introduce your evidence.", words: ["For example,", "For instance,", "Such as", "According to", "Research shows that"] },
  { id: "explaining", title: "Explaining", use: "Show why your evidence matters.", words: ["This shows that", "This suggests that", "In other words,", "This proves that", "Clearly,"] },
  { id: "linking", title: "Linking back", use: "Finish by answering the question.", words: ["Overall,", "Ultimately,", "To conclude,", "This is why", "For these reasons,"] },
];

export const CONNECTOR_WORDS: string[] = CONNECTOR_GROUPS.flatMap((g) => g.words);
