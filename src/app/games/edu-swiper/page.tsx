"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { AdSenseBanner } from "@/components/ads";
import { useStreak } from "@/hooks";

interface Card {
  id: string;
  type: "concept" | "question" | "explanation";
  content: string;
  question?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
}

interface Topic {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  cards: Card[];
}

interface TopicProgress {
  completedCardIds: string[];
  xp: number;
  level: number;
  lastPlayedDate: string;
  dailyCardsCompleted: number;
}

interface ProgressState {
  [topicId: string]: TopicProgress;
}

const STORAGE_KEY = "edu-swiper-progress";

const TOPICS: Topic[] = [
  {
    id: "spanish-basics",
    name: "Spanish Basics",
    icon: "🇪🇸",
    color: "#ef4444",
    description: "Essential Spanish phrases and vocabulary",
    cards: [
      { id: "s1", type: "concept", content: "¡Hola! means Hello! It's the most common greeting in Spanish." },
      { id: "s2", type: "question", content: "What does ¡Hola! mean?", question: "What does ¡Hola! mean?", options: ["Goodbye", "Hello", "Thank you", "Please"], correctAnswer: 1, explanation: "¡Hola! is the universal Spanish greeting for Hello!" },
      { id: "s3", type: "concept", content: "Gracias means Thank you. Use it anytime someone helps you." },
      { id: "s4", type: "question", content: "How do you say Thank you in Spanish?", question: "How do you say Thank you in Spanish?", options: ["Por favor", "Gracias", "De nada", "Lo siento"], correctAnswer: 1, explanation: "Gracias = Thank you. Por favor = Please. De nada = You're welcome." },
      { id: "s5", type: "concept", content: "¿Cómo estás? means How are you? The upside-down question mark is unique to Spanish!" },
      { id: "s6", type: "question", content: "What does ¿Cómo estás? mean?", question: "What does ¿Cómo estás? mean?", options: ["What's your name?", "How are you?", "Where are you?", "Who are you?"], correctAnswer: 1, explanation: "¿Cómo estás? = How are you? The inverted question marks are required in Spanish." },
      { id: "s7", type: "concept", content: "Adiós means Goodbye. Use it when leaving or ending a conversation." },
      { id: "s8", type: "question", content: "Which word means Goodbye?", question: "Which word means Goodbye?", options: ["Hola", "Adiós", "Gracias", "Sí"], correctAnswer: 1, explanation: "Adiós = Goodbye. Hola = Hello. Remember: they're opposites!" },
      { id: "s9", type: "concept", content: "Sí means Yes, No means No. These are the same in many languages!" },
      { id: "s10", type: "question", content: "How do you say Yes in Spanish?", question: "How do you say Yes in Spanish?", options: ["No", "Sí", "Ya", "Yo"], correctAnswer: 1, explanation: "Sí = Yes (with accent). No = No (same as English)." },
      { id: "s11", type: "concept", content: "Por favor means Please. Always be polite!" },
      { id: "s12", type: "question", content: "What does Por favor mean?", question: "What does Por favor mean?", options: ["Thank you", "Please", "Excuse me", "Sorry"], correctAnswer: 1, explanation: "Por favor = Please. Gracias = Thank you. They go together!" },
      { id: "s13", type: "concept", content: "De nada means You're welcome. Literally: 'Of nothing' - it was no trouble!" },
      { id: "s14", type: "question", content: "How do you respond to Gracias?", question: "How do you respond to Gracias?", options: ["De nada", "Por favor", "Hola", "Adiós"], correctAnswer: 0, explanation: "De nada = You're welcome. It's the polite response to Gracias!" },
      { id: "s15", type: "explanation", content: "Great job! You've learned 7 essential Spanish phrases. Practice daily to build fluency!", explanation: "You've mastered basic greetings and polite phrases. Keep practicing!" }
    ]
  },
  {
    id: "japanese-basics",
    name: "Japanese Basics",
    icon: "🇯🇵",
    color: "#f97316",
    description: "Fundamental Japanese greetings and words",
    cards: [
      { id: "j1", type: "concept", content: "こんにちは (Konnichiwa) means Hello/Good afternoon. Used during daytime." },
      { id: "j2", type: "question", content: "When do you use Konnichiwa?", question: "When do you use こんにちは (Konnichiwa)?", options: ["Morning only", "Daytime", "Night only", "Anytime"], correctAnswer: 1, explanation: "Konnichiwa is used during daytime (roughly 11am-5pm)." },
      { id: "j3", type: "concept", content: "ありがとうございます (Arigatou gozaimasu) means Thank you (polite)." },
      { id: "j4", type: "question", content: "Which is the polite Thank you?", question: "Which is the polite form of Thank you?", options: ["Arigatou", "Arigatou gozaimasu", "Domo", "Sumimasen"], correctAnswer: 1, explanation: "Arigatou gozaimasu is polite. Arigatou is casual. Use gozaimasu with strangers/elders." },
      { id: "j5", type: "concept", content: "すみません (Sumimasen) means Excuse me / Sorry. Very versatile!" },
      { id: "j6", type: "question", content: "What does Sumimasen mean?", question: "What does すみません (Sumimasen) mean?", options: ["Thank you", "Hello", "Excuse me/Sorry", "Goodbye"], correctAnswer: 2, explanation: "Sumimasen = Excuse me (getting attention) OR Sorry (apology). Super useful!" },
      { id: "j7", type: "concept", content: "はい (Hai) means Yes. いいえ (Iie) means No." },
      { id: "j8", type: "question", content: "How do you say Yes in Japanese?", question: "How do you say Yes in Japanese?", options: ["Iie", "Hai", "Domo", "Konnichiwa"], correctAnswer: 1, explanation: "Hai = Yes. Iie = No. Hai is also used to show you're listening." },
      { id: "j9", type: "concept", content: "おはようございます (Ohayou gozaimasu) = Good morning (polite)." },
      { id: "j10", type: "question", content: "Which greeting is for morning?", question: "Which greeting is used in the morning?", options: ["Konnichiwa", "Konbanwa", "Ohayou gozaimasu", "Sayonara"], correctAnswer: 2, explanation: "Ohayou gozaimasu = Good morning. Konnichiwa = Good afternoon. Konbanwa = Good evening." },
      { id: "j11", type: "concept", content: "さようなら (Sayounara) means Goodbye (formal/final). Casual: バイバイ (Baibai)." },
      { id: "j12", type: "question", content: "What's the casual Goodbye?", question: "What's the casual way to say Goodbye?", options: ["Sayounara", "Baibai", "Konnichiwa", "Arigatou"], correctAnswer: 1, explanation: "Baibai (from Bye-bye) is casual. Sayounara is formal/final." },
      { id: "j13", type: "concept", content: "お疲れ様です (Otsukaresama desu) = Thanks for your hard work. Used in workplaces!" },
      { id: "j14", type: "question", content: "When do you say Otsukaresama desu?", question: "When is お疲れ様です (Otsukaresama desu) used?", options: ["Meeting friends", "Leaving work", "Eating dinner", "Waking up"], correctAnswer: 1, explanation: "Otsukaresama desu is said to coworkers when leaving or acknowledging effort." },
      { id: "j15", type: "explanation", content: "Excellent! You know 7 key Japanese phrases. The politeness levels are key in Japanese culture!", explanation: "You've learned greetings, thanks, and workplace etiquette. Japanese politeness levels matter!" }
    ]
  },
  {
    id: "coding-js",
    name: "JavaScript Basics",
    icon: "💻",
    color: "#f59e0b",
    description: "Core JavaScript concepts for beginners",
    cards: [
      { id: "c1", type: "concept", content: "let and const declare variables. let = reassignable, const = constant. Avoid var!" },
      { id: "c2", type: "question", content: "Which declares a constant?", question: "Which keyword declares a constant that cannot be reassigned?", options: ["var", "let", "const", "variable"], correctAnswer: 2, explanation: "const creates a constant binding. The value can't be reassigned (objects/arrays can still be mutated)." },
      { id: "c3", type: "concept", content: "Arrow functions: const add = (a, b) => a + b; Shorter syntax, lexical 'this'." },
      { id: "c4", type: "question", content: "What does (x) => x * 2 return for input 5?", question: "What does the arrow function (x) => x * 2 return when called with 5?", options: ["5", "7", "10", "25"], correctAnswer: 2, explanation: "(x) => x * 2 means 'multiply input by 2'. 5 * 2 = 10." },
      { id: "c5", type: "concept", content: "Template literals use backticks: \`Hello \${name}!\`. Allow multiline strings & interpolation." },
      { id: "c6", type: "question", content: "What is \`Hello \${'World'}\`?", question: "What does the template literal \`Hello \${'World'}\` evaluate to?", options: ["Hello World", "Hello \${'World'}", "Hello World", "Error"], correctAnswer: 0, explanation: "Template literals interpolate expressions inside \${}. Result: 'Hello World'." },
      { id: "c7", type: "concept", content: "Destructuring: const {name, age} = person; Extracts properties into variables." },
      { id: "c8", type: "question", content: "What does const {x} = {x: 5, y: 10} give you?", question: "After const {x} = {x: 5, y: 10}, what is x?", options: ["undefined", "5", "{x: 5}", "Error"], correctAnswer: 1, explanation: "Destructuring extracts the x property. x = 5. y is ignored." },
      { id: "c9", type: "concept", content: "Array methods: map, filter, find, reduce. Transform data without loops!" },
      { id: "c10", type: "question", content: "What does [1,2,3].map(x => x * 2) return?", question: "What does [1, 2, 3].map(x => x * 2) return?", options: ["[1, 2, 3]", "[2, 4, 6]", "[1, 4, 9]", "[3, 4, 5]"], correctAnswer: 1, explanation: "map transforms each element. 1*2=2, 2*2=4, 3*2=6. Returns [2, 4, 6]." },
      { id: "c11", type: "concept", content: "Promises handle async: fetch(url).then(r => r.json()).catch(err => console.error(err))" },
      { id: "c12", type: "question", content: "What does Promise.resolve(5).then(x => x * 2) resolve to?", question: "What does Promise.resolve(5).then(x => x * 2) resolve to?", options: ["5", "7", "10", "Promise"], correctAnswer: 2, explanation: "The .then() receives the resolved value (5), returns 10. The chain resolves to 10." },
      { id: "c13", type: "concept", content: "async/await makes promises readable: const data = await fetch(url); const json = await data.json();" },
      { id: "c14", type: "question", content: "What keyword pauses execution until promise resolves?", question: "What keyword pauses function execution until a Promise resolves?", options: ["wait", "pause", "await", "async"], correctAnswer: 2, explanation: "await pauses the async function until the Promise settles. Must be inside async function." },
      { id: "c15", type: "explanation", content: "Nice! You've covered JS fundamentals: variables, arrows, templates, destructuring, arrays, promises. Keep coding!", explanation: "You've learned modern JavaScript essentials. These patterns are used in React, Node.js, and everywhere JS runs!" }
    ]
  },
  {
    id: "biology-basics",
    name: "Biology Basics",
    icon: "🧬",
    color: "#22c55e",
    description: "Fundamental biology concepts",
    cards: [
      { id: "b1", type: "concept", content: "Cells are the basic unit of life. All living things are made of cells!" },
      { id: "b2", type: "question", content: "What is the basic unit of life?", question: "What is considered the basic unit of life?", options: ["Atom", "Molecule", "Cell", "Tissue"], correctAnswer: 2, explanation: "Cells are the smallest unit that can carry out all life processes. All organisms are made of cells." },
      { id: "b3", type: "concept", content: "DNA (Deoxyribonucleic Acid) carries genetic instructions. Double helix structure!" },
      { id: "b4", type: "question", content: "What does DNA stand for?", question: "What does DNA stand for?", options: ["Deoxyribonucleic Acid", "Deoxyribose Nucleic Acid", "DNA Acid", "Dynamic Nucleic Acid"], correctAnswer: 0, explanation: "DNA = Deoxyribonucleic Acid. It stores genetic information in a double helix." },
      { id: "b5", type: "concept", content: "Photosynthesis: Plants convert CO₂ + H₂O + light → glucose + O₂. Chlorophyll makes it green!" },
      { id: "b6", type: "question", content: "What gas do plants release during photosynthesis?", question: "What gas do plants release during photosynthesis?", options: ["CO₂", "O₂", "N₂", "H₂"], correctAnswer: 1, explanation: "Plants release oxygen (O₂) as a byproduct. We breathe what plants exhale!" },
      { id: "b7", type: "concept", content: "Mitochondria are the 'powerhouse of the cell' - they make ATP (energy) from glucose." },
      { id: "b8", type: "question", content: "Which organelle makes ATP?", question: "Which organelle is known as the 'powerhouse of the cell'?", options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"], correctAnswer: 1, explanation: "Mitochondria produce ATP through cellular respiration. Powerhouse of the cell!" },
      { id: "b9", type: "concept", content: "Evolution by natural selection: Organisms with helpful traits survive and reproduce more." },
      { id: "b10", type: "question", content: "Who proposed natural selection?", question: "Who proposed the theory of evolution by natural selection?", options: ["Darwin", "Mendel", "Einstein", "Newton"], correctAnswer: 0, explanation: "Charles Darwin (and Alfred Russel Wallace) proposed natural selection in 1859." },
      { id: "b11", type: "concept", content: "Proteins are made of amino acids. 20 standard amino acids build all proteins!" },
      { id: "b12", type: "question", content: "How many standard amino acids?", question: "How many standard amino acids are used to build proteins?", options: ["10", "20", "30", "40"], correctAnswer: 1, explanation: "20 standard amino acids combine in different sequences to create all proteins." },
      { id: "b13", type: "concept", content: "Homeostasis: Organisms maintain stable internal conditions (temp, pH, glucose) despite external changes." },
      { id: "b14", type: "question", content: "What is homeostasis?", question: "What is homeostasis?", options: ["Cell division", "Maintaining stable internal conditions", "DNA replication", "Evolution"], correctAnswer: 1, explanation: "Homeostasis = maintaining stable internal environment (body temp, blood sugar, pH, etc.)." },
      { id: "b15", type: "explanation", content: "Fantastic! You've covered cell biology, genetics, energy, evolution, and physiology basics. Biology is life!", explanation: "You've learned the foundations of biology: cells, DNA, energy, evolution, proteins, and homeostasis. Life is amazing!" }
    ]
  },
  {
    id: "history-world",
    name: "World History",
    icon: "🌍",
    color: "#8b5cf6",
    description: "Key events and civilizations in world history",
    cards: [
      { id: "h1", type: "concept", content: "Mesopotamia (modern Iraq) = 'Cradle of Civilization'. First cities, writing (cuneiform), laws (Hammurabi)." },
      { id: "h2", type: "question", content: "Where was the first civilization?", question: "Which region is called the 'Cradle of Civilization'?", options: ["Egypt", "Mesopotamia", "China", "Indus Valley"], correctAnswer: 1, explanation: "Mesopotamia (between Tigris & Euphrates) had the first cities, writing, and law codes." },
      { id: "h3", type: "concept", content: "Ancient Egypt: Nile River, pyramids, pharaohs, hieroglyphics. Lasted 3000+ years!" },
      { id: "h4", type: "question", content: "What river was Egypt built around?", question: "Ancient Egyptian civilization developed along which river?", options: ["Nile", "Tigris", "Euphrates", "Indus"], correctAnswer: 0, explanation: "The Nile River provided water, fertile soil, and transportation. 'Gift of the Nile'." },
      { id: "h5", type: "concept", content: "Classical Greece: Democracy (Athens), philosophy (Socrates, Plato, Aristotle), Olympics." },
      { id: "h6", type: "question", content: "Which city-state invented democracy?", question: "Which Greek city-state developed the first democracy?", options: ["Sparta", "Athens", "Corinth", "Thebes"], correctAnswer: 1, explanation: "Athens developed direct democracy around 508 BCE. Citizens voted on laws directly." },
      { id: "h7", type: "concept", content: "Roman Republic → Roman Empire. Law, engineering (roads, aqueducts), Latin language spread." },
      { id: "h8", type: "question", content: "What language did Romans spread?", question: "What language did the Roman Empire spread across Europe?", options: ["Greek", "Latin", "Aramaic", "Celtic"], correctAnswer: 1, explanation: "Latin became the lingua franca. Evolved into Romance languages (Spanish, French, Italian, etc.)." },
      { id: "h9", type: "concept", content: "Silk Road: Trade network connecting China to Mediterranean. Goods, ideas, religions spread." },
      { id: "h10", type: "question", content: "What connected China to the Mediterranean?", question: "What was the ancient trade network connecting East and West called?", options: ["Spice Route", "Silk Road", "Amber Road", "Incense Route"], correctAnswer: 1, explanation: "The Silk Road connected China to the Mediterranean. Silk, spices, ideas, and religions traveled it." },
      { id: "h11", type: "concept", content: "Mongol Empire: Largest contiguous land empire. Genghis Khan, Pax Mongolica, trade flourished." },
      { id: "h12", type: "question", content: "Who founded the Mongol Empire?", question: "Who founded the Mongol Empire?", options: ["Kublai Khan", "Genghis Khan", "Attila", "Tamerlane"], correctAnswer: 1, explanation: "Genghis Khan (Temüjin) united Mongol tribes and began conquests in 1206." },
      { id: "h13", type: "concept", content: "Renaissance: 'Rebirth' of art/science in Europe (14th-17th c.). Da Vinci, Michelangelo, Gutenberg press." },
      { id: "h14", type: "question", content: "What invention spread knowledge in the Renaissance?", question: "What invention revolutionized information spread during the Renaissance?", options: ["Compass", "Gunpowder", "Printing press", "Telescope"], correctAnswer: 2, explanation: "Gutenberg's printing press (c. 1440) made books affordable. Knowledge exploded!" },
      { id: "h15", type: "explanation", content: "Amazing! You've toured 4000+ years of human civilization. History helps us understand today!", explanation: "From Mesopotamia to the Renaissance, you've seen the rise of cities, empires, trade, and ideas. History connects us all!" }
    ]
  }
];

const XP_PER_CORRECT = 10;
const XP_PER_DAILY_GOAL = 50;
const CARDS_PER_DAILY_GOAL = 5;
const XP_PER_LEVEL = 100;

function loadProgress(): ProgressState {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load edu-swiper progress:", e);
  }
  return {};
}

