/* Level-aware speaking content — pure data + helpers. Read Aloud reuses the existing reading passages. */

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const levelOf = (l) => (LEVELS.includes(l) ? l : "A1");

/* ── Repeat: one sentence at a time ── */
export const REPEAT = {
  A1: ["My name is Rahim.", "I like tea.", "She is my sister.", "I have two books.", "We live in Dhaka.", "The sun is hot.", "I eat rice every day.", "Open the door, please."],
  A2: ["I usually wake up at seven.", "She goes to school by bus.", "Can you help me, please?", "We had dinner at a small restaurant.", "My brother is taller than me.", "It was raining when I left home.", "I am going to visit my aunt tomorrow.", "Do you want to drink some water?"],
  B1: ["I have been learning English for two years.", "If it rains tomorrow, we will stay at home.", "She suggested going to the market together.", "I would like to book a table for four people.", "The meeting has been moved to Thursday afternoon.", "He told me that he was looking for a new job.", "I am not sure, but I think it is a good idea.", "Could you tell me how to get to the station?"],
  B2: ["Despite the heavy traffic, we arrived on time.", "I wish I had spent more time preparing for the interview.", "The report should have been submitted by Friday.", "Not only is it cheaper, but it is also more reliable.", "She is said to be one of the best teachers in the city.", "We need to find a solution before the situation gets worse.", "He asked whether I had ever worked abroad.", "The more you practise, the more confident you become."],
  C1: ["Had I known about the delay, I would have taken a different route.", "The proposal raises several concerns that deserve careful consideration.", "Rarely have I encountered such a persuasive argument.", "It is essential that every student submit the form on time.", "Although the results were promising, further research is needed.", "She managed to negotiate a deal that satisfied both parties.", "The company is committed to reducing its environmental footprint.", "I would appreciate it if you could clarify your position."],
  C2: ["The consequences of the policy were far more nuanced than its critics had anticipated.", "Notwithstanding their differences, the two leaders reached a compromise.", "What distinguishes her work is an uncompromising attention to detail.", "Few would dispute that education is the cornerstone of a fair society.", "He spoke with a candour that was as refreshing as it was unexpected.", "The novel is a meditation on memory, loss and the passage of time.", "Scarcely had the announcement been made when protests began.", "Such arguments, however persuasive, rest on questionable assumptions."],
};

/* ── Shadowing: short, natural, connected speech ── */
export const SHADOW = {
  A1: ["Hello! How are you today?", "I am fine, thank you.", "Nice to meet you.", "What is your name?", "Where are you from?", "See you tomorrow!"],
  A2: ["Excuse me, where is the nearest bank?", "I would like a cup of coffee, please.", "What time does the train leave?", "Could you speak a little more slowly?", "I am looking for a gift for my mother.", "Thanks for waiting, I am sorry I am late."],
  B1: ["I am thinking of changing my job next year.", "Do you mind if I open the window?", "It depends on what you mean by that.", "I will call you as soon as I get home.", "Let me think about it and get back to you.", "That sounds like a great plan to me."],
  B2: ["I could not agree more with what you just said.", "Let us go over the main points one more time.", "It is not as simple as it might seem at first.", "I would rather work from home than commute every day.", "As far as I am concerned, the deadline is realistic.", "We should have done this a long time ago."],
  C1: ["To be perfectly honest, I had my doubts at the beginning.", "That is precisely the point I was trying to make.", "It remains to be seen whether the plan will work.", "I take your point, but I see it rather differently.", "Let me put it another way so that it is clearer.", "There is a fine line between confidence and arrogance."],
  C2: ["One could argue that the opposite is equally true.", "It strikes me as an oversimplification of a complex issue.", "The irony of the situation was not lost on anyone.", "That is easier said than done, as I am sure you will appreciate.", "In hindsight, the warning signs were there all along.", "It would be remiss of us not to consider the alternatives."],
};

