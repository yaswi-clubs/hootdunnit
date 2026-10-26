import type { WitnessId } from "./cast";

/* ------------------------------------------------------------------ */
/* Categories (she picks which ones show up on her Case Board)         */
/* ------------------------------------------------------------------ */

export type CategoryId = "imagine" | "animals" | "food" | "school" | "space" | "planet" | "sport" | "tech" | "world";

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  blurb: string;
  defaultOn: boolean;
}

export const CATEGORIES: Category[] = [
  { id: "imagine", label: "Imagination", emoji: "🦄", blurb: "Superpowers, time machines, dream homes", defaultOn: true },
  { id: "animals", label: "Animals", emoji: "🐾", blurb: "Pets, wild creatures and animal swaps", defaultOn: true },
  { id: "food", label: "Food", emoji: "🍕", blurb: "Dinners, puddings and breakfasts", defaultOn: true },
  { id: "school", label: "School", emoji: "🏫", blurb: "Homework, uniforms and class pets", defaultOn: true },
  { id: "space", label: "Space & Science", emoji: "🚀", blurb: "Mars, oceans and dinosaurs", defaultOn: true },
  { id: "planet", label: "Our Planet", emoji: "🌍", blurb: "Trees, bikes and fixing things", defaultOn: true },
  { id: "sport", label: "Sport & Games", emoji: "⚽", blurb: "Teams, medals and games night", defaultOn: true },
  { id: "tech", label: "Tech", emoji: "🤖", blurb: "Phones, robots and e-books", defaultOn: true },
  { id: "world", label: "Big World", emoji: "🗺️", blurb: "Voting, languages and how the world works", defaultOn: false },
];

export const DEFAULT_CATEGORIES: CategoryId[] = CATEGORIES.filter((c) => c.defaultOn).map((c) => c.id);

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

/* ------------------------------------------------------------------ */
/* Cases                                                                */
/* ------------------------------------------------------------------ */

export type ViewKey = "a" | "b";
export type ClueKind = "fact" | "feeling";

export interface Clue {
  id: string;
  text: string;
  kind: ClueKind;
  view: ViewKey;
}

export interface View {
  who: WitnessId;
  /** Two to four words, used on buttons and badges. */
  stance: string;
  /** What the witness says when you meet them. */
  says: string;
}

export interface Case {
  id: string;
  category: CategoryId;
  emoji: string;
  title: string;
  question: string;
  views: Record<ViewKey, View>;
  clues: Clue[];
}

type RawClue = [ClueKind, string];
const fact = (text: string): RawClue => ["fact", text];
const feel = (text: string): RawClue => ["feeling", text];

interface RawCase {
  id: string;
  category: CategoryId;
  emoji: string;
  title: string;
  question: string;
  a: View & { clues: RawClue[] };
  b: View & { clues: RawClue[] };
}