function saveProgress(progress: ProgressState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save edu-swiper progress:", e);
  }
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export default function EduSwiper() {
  const initialProgress = loadProgress();
  const [showTopicSelect, setShowTopicSelect] = useState(true);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiType, setConfettiType] = useState<"levelup" | "daily" | "correct" | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { display: streakDisplay, markActive } = useStreak();

  // Mobile check - using setTimeout to avoid synchronous setState in effect
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    const timeoutId = setTimeout(checkMobile, 0);
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    // Calculate total XP and level from all topics
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotalXP((prev) => {
      let xp = 0;
      Object.values(progress).forEach((p) => {
        xp += p.xp;
      });
      return xp;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLevel((prev) => {
      let xp = 0;
      Object.values(progress).forEach((p) => {
        xp += p.xp;
      });
      return Math.floor(xp / XP_PER_LEVEL) + 1;
    });
    markActive();
  }, [progress, markActive]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const triggerHaptic = useCallback((type: "light" | "medium" | "heavy" = "light") => {
    if ("vibrate" in navigator) {
      const patterns = { light: 10, medium: 30, heavy: [20, 10, 20] };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX);
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartX === null || !currentTopic) return;
    const deltaX = e.touches[0].clientX - dragStartX;
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
    }
  }, [dragStartX, currentTopic]);

  const handleTouchEnd = useCallback(() => {
    if (dragStartX === null || !currentTopic) return;
    setIsDragging(false);
    setDragStartX(null);
    if (cardRef.current) {
      cardRef.current.style.transform = "";
    }
  }, [dragStartX, currentTopic]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragStartX(e.clientX);
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragStartX === null || !currentTopic) return;
    const deltaX = e.clientX - dragStartX;
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
    }
  }, [dragStartX, currentTopic]);

  const handleMouseUp = useCallback(() => {
    if (dragStartX === null || !currentTopic) return;
    const deltaX = dragStartX - (dragStartX === null ? 0 : dragStartX); // This won't work, need to track end
    setIsDragging(false);
    setDragStartX(null);
    if (cardRef.current) {
      cardRef.current.style.transform = "";
    }
  }, [dragStartX, currentTopic]);

  // Better swipe detection
  const handleSwipe = useCallback((deltaX: number) => {
    if (!currentTopic) return;
    const threshold = 80;
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // Swipe right - previous card
        if (cardIndex > 0) {
          triggerHaptic("light");
          setCardIndex((prev) => prev - 1);
        }
      } else {
        // Swipe left - next card
        if (cardIndex < currentTopic.cards.length - 1) {
          triggerHaptic("light");
          setCardIndex((prev) => prev + 1);
        } else {
          // Topic complete!
          handleTopicComplete();
        }
      }
    }
  }, [currentTopic, cardIndex, triggerHaptic]);

  // Touch end with swipe detection
  const handleTouchEndSwipe = useCallback((e: React.TouchEvent) => {
    if (dragStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - dragStartX;
    handleSwipe(deltaX);
    setIsDragging(false);
    setDragStartX(null);
    if (cardRef.current) {
      cardRef.current.style.transform = "";
    }
  }, [dragStartX, handleSwipe]);

  const handleMouseUpSwipe = useCallback((e: React.MouseEvent) => {
    if (dragStartX === null) return;
    const deltaX = e.clientX - dragStartX;
    handleSwipe(deltaX);
    setIsDragging(false);
    setDragStartX(null);
    if (cardRef.current) {
      cardRef.current.style.transform = "";
    }
  }, [dragStartX, handleSwipe]);

  const selectTopic = useCallback((topic: Topic) => {
    setCurrentTopic(topic);
    setCardIndex(0);
    setShowTopicSelect(false);
    triggerHaptic("medium");
  }, [triggerHaptic]);

  const goBackToTopics = useCallback(() => {
    setShowTopicSelect(true);
    setCurrentTopic(null);
    setCardIndex(0);
    triggerHaptic("light");
  }, [triggerHaptic]);

  const answerQuestion = useCallback((selectedIndex: number) => {
    if (!currentTopic) return;
    const card = currentTopic.cards[cardIndex];
    if (card.type !== "question" || card.correctAnswer === undefined) return;

    const isCorrect = selectedIndex === card.correctAnswer;
    triggerHaptic(isCorrect ? "medium" : "heavy");

    if (isCorrect) {
      // Award XP
      const newXP = XP_PER_CORRECT;
      setTotalXP((prev) => prev + newXP);

      // Update topic progress
      setProgress((prev) => {
        const topicProgress = prev[currentTopic.id] || {
          completedCardIds: [],
          xp: 0,
          level: 1,
          lastPlayedDate: "",
          dailyCardsCompleted: 0
        };

        const newCompletedCards = [...topicProgress.completedCardIds];
        if (!newCompletedCards.includes(card.id)) {
          newCompletedCards.push(card.id);
        }

        const today = getTodayString();
        const dailyCardsCompleted = topicProgress.lastPlayedDate === today
          ? topicProgress.dailyCardsCompleted + 1
          : 1;

        const newProgress = {
          ...topicProgress,
          completedCardIds: newCompletedCards,
          xp: topicProgress.xp + newXP,
          lastPlayedDate: today,
          dailyCardsCompleted,
        };

        // Check for daily goal
        if (dailyCardsCompleted === CARDS_PER_DAILY_GOAL) {
          setConfettiType("daily");
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);

          // Bonus XP for daily goal
          newProgress.xp += XP_PER_DAILY_GOAL;
          setTotalXP((prev) => prev + XP_PER_DAILY_GOAL);
        }

        // Check for level up
        const newTotalXP = (prev[currentTopic.id]?.xp || 0) + newXP + (dailyCardsCompleted === CARDS_PER_DAILY_GOAL ? XP_PER_DAILY_GOAL : 0);
        const oldLevel = Math.floor((prev[currentTopic.id]?.xp || 0) / XP_PER_LEVEL) + 1;
        const newLevel = Math.floor(newTotalXP / XP_PER_LEVEL) + 1;

        if (newLevel > oldLevel) {
          setConfettiType("levelup");
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
        }

        return { ...prev, [currentTopic.id]: newProgress };
      });

      setConfettiType("correct");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);

      // Auto-advance after correct answer
      setTimeout(() => {
        if (cardIndex < currentTopic.cards.length - 1) {
          setCardIndex((prev) => prev + 1);
        } else {
          handleTopicComplete();
        }
      }, 1500);
    }
  }, [currentTopic, cardIndex, triggerHaptic]);

  const handleTopicComplete = useCallback(() => {
    triggerHaptic("heavy");
    setConfettiType("levelup");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    // Could add topic completion badge here
  }, [triggerHaptic]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!currentTopic || showTopicSelect) return;
    if (e.key === "ArrowLeft" && cardIndex > 0) {
      triggerHaptic("light");
      setCardIndex((prev) => prev - 1);
    } else if (e.key === "ArrowRight" && cardIndex < currentTopic.cards.length - 1) {
      triggerHaptic("light");
      setCardIndex((prev) => prev + 1);
    } else if (e.key === "ArrowRight" && cardIndex === currentTopic.cards.length - 1) {
      handleTopicComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTopic, cardIndex, showTopicSelect, triggerHaptic, handleTopicComplete]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Confetti pieces
  const [confettiPieces] = useState(() => {
    const colors = ["#06b6d4", "#3b82f6", "#22d3ee", "#60a5fa", "#a5f3fc", "#dbeafe", "#f0f9ff"];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 1,
      size: 6 + Math.random() * 10,
      isRound: Math.random() > 0.5,
    }));
  });

  if (showTopicSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 safe-top safe-bottom">
        <div className="container">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 md:mb-8 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 min-h-[48px]"
          >
            ← Back to Games
          </Link>

          {/* Header */}
          <header className="text-center mb-8 md:mb-12 animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-edu mb-3">
              📚 Edu Swiper
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Learn anything in bite-sized cards. Swipe, answer, level up!
            </p>
          </header>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8 animate-fade-in-up stagger-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 border-4 border-cyan-500/30 min-w-[140px] text-center">
              <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">Total XP</div>
              <div className="text-3xl md:text-4xl font-bold text-gradient-edu font-mono">{totalXP}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 border-4 border-blue-500/30 min-w-[140px] text-center">
              <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">Level</div>
              <div className="text-3xl md:text-4xl font-bold text-gradient-edu font-mono">{level}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 border-4 border-emerald-500/30 min-w-[140px] text-center">
              <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">Streak</div>
              <div className="text-3xl md:text-4xl font-bold text-gradient-edu font-mono">{streakDisplay.current}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 border-4 border-violet-500/30 min-w-[140px] text-center">
              <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">Topics</div>
              <div className="text-3xl md:text-4xl font-bold text-gradient-edu font-mono">{Object.keys(progress).length}</div>
            </div>
          </div>

          {/* Topic Grid */}
          <div className="mb-8 animate-fade-in-up stagger-2" role="region" aria-label="Learning topics">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">Choose a Topic</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {TOPICS.map((topic) => {
                const topicProgress = progress[topic.id];
                const completed = topicProgress?.completedCardIds.length || 0;
                const total = topic.cards.length;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                const topicXP = topicProgress?.xp || 0;
                const topicLevel = Math.floor(topicXP / XP_PER_LEVEL) + 1;

                return (
                  <button
                    key={topic.id}
                    onClick={() => selectTopic(topic)}
                    className="group relative overflow-hidden rounded-2xl glass-strong border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 animate-fade-in-up p-6"
                    style={{ borderLeft: `4px solid ${topic.color}` }}
                    aria-label={`Start ${topic.name} - ${completed}/${total} cards completed, Level ${topicLevel}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <span className="text-4xl animate-float" style={{ animationDelay: '0s' }}>{topic.icon}</span>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Level</div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">{topicLevel}</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{topic.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{topic.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: topic.color }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{percentage}%</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: topic.color }}>
                        {completed}/{total}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent group-hover:via-white/10 transition-opacity duration-300" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* AdSense Banner */}
          <div className="my-8 md:my-12 animate-fade-in-up" role="complementary" aria-label="Advertisement">
            <AdSenseBanner className="w-full max-w-4xl mx-auto" />
          </div>

          {/* Instructions */}
          <div className="mt-8 md:mt-12 p-6 rounded-2xl glass border border-white/20 animate-fade-in-up stagger-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span>📖</span> How to Learn
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm md:text-base grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="flex items-start gap-2">• Pick a topic you want to learn</li>
              <li className="flex items-start gap-2">• Swipe through concept cards to learn</li>
              <li className="flex items-start gap-2">• Answer questions to test your knowledge</li>
              <li className="flex items-start gap-2">• Read explanations to reinforce learning</li>
              <li className="flex items-start gap-2">• Earn XP for every correct answer</li>
              <li className="flex items-start gap-2">• Level up every 100 XP</li>
              <li className="flex items-start gap-2">• Complete 5 cards daily for bonus XP</li>
              <li className="flex items-start gap-2">• Build a learning streak!</li>
              <li className="flex items-start gap-2">• Use keyboard arrows or swipe to navigate</li>
              <li className="flex items-start gap-2">• Progress saves automatically</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Learning mode
  const card = currentTopic!.cards[cardIndex];
  const topicProgress = progress[currentTopic!.id];
  const completedCount = topicProgress?.completedCardIds.length || 0;
  const totalCards = currentTopic!.cards.length;
  const topicXP = topicProgress?.xp || 0;
  const topicLevel = Math.floor(topicXP / XP_PER_LEVEL) + 1;
  const dailyCompleted = topicProgress?.dailyCardsCompleted || 0;
  const isLastCard = cardIndex === totalCards - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 safe-top safe-bottom">
      <div className="container">
        {/* Back Button */}
        <button
          onClick={goBackToTopics}
          className="inline-flex items-center gap-2 mb-6 md:mb-8 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 min-h-[48px]"
        >
          ← Topics
        </button>

        {/* Header */}
        <header className="mb-6 md:mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentTopic!.icon}</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gradient-edu">{currentTopic!.name}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Level {topicLevel} • {topicXP} XP</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-1.5 border border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily: {dailyCompleted}/{CARDS_PER_DAILY_GOAL}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 gradient-edu"
              style={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-right">
            Card {cardIndex + 1} of {totalCards}
          </p>
        </header>

        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50" aria-label="Celebration" aria-hidden="true">
            {confettiPieces.map((piece) => (
              <div
                key={piece.id}
                className="absolute top-0 w-2 h-2 transform"
                style={{
                  left: `${piece.left}%`,
                  backgroundColor: piece.color,
                  animation: `confetti-burst ${piece.duration}s ease-out ${piece.delay}s forwards`,
                  width: `${piece.size}px`,
                  height: `${piece.size}px`,
                  borderRadius: piece.isRound ? "50%" : "0",
                }}
              />
            ))}
          </div>
        )}

        {/* Card */}
        <div
          className="mb-8 animate-fade-in-up stagger-1"
          role="region"
          aria-label={`Learning card ${cardIndex + 1} of ${totalCards}`}
          aria-live="polite"
        >
          <div
            ref={cardRef}
            className="relative max-w-2xl mx-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEndSwipe}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpSwipe}
            onMouseLeave={handleMouseUpSwipe}
            style={{
              touchAction: "pan-y",
              userSelect: "none"
            }}
          >
            <div className="glass-strong border border-white/20 rounded-2xl shadow-2xl p-8 md:p-10 overflow-hidden">
              {/* Card Type Indicator */}
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: card.type === "concept" ? "rgba(6, 182, 212, 0.15)" :
                                   card.type === "question" ? "rgba(59, 130, 246, 0.15)" :
                                   "rgba(34, 197, 94, 0.15)",
                    color: card.type === "concept" ? "#0891b2" :
                           card.type === "question" ? "#2563eb" : "#16a34a"
                  }}
                >
                  {card.type === "concept" && "💡 Learn"}
                  {card.type === "question" && "❓ Quiz"}
                  {card.type === "explanation" && "✨ Recap"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">XP: +{card.type === "question" ? XP_PER_CORRECT : 0}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="text-center">
                <div className="text-lg md:text-xl lg:text-2xl text-gray-900 dark:text-gray-100 leading-relaxed mb-6 whitespace-pre-wrap">
                  {card.content}
                </div>

                {/* Question Options */}
                {card.type === "question" && card.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Answer options">
                    {card.options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => answerQuestion(i)}
                        className="px-4 py-4 text-left bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-cyan-400 dark:hover:border-cyan-600 transition-all text-gray-900 dark:text-gray-100 min-h-[48px] shadow-sm hover:shadow-md"
                        style={{
                          textAlign: "left"
                        }}
                      >
                        <span className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-medium text-gray-500 dark:text-gray-400">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span>{option}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Explanation */}
                {card.explanation && card.type !== "concept" && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800 animate-fade-in-up">
                    <p className="text-sm text-cyan-800 dark:text-cyan-200 font-medium">💡 {card.explanation}</p>
                  </div>
                )}

                {/* Swipe Hint */}
                {!isMobile && !isLastCard && (
                  <p className="mt-6 text-xs text-gray-400 dark:text-gray-500 animate-pulse-soft">
                    ← Swipe or arrow keys →
                  </p>
                )}
              </div>
            </div>

            {/* Swipe Indicators */}
            <div className="flex justify-center gap-2 mt-4" role="presentation" aria-hidden="true">
              {Array.from({ length: Math.min(totalCards, 10) }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i === cardIndex ? "var(--edu-primary)" : "rgba(6, 182, 212, 0.2)",
                    transform: i === cardIndex ? "scale(1.5)" : "scale(1)",
                  }}
                />
              ))}
              {totalCards > 10 && (
                <span className="text-xs text-gray-400 dark:text-gray-500 self-center px-2">+{totalCards - 10}</span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons (Mobile fallback) */}
        {isMobile && (
          <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in-up stagger-2">
            <button
              onClick={() => cardIndex > 0 && setCardIndex((prev) => prev - 1)}
              disabled={cardIndex === 0}
              className="btn-secondary px-6 py-3 min-h-[48px] min-w-[48px] disabled:opacity-50"
              aria-label="Previous card"
            >
              ←
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px] text-center">
              {cardIndex + 1} / {totalCards}
            </span>
            <button
              onClick={() => {
                if (cardIndex < totalCards - 1) {
                  setCardIndex((prev) => prev + 1);
                } else {
                  handleTopicComplete();
                }
              }}
              className="btn-primary px-6 py-3 min-h-[48px] min-w-[48px]"
              aria-label={isLastCard ? "Complete topic" : "Next card"}
            >
              {isLastCard ? "✨" : "→"}
            </button>
          </div>
        )}

        {/* Topic Complete */}
        {isLastCard && card.type === "explanation" && (
          <div className="mb-8 animate-bounce-in stagger-3 text-center" role="status" aria-live="polite">
            <div className="inline-flex flex-col items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border-4 border-emerald-500/30">
              <div className="text-5xl animate-bounce">🎓</div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Topic Complete!
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                You finished {currentTopic!.name}!
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
                  +{topicXP} XP earned
                </span>
                <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full font-medium">
                  Level {topicLevel}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 md:gap-6 animate-fade-in-up stagger-2">
          <button
            onClick={goBackToTopics}
            className="btn-secondary px-8 py-3 text-lg min-w-[200px] min-h-[48px]"
          >
            📚 Choose Another Topic
          </button>

          <button
            onClick={() => {
              if (cardIndex < totalCards - 1) {
                setCardIndex((prev) => prev + 1);
              } else {
                goBackToTopics();
              }
            }}
            className="btn-primary px-8 py-3 text-lg min-w-[200px] min-h-[48px] shadow-xl"
            style={{ boxShadow: "0 10px 30px -10px var(--edu-glow)" }}
          >
            {isLastCard ? "🏠 Back to Topics" : "Continue Learning →"}
          </button>
        </div>

        {/* AdSense Banner */}
        <div className="my-8 md:my-12 animate-fade-in-up" role="complementary" aria-label="Advertisement">
          <AdSenseBanner className="w-full max-w-4xl mx-auto" />
        </div>

        {/* Instructions */}
        <div className="mt-8 md:mt-12 p-6 rounded-2xl glass border border-white/20 animate-fade-in-up stagger-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span>📖</span> Learning Tips
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm md:text-base grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="flex items-start gap-2">• Swipe left/right or use arrow keys to navigate</li>
            <li className="flex items-start gap-2">• Read concept cards carefully before questions</li>
            <li className="flex items-start gap-2">• Explanations reinforce why answers are correct</li>
            <li className="flex items-start gap-2">• Earn 10 XP per correct answer</li>
            <li className="flex items-start gap-2">• Level up every 100 XP</li>
            <li className="flex items-start gap-2">• Complete 5 cards daily for 50 bonus XP</li>
            <li className="flex items-start gap-2">• Build a daily streak for bonuses</li>
            <li className="flex items-start gap-2">• Progress saves automatically in browser</li>
          </ul>
        </div>
      </div>

      <style jsx global>{`
        @keyframes confetti-burst {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) scale(0) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}