/* ── Free speaking: topics with optional prompts and a recommended time (seconds) ── */
export const FREE = {
  A1: [
    { id: "a1-family", title: "My Family", sec: 30, prompts: ["Who is in your family?", "What do they do?", "What do you like to do together?"] },
    { id: "a1-routine", title: "My Daily Routine", sec: 30, prompts: ["What time do you wake up?", "What do you eat in the morning?", "What do you do in the evening?"] },
    { id: "a1-food", title: "My Favorite Food", sec: 30, prompts: ["What food do you like?", "Who cooks it?", "When do you eat it?"] },
    { id: "a1-home", title: "My Home", sec: 30, prompts: ["Where do you live?", "How many rooms are there?", "What is your favorite room?"] },
    { id: "a1-friend", title: "My Best Friend", sec: 30, prompts: ["What is his or her name?", "What does your friend look like?", "What do you do together?"] },
  ],
  A2: [
    { id: "a2-weekend", title: "My Last Weekend", sec: 45, prompts: ["Where did you go?", "Who were you with?", "What was the best part?"] },
    { id: "a2-town", title: "My Hometown", sec: 45, prompts: ["Where is it?", "What can people do there?", "Would you like to live there in the future?"] },
    { id: "a2-hobby", title: "My Favorite Hobby", sec: 45, prompts: ["What is your hobby?", "How did you start?", "How often do you do it?"] },
    { id: "a2-holiday", title: "A Holiday I Remember", sec: 45, prompts: ["Where did you go?", "What did you see?", "Why do you remember it?"] },
    { id: "a2-shopping", title: "Shopping", sec: 45, prompts: ["Where do you usually shop?", "What did you buy last?", "Do you prefer shops or online shopping?"] },
  ],
  B1: [
    { id: "b1-decision", title: "A Difficult Decision", sec: 60, prompts: ["What was the decision?", "What options did you have?", "What did you learn?"] },
    { id: "b1-career", title: "My Future Career", sec: 60, prompts: ["What job would you like?", "Why does it interest you?", "What do you need to do to get there?"] },
    { id: "b1-failure", title: "Learning from Failure", sec: 60, prompts: ["Tell about a time you failed.", "How did you feel?", "What changed afterwards?"] },
    { id: "b1-tech", title: "How I Use My Phone", sec: 60, prompts: ["What do you use it for?", "What are the good and bad sides?", "Could you live without it for a week?"] },
    { id: "b1-advice", title: "Advice for a Language Learner", sec: 60, prompts: ["What worked for you?", "What mistakes should people avoid?", "How much should they practise?"] },
  ],
  B2: [
    { id: "b2-tech", title: "Technology and Society", sec: 75, prompts: ["How has technology changed daily life?", "What are the risks?", "Where will it be in ten years?"] },
    { id: "b2-remote", title: "Remote Work", sec: 75, prompts: ["What are the advantages?", "What problems can it cause?", "Would you choose it? Why?"] },
    { id: "b2-education", title: "Education", sec: 75, prompts: ["What is wrong with the current system?", "What would you change?", "Is a degree still necessary?"] },
    { id: "b2-media", title: "Social Media and Young People", sec: 75, prompts: ["What are the benefits?", "What are the dangers?", "Should there be age limits?"] },
    { id: "b2-env", title: "Protecting the Environment", sec: 75, prompts: ["Who is responsible: governments or individuals?", "What can ordinary people do?", "Are you optimistic?"] },
  ],
  C1: [
    { id: "c1-ai", title: "Should Artificial Intelligence Be Regulated?", sec: 90, prompts: ["State your position clearly.", "Give two arguments and one counter-argument.", "Conclude with a recommendation."] },
    { id: "c1-inequality", title: "Economic Inequality", sec: 90, prompts: ["What are the main causes?", "Is it inevitable?", "Which solutions are realistic?"] },
    { id: "c1-work", title: "The Changing Nature of Work", sec: 90, prompts: ["Which jobs are most at risk?", "What skills will matter?", "How should societies adapt?"] },
    { id: "c1-culture", title: "Globalisation and Local Culture", sec: 90, prompts: ["What is gained?", "What is lost?", "Can both coexist?"] },
    { id: "c1-leader", title: "What Makes a Good Leader?", sec: 90, prompts: ["Define leadership in your own words.", "Give a real example.", "Is leadership learned or innate?"] },
  ],
  C2: [
    { id: "c2-truth", title: "Truth in the Age of Misinformation", sec: 120, prompts: ["Why does misinformation spread so easily?", "Whose responsibility is it to counter it?", "What are the risks of censorship?"] },
    { id: "c2-progress", title: "Is Progress Always Desirable?", sec: 120, prompts: ["Define progress.", "Offer a case where it came at a cost.", "Reach a nuanced conclusion."] },
    { id: "c2-freedom", title: "Individual Freedom versus Collective Good", sec: 120, prompts: ["Where should the line be drawn?", "Use a concrete example.", "Anticipate an objection and respond."] },
    { id: "c2-art", title: "The Role of Art in Society", sec: 120, prompts: ["Should art be useful?", "Can art change minds?", "Who decides what is valuable?"] },
    { id: "c2-ethics", title: "Ethics of Scientific Research", sec: 120, prompts: ["Should any research be off-limits?", "Who should decide?", "How do we balance risk and benefit?"] },
  ],
};

export const repeatSet = (level) => REPEAT[levelOf(level)];
export const shadowSet = (level) => SHADOW[levelOf(level)];
export const freeTopics = (level) => FREE[levelOf(level)];

/** Deterministic "today's pick" so a refresh keeps the same item, while days vary. */
export function pick(items, seedStr) {
  let h = 2166136261; for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  return items[(h >>> 0) % items.length];
}

/**
 * Split a reading passage (array of paragraphs) into short segments for Read Aloud.
 * A segment is 1–3 sentences, at most `maxWords` words (a very long sentence is split at commas).
 */
export function segmentPassage(paragraphs, maxWords = 30) {
  const sentences = [];
  for (const para of [].concat(paragraphs || [])) {
    const parts = String(para).replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]*/g) || [];
    for (const p of parts) { const t = p.trim(); if (t) sentences.push(t); }
  }
  const count = (s) => s.split(/\s+/).filter(Boolean).length;
  const pieces = [];
  for (const s of sentences) {
    if (count(s) <= maxWords + 10) { pieces.push(s); continue; }
    let cur = "";
    for (const chunk of s.split(/(?<=,)\s+/)) {
      if (cur && count(cur + " " + chunk) > maxWords) { pieces.push(cur); cur = chunk; } else cur = cur ? cur + " " + chunk : chunk;
    }
    if (cur) pieces.push(cur);
  }
  const segs = []; let cur = "";
  for (const s of pieces) {
    if (cur && count(cur + " " + s) > maxWords) { segs.push(cur); cur = s; } else cur = cur ? cur + " " + s : s;
  }
  if (cur) segs.push(cur);
  return segs.map((text, i) => ({ id: i, text, words: count(text) }));
}