const RAW: RawCase[] = [
  /* ---------------- Imagination ---------------- */
  {
    id: "super-choice",
    category: "imagine",
    emoji: "🦸",
    title: "The Case of the Super Choice",
    question: "Which superpower is best: flying or being invisible?",
    a: {
      who: "juniper",
      stance: "Flying is best",
      says: "Flying, of course! Imagine seeing the whole of Maple Hollow from the clouds.",
      clues: [
        fact("Birds can see a very long way when they fly high up."),
        feel("Zooming through the clouds would feel amazing."),
        fact("Flying in a straight line is often shorter than following winding roads."),
      ],
    },
    b: {
      who: "ziggy",
      stance: "Invisible is best",
      says: "Invisible! Nobody would ever find my secret acorn stash.",
      clues: [
        feel("Being invisible would make hide-and-seek so much fun."),
        fact("Some animals, like octopuses, change colour to hide from danger."),
        feel("Surprising your friends would be hilarious."),
      ],
    },
  },
  {
    id: "dream-home",
    category: "imagine",
    emoji: "🏡",
    title: "The Case of the Dream Home",
    question: "Would you rather live in a treehouse or an underwater house?",
    a: {
      who: "bramble",
      stance: "Treehouse",
      says: "A treehouse! I'd be surrounded by leaves and birdsong all day.",
      clues: [
        fact("Trees give shade, which keeps things cooler on hot days."),
        feel("Falling asleep to rustling leaves sounds so cosy."),
        fact("Many birds and squirrels make their homes in trees."),
      ],
    },
    b: {
      who: "otto",
      stance: "Underwater house",
      says: "Underwater, please! My neighbours would be fish and turtles.",
      clues: [
        fact("Coral reefs are home to thousands of kinds of sea creatures."),
        feel("Watching fish swim past your window would be magical."),
        feel("An underwater house would be the best place for a sleepover."),
      ],
    },
  },
  {
    id: "time-machine",
    category: "imagine",
    emoji: "⏳",
    title: "The Case of the Time Machine",
    question: "Would you rather visit the past or the future?",
    a: {
      who: "rosie",
      stance: "The past",
      says: "The past! I'd love to see how people lived long, long ago.",
      clues: [
        fact("Dinosaurs lived on Earth millions of years before people."),
        feel("Meeting people from long ago would be fascinating."),
        fact("Historians learn about the past from old letters, tools and buildings."),
      ],
    },
    b: {
      who: "fern",
      stance: "The future",
      says: "The future! I want to see what inventions come next.",
      clues: [
        feel("Seeing brand-new inventions first would be so exciting."),
        fact("Smartphones were only invented in the last 30 years or so."),
        feel("It would be fun to see what your town looks like one day."),
      ],
    },
  },

  /* ---------------- Animals ---------------- */
  {
    id: "purrfect-pet",
    category: "animals",
    emoji: "🐶",
    title: "The Case of the Purr-fect Pet",
    question: "Do cats or dogs make better pets?",
    a: {
      who: "dot",
      stance: "Cats",
      says: "Cats! They're calm and cosy, and they like to paint with their paws. Well, mine does.",
      clues: [
        fact("Cats don't need to be taken for walks."),
        feel("A cat curled up on your lap is the cosiest thing."),
        fact("Cats spend a lot of their day cleaning themselves."),
      ],
    },
    b: {
      who: "otto",
      stance: "Dogs",
      says: "Dogs! They'll come swimming with you and fetch sticks all day.",
      clues: [
        fact("Dogs need walks, which gets their owners moving too."),
        feel("A dog wagging its tail when you get home feels wonderful."),
        fact("Some dogs are trained to help people, like guide dogs."),
      ],
    },
  },
  {
    id: "zoo-visit",
    category: "animals",
    emoji: "🦁",
    title: "The Case of the Zoo Visit",
    question: "Are zoos good for animals?",
    a: {
      who: "fern",
      stance: "Zoos can help",
      says: "Good zoos can help! Some animals are only safe today because of them.",
      clues: [
        fact("The Arabian oryx was saved from dying out with help from zoos."),
        fact("Some zoos help endangered animals have babies safely."),
        feel("Seeing a real elephant up close makes you care about elephants more."),
      ],
    },
    b: {
      who: "bramble",
      stance: "Wild is better",
      says: "I think animals belong in the wild, where they can roam wherever they like.",
      clues: [
        fact("In the wild, some animals walk or swim many miles every day."),
        feel("Animals seem happiest when they're free to roam."),
        fact("Nature films let us watch animals in their real homes."),
      ],
    },
  },
  {
    id: "animal-swap",
    category: "animals",
    emoji: "🐬",
    title: "The Case of the Animal Swap",
    question: "If you could be an animal for a day, would you be a bird or a dolphin?",
    a: {
      who: "luna",
      stance: "A bird",
      says: "A bird! I'd fly up close to the stars at night.",
      clues: [
        fact("Some birds fly thousands of miles when they migrate."),
        feel("Soaring over the treetops would feel so free."),
        fact("Owls can turn their heads much further than people can."),
      ],
    },
    b: {
      who: "otto",
      stance: "A dolphin",
      says: "A dolphin! Splashing about with a whole pod of friends.",
      clues: [
        fact("Dolphins use clicks and whistles to talk to each other."),
        feel("Leaping out of the waves looks like so much fun."),
        fact("Dolphins live in groups called pods."),
      ],
    },
  },

  /* ---------------- Food ---------------- */
  {
    id: "perfect-dinner",
    category: "food",
    emoji: "🍕",
    title: "The Case of the Perfect Dinner",
    question: "Is pizza or pasta the best dinner?",
    a: {
      who: "barnaby",
      stance: "Pizza",
      says: "Pizza! A cheesy slice straight from the oven is the best.",
      clues: [
        fact("Pizza as we know it comes from Naples, in Italy."),
        feel("Pulling a cheesy slice apart is the best feeling."),
        fact("You can eat pizza with your hands, so there's less washing-up."),
      ],
    },
    b: {
      who: "pip",
      stance: "Pasta",
      says: "Pasta! A warm bowl after a long day of baking is just perfect.",
      clues: [
        fact("There are hundreds of different pasta shapes."),
        feel("A warm bowl of pasta feels like a hug."),
        fact("Lots of pasta cooks in about ten minutes."),
      ],
    },
  },
  {
    id: "upside-down-pudding",
    category: "food",
    emoji: "🍰",
    title: "The Case of the Upside-Down Pudding",
    question: "Should you ever be allowed pudding before dinner?",
    a: {
      who: "ziggy",
      stance: "Sometimes, yes",
      says: "Sometimes! A pudding-first day would be a brilliant treat.",
      clues: [
        feel("Pudding first on a birthday would feel extra special."),
        feel("Mixing up the order now and then makes meals more fun."),
        fact("In some countries, sweet and savoury foods are served together."),
      ],
    },
    b: {
      who: "barnaby",
      stance: "Dinner first",
      says: "Dinner first, I say. Then pudding is the happy ending!",
      clues: [
        fact("Vegetables help your body grow strong and healthy."),
        feel("Pudding tastes even better when you've waited for it."),
        fact("Sugary food can fill you up, leaving less room for vegetables."),
      ],
    },
  },
  {
    id: "morning-munch",
    category: "food",
    emoji: "🥞",
    title: "The Case of the Morning Munch",
    question: "Is breakfast the most important meal of the day?",
    a: {
      who: "rosie",
      stance: "Breakfast!",
      says: "Breakfast! My class learns best when their tummies are full.",
      clues: [
        fact("Breakfast gives your body energy after a long night without food."),
        feel("Pancakes on a Saturday morning make the whole day happier."),
        fact("Lots of children find it easier to concentrate after breakfast."),
      ],
    },
    b: {
      who: "juniper",
      stance: "Every meal matters",
      says: "Hmm, I think every meal matters. Inventors need fuel all day long!",
      clues: [
        fact("Your body needs healthy food throughout the whole day."),
        feel("Lunch with friends is the meal I look forward to most."),
        fact("Some people aren't hungry first thing and eat a bit later."),
      ],
    },
  },

  /* ---------------- School ---------------- */
  {
    id: "homework-question",
    category: "school",
    emoji: "📚",
    title: "The Case of the Homework Question",
    question: "Should children get homework?",
    a: {
      who: "rosie",
      stance: "A little helps",
      says: "A little homework helps! Practice makes things stick.",
      clues: [
        fact("Practising something again helps your brain remember it."),
        fact("Homework shows teachers what you understood."),
        feel("Finishing a tricky task on your own feels great."),
      ],
    },
    b: {
      who: "otto",
      stance: "More play time",
      says: "I'd rather children had more time to play outside after school.",
      clues: [
        fact("Exercise and outdoor play help children stay healthy."),
        feel("Evenings feel more relaxed without worksheets."),
        fact("Children need plenty of sleep to learn well."),
      ],
    },
  },
  {
    id: "uniform-mystery",
    category: "school",
    emoji: "👕",
    title: "The Case of the Uniform Mystery",
    question: "Should schools have uniforms?",
    a: {
      who: "fern",
      stance: "Uniforms help",
      says: "Uniforms are handy! No time wasted choosing clothes.",
      clues: [
        fact("With a uniform, you don't have to choose clothes each morning."),
        feel("Wearing the same colours can make a class feel like a team."),
        fact("Uniforms help teachers spot their pupils on school trips."),
      ],
    },
    b: {
      who: "dot",
      stance: "Own clothes",
      says: "Own clothes! What you wear is like a painting of who you are.",
      clues: [
        feel("Picking your own clothes is a fun way to show who you are."),
        fact("Some uniforms cost families a lot of money."),
        feel("Comfy clothes would make lessons feel cosier."),
      ],
    },
  },
  {
    id: "class-hamster",
    category: "school",
    emoji: "🐹",
    title: "The Case of the Class Hamster",
    question: "Should every class have a class pet?",
    a: {
      who: "ziggy",
      stance: "Yes, a pet!",
      says: "Yes! A class hamster would be everyone's best friend.",
      clues: [
        fact("Looking after a pet teaches you how to care for living things."),
        feel("Saying good morning to a hamster would make school brighter."),
        fact("Stroking animals can help people feel calmer."),
      ],
    },
    b: {
      who: "bramble",
      stance: "Better at home",
      says: "I worry a busy classroom isn't the best home for a small animal.",
      clues: [
        fact("Some people are allergic to animal fur."),
        fact("Pets need looking after at weekends and in the holidays too."),
        feel("A noisy classroom might feel stressful for a little animal."),
      ],
    },
  },

  /* ---------------- Space & Science ---------------- */
  {
    id: "red-planet",
    category: "space",
    emoji: "🚀",
    title: "The Case of the Red Planet",
    question: "Should people try to live on Mars one day?",
    a: {
      who: "luna",
      stance: "Yes, explore!",
      says: "Yes! I've watched Mars twinkle every night. I want people to visit.",
      clues: [
        fact("A day on Mars is only a little longer than a day on Earth."),
        feel("Being the first to explore a new planet would be thrilling."),
        fact("Robots called rovers are already exploring Mars."),
      ],
    },
    b: {
      who: "fern",
      stance: "Earth first",
      says: "I'd look after Earth first. It's the only home we have right now.",
      clues: [
        fact("Mars is very cold and has hardly any air to breathe."),
        fact("Earth is the only planet we know of that has life."),
        feel("Looking after our own planet feels more important right now."),
      ],
    },
  },
  {
    id: "great-unknown",
    category: "space",
    emoji: "🌊",
    title: "The Case of the Great Unknown",
    question: "Would you rather explore outer space or the deep ocean?",
    a: {
      who: "luna",
      stance: "Outer space",
      says: "Space! There are more stars out there than I could ever count.",
      clues: [
        fact("There are billions of stars in our galaxy."),
        feel("Floating around with no gravity would be so much fun."),
        fact("Astronauts can see Earth's oceans and clouds from the space station."),
      ],
    },
    b: {
      who: "otto",
      stance: "The deep ocean",
      says: "The ocean! It's right here on Earth and we've barely explored it.",
      clues: [
        fact("Most of the deep ocean has never been explored by people."),
        fact("Some deep-sea creatures make their own light."),
        feel("Meeting a giant squid would be the adventure of a lifetime."),
      ],
    },
  },
  {
    id: "dino-comeback",
    category: "space",
    emoji: "🦕",
    title: "The Case of the Dino Comeback",
    question: "If scientists could bring back dinosaurs, should they?",
    a: {
      who: "ziggy",
      stance: "Bring them back",
      says: "Yes! I'd add a real dinosaur to my collection. A small one.",
      clues: [
        feel("Seeing a real dinosaur would be the most amazing thing ever."),
        fact("Scientists have found dinosaur fossils on every continent."),
        feel("A dinosaur park would make everyone love science."),
      ],
    },
    b: {
      who: "fern",
      stance: "Let them rest",
      says: "I'm not so sure. The world has changed a lot since dinosaurs lived.",
      clues: [
        fact("Dinosaurs lived when the world's plants and weather were very different."),
        fact("Some dinosaurs were longer than a bus."),
        feel("It feels kinder to protect the animals that are alive today."),
      ],
    },
  },

  /* ---------------- Our Planet ---------------- */
  {
    id: "school-run",
    category: "planet",
    emoji: "🚲",
    title: "The Case of the School Run",
    question: "Should children walk or cycle to school instead of going by car?",
    a: {
      who: "bramble",
      stance: "Walk or cycle",
      says: "Walk or cycle! You see so much more of the world on foot.",
      clues: [
        fact("Walking and cycling don't make exhaust fumes."),
        fact("Exercise in the morning can help you feel awake and alert."),
        feel("Chatting with friends on the walk is the best part of the day."),
      ],
    },
    b: {
      who: "rosie",
      stance: "Car if needed",
      says: "Walking is lovely, but some families really do need the car.",
      clues: [
        fact("Some families live too far from school to walk."),
        feel("Rainy, cold mornings are much cosier in a car."),
        fact("Some parents drive straight on to work after the school drop-off."),
      ],
    },
  },
  {
    id: "missing-park",
    category: "planet",
    emoji: "🌳",
    title: "The Case of the Missing Park",
    question: "Should towns plant more trees instead of building car parks?",
    a: {
      who: "dot",
      stance: "More trees",
      says: "More trees! A park is the best place to sit and paint.",
      clues: [
        fact("Trees take in carbon dioxide and give out oxygen."),
        fact("Trees are homes for birds, insects and squirrels."),
        feel("A shady park is the nicest place to play on a sunny day."),
      ],
    },
    b: {
      who: "juniper",
      stance: "Car parks help",
      says: "Car parks help people get where they need to go. We need some!",
      clues: [
        fact("Car parks help people get to shops, doctors and hospitals."),
        feel("Finding a parking space quickly makes trips less stressful."),
        fact("Some people can't walk far and need to park close by."),
      ],
    },
  },
  {
    id: "broken-toy",
    category: "planet",
    emoji: "🧸",
    title: "The Case of the Broken Toy",
    question: "Is it better to fix old things or buy new ones?",
    a: {
      who: "pip",
      stance: "Fix it",
      says: "Fix it! My oven is older than me and still bakes perfect buns.",
      clues: [
        fact("Fixing things means less rubbish goes to landfill."),
        feel("A toy you've mended yourself feels extra special."),
        fact("Lots of towns have repair cafés where volunteers fix things for free."),
      ],
    },
    b: {
      who: "juniper",
      stance: "Sometimes new",
      says: "Sometimes new is better. New machines can be cleverer and greener.",
      clues: [
        fact("Newer fridges and washing machines often use less electricity."),
        feel("Unwrapping something brand new is exciting."),
        fact("Some things are very hard to fix without special parts."),
      ],
    },
  },

  /* ---------------- Sport & Games ---------------- */
  {
    id: "team-spirit",
    category: "sport",
    emoji: "⚽",
    title: "The Case of the Team Spirit",
    question: "Are team sports better than sports you do on your own?",
    a: {
      who: "otto",
      stance: "Team sports",
      says: "Teams! Everything's more fun when you do it together.",
      clues: [
        fact("In team sports, players learn to pass and work together."),
        feel("Celebrating a goal with your team feels brilliant."),
        fact("Team training is a good way to make new friends."),
      ],
    },
    b: {
      who: "luna",
      stance: "On your own",
      says: "I like going at my own pace, like a quiet night of star-gazing.",
      clues: [
        fact("In sports like swimming or running, you can practise whenever you like."),
        feel("Improving your own best time feels amazing."),
        fact("Solo sports let you go at your own speed."),
      ],
    },
  },
  {
    id: "shiny-medals",
    category: "sport",
    emoji: "🏅",
    title: "The Case of the Shiny Medals",
    question: "Should everyone get a medal for taking part?",
    a: {
      who: "dot",
      stance: "Medals for all",
      says: "Medals for everyone! Trying your best deserves something shiny.",
      clues: [
        feel("Getting a medal makes trying hard feel worth it."),
        fact("Fun runs often give every runner a medal at the finish."),
        feel("Nobody should go home feeling left out."),
      ],
    },
    b: {
      who: "otto",
      stance: "Special medals",
      says: "I think medals feel more special when they're for something extra.",
      clues: [
        fact("Many races give special medals to the fastest runners."),
        feel("A medal feels more special when it's hard to get."),
        fact("Certificates and stickers are other ways to celebrate effort."),
      ],
    },
  },
  {
    id: "games-night",
    category: "sport",
    emoji: "🎲",
    title: "The Case of the Games Night",
    question: "Are board games or video games better for a family games night?",
    a: {
      who: "pip",
      stance: "Board games",
      says: "Board games! With a plate of fresh cookies in the middle.",
      clues: [
        fact("People have played board games for thousands of years."),
        feel("Laughing around the table together is the best part."),
        fact("Board games don't need batteries or charging."),
      ],
    },
    b: {
      who: "juniper",
      stance: "Video games",
      says: "Video games! Some even let the whole family team up.",
      clues: [
        fact("Some video games let lots of people play together on one screen."),
        feel("Exploring colourful game worlds is so exciting."),
        fact("Some video games are made to teach maths or coding."),
      ],
    },
  },

  /* ---------------- Tech ---------------- */
  {
    id: "buzzing-bag",
    category: "tech",
    emoji: "📱",
    title: "The Case of the Buzzing Bag",
    question: "Should children be allowed phones at school?",
    a: {
      who: "juniper",
      stance: "Phones allowed",
      says: "Phones are clever tools! Used well, they can really help.",
      clues: [
        fact("Phones can be used to look things up for a project."),
        fact("Parents can message if plans change after school."),
        feel("Having a phone can make the walk home feel safer."),
      ],
    },
    b: {
      who: "rosie",
      stance: "Phones away",
      says: "I'd keep phones in bags. Break time is for chatting and playing.",
      clues: [
        fact("Notifications can pull your attention away from what you're doing."),
        feel("Break time feels friendlier when everyone chats face to face."),
        fact("Phones can get lost or broken at school."),
      ],
    },
  },
  {
    id: "robot-helper",
    category: "tech",
    emoji: "🤖",
    title: "The Case of the Robot Helper",
    question: "Should robots do our chores for us?",
    a: {
      who: "juniper",
      stance: "Robots, please",
      says: "Robots! I've nearly finished one that folds socks.",
      clues: [
        fact("Robot vacuum cleaners can already clean floors by themselves."),
        feel("More free time for hobbies would make weekends better."),
        fact("Robots can do heavy jobs that might hurt people."),
      ],
    },
    b: {
      who: "barnaby",
      stance: "We'll do it",
      says: "I like doing jobs myself. Cooking with friends is my favourite chore!",
      clues: [
        fact("Doing chores teaches skills you'll use when you're grown up."),
        feel("Cooking together is a lovely way to spend time as a family."),
        fact("Robots cost money and need electricity to work."),
      ],
    },
  },
  {
    id: "bedtime-story",
    category: "tech",
    emoji: "📖",
    title: "The Case of the Bedtime Story",
    question: "Are paper books better than e-books?",
    a: {
      who: "rosie",
      stance: "Paper books",
      says: "Paper books! I love the smell of a library.",
      clues: [
        feel("Turning real pages feels cosy."),
        fact("Paper books never run out of battery."),
        fact("Paper books can be borrowed and swapped with friends."),
      ],
    },
    b: {
      who: "luna",
      stance: "E-books",
      says: "E-books! I can read star maps in the dark without a torch.",
      clues: [
        fact("One e-reader can hold hundreds of books."),
        fact("E-readers let you make the words bigger."),
        feel("Carrying a whole library in your bag is brilliant."),
      ],
    },
  },

  /* ---------------- Big World ---------------- */
  {
    id: "ballot-box",
    category: "world",
    emoji: "🗳️",
    title: "The Case of the Ballot Box",
    question: "Should 16-year-olds be allowed to vote?",
    a: {
      who: "dot",
      stance: "Votes at 16",
      says: "Yes! Young people will live with these choices the longest.",
      clues: [
        fact("In Scotland and Wales, 16-year-olds can vote in some elections."),
        feel("Young people care a lot about the future."),
        fact("Many 16-year-olds already have part-time jobs."),
      ],
    },
    b: {
      who: "fern",
      stance: "Wait until 18",
      says: "I'd wait until 18, so there's more time to learn how it all works.",
      clues: [
        fact("In most countries, people start voting at 18."),
        feel("It would be nice to have more time to learn about it first."),
        fact("Lots of other grown-up rights in the UK start at 18."),
      ],
    },
  },
  {
    id: "secret-language",
    category: "world",
    emoji: "🗣️",
    title: "The Case of the Secret Language",
    question: "Should everyone learn a second language?",
    a: {
      who: "luna",
      stance: "Yes, everyone",
      says: "Yes! Then you could say hello to almost anyone in the world.",
      clues: [
        fact("More than half the people in the world speak more than one language."),
        feel("Ordering food in another language on holiday would feel brilliant."),
        fact("Speaking two languages lets you talk with more people."),
      ],
    },
    b: {
      who: "barnaby",
      stance: "Your choice",
      says: "It's a lovely idea, but maybe people should choose what they learn.",
      clues: [
        fact("Learning a language well takes many years of practice."),
        feel("Some people would rather spend that time on music or art."),
        fact("Apps can now translate between lots of languages."),
      ],
    },
  },
];

export const CASES: Case[] = RAW.map((r) => ({
  id: r.id,
  category: r.category,
  emoji: r.emoji,
  title: r.title,
  question: r.question,
  views: {
    a: { who: r.a.who, stance: r.a.stance, says: r.a.says },
    b: { who: r.b.who, stance: r.b.stance, says: r.b.says },
  },
  clues: (["a", "b"] as const).flatMap((view) =>
    r[view].clues.map(([kind, text], i) => ({ id: `${r.id}-${view}${i}`, text, kind, view })),
  ),
}));

export function getCase(id: string | null | undefined): Case | undefined {
  return CASES.find((c) => c.id === id);
}

export function casesIn(categories: CategoryId[]): Case[] {
  const list = CASES.filter((c) => categories.includes(c.category));
  return list.length ? list : CASES;
}

/** Same case all day, different tomorrow, only from the categories she picked. */
export function caseOfTheDay(categories: CategoryId[], date: Date = new Date()): Case {
  const list = casesIn(categories);
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86_400_000);
  return list[(day + date.getFullYear()) % list.length];
}

export function randomCase(categories: CategoryId[], excludeId?: string): Case {
  const list = casesIn(categories).filter((c) => c.id !== excludeId);
  return list[Math.floor(Math.random() * list.length)] ?? CASES[0];
}

export function caseIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("id");
}

export function otherView(view: ViewKey): ViewKey {
  return view === "a" ? "b" : "a";
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ------------------------------------------------------------------ */
/* Strong or Wobbly: clues that don't give a reason you can picture    */
/* ------------------------------------------------------------------ */

export const WOBBLY_CLUES: string[] = [
  "Because it just is.",
  "Everybody knows that.",
  "Because I said so!",
  "It's obviously the best. End of story.",
  "My cousin's friend's neighbour said so once.",
  "Because it's better. That's why.",
  "Nobody would ever think anything else.",
  "Just because.",
  "It's simply the right answer.",
  "Trust me, I'm sure.",
];

/* ------------------------------------------------------------------ */
/* Case Report (the boss level). Underneath it's a PEEL paragraph.     */
/* ------------------------------------------------------------------ */

export type PeelKey = "point" | "evidence" | "explanation" | "link";

export interface PeelStep {
  key: PeelKey;
  label: string;
  short: string;
  icon: string;
  prompt: string;
  tip: string;
  placeholder: string;
  stems: string[];
  tone: { solid: string; soft: string; border: string };
}

export const PEEL_STEPS: PeelStep[] = [
  {
    key: "point",
    label: "My hunch",
    short: "Hunch",
    icon: "💡",
    prompt: "What do you think the answer is?",
    tip: "Say it in one clear sentence. It's your idea, so be proud of it!",
    placeholder: "My hunch is that…",
    stems: ["My hunch is that", "I think", "After looking at the clues, I believe"],
    tone: { solid: "bg-tang text-white", soft: "bg-tang/15", border: "border-tang" },
  },
  {
    key: "evidence",
    label: "My best clue",
    short: "Clue",
    icon: "🔍",
    prompt: "Which clue backs up your hunch?",
    tip: "A fact or a real example is perfect. Tap a clue card below to borrow one.",
    placeholder: "One clue is that…",
    stems: ["One clue is that", "For example,", "I noticed that"],
    tone: { solid: "bg-iris text-white", soft: "bg-iris/15", border: "border-iris" },
  },
  {
    key: "explanation",
    label: "How it fits",
    short: "Fits",
    icon: "🧩",
    prompt: "How does your clue fit your hunch?",
    tip: "Imagine Hoot asking \"So what?\" Explain why your clue matters.",
    placeholder: "This shows that…",
    stems: ["This shows that", "This matters because", "That means"],
    tone: { solid: "bg-sun text-plum", soft: "bg-sun/30", border: "border-sun" },
  },
  {
    key: "link",
    label: "Case closed",
    short: "Closed",
    icon: "📁",
    prompt: "Wrap it up, with a kind nod to the other idea.",
    tip: "Great detectives listen to everyone. Mention the other idea, then answer the case.",
    placeholder: "Even though… I still think…",
    stems: ["Even though some people think", "So, the answer to the case is", "That's why I believe"],
    tone: { solid: "bg-leaf text-white", soft: "bg-leaf/15", border: "border-leaf" },
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
  { id: "adding", title: "Adding more", use: "Add another idea that fits.", words: ["Also,", "As well as this,", "In addition,", "What's more,", "Furthermore,"] },
  { id: "because", title: "Showing why", use: "Give the reason behind an idea.", words: ["because", "This means that", "As a result,", "So", "Because of this,"] },
  { id: "kind-nod", title: "Kind nods", use: "Show you listened to the other idea.", words: ["Even though", "Although", "On the other hand,", "Some people think", "I can see why"] },
  { id: "examples", title: "Giving examples", use: "Bring in a clue.", words: ["For example,", "For instance,", "Such as", "I noticed that", "A good example is"] },
  { id: "explaining", title: "Explaining", use: "Show why your clue matters.", words: ["This shows that", "This suggests that", "In other words,", "This matters because", "Clearly,"] },
  { id: "closing", title: "Closing the case", use: "Finish by answering the question.", words: ["Overall,", "So, all in all,", "To sum up,", "That's why", "For these reasons,"] },
];

export const CONNECTOR_WORDS: string[] = CONNECTOR_GROUPS.flatMap((g) => g.words);
