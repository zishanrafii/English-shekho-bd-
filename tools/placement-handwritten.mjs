/* Hand-written placement questions (grammar/usage for A1–C2, vocabulary for C1–C2).
   Format: [stem, correct, wrong1, wrong2, wrong3]  (options are shuffled at run time) */
export const GRAMMAR = {
  A1: [
    ["She ___ a student.", "is", "am", "are", "be"],
    ["I ___ breakfast every morning.", "eat", "eats", "eating", "am eat"],
    ["___ is your name?", "What", "Who", "Where", "When"],
    ["There ___ two books on the table.", "are", "is", "am", "be"],
    ["This is ___ apple.", "an", "a", "the", "some"],
    ["They ___ from Bangladesh.", "are", "is", "am", "be"],
    ["My brother ___ football on Fridays.", "plays", "play", "playing", "to play"],
    ["I have ___ sister.", "a", "an", "two", "many"],
  ],
  A2: [
    ["I ___ to the market yesterday.", "went", "go", "gone", "going"],
    ["She is ___ than her brother.", "taller", "tall", "tallest", "more tall"],
    ["We ___ watching TV when the power went out.", "were", "are", "was", "be"],
    ["I'm going to visit my grandparents ___ Sunday.", "on", "in", "at", "by"],
    ["There isn't ___ milk in the fridge.", "any", "some", "a", "many"],
    ["You ___ smoke here. It is not allowed.", "mustn't", "must", "should", "can"],
    ["How ___ water do you drink every day?", "much", "many", "lot", "few"],
    ["I have lived here ___ 2019.", "since", "for", "from", "during"],
  ],
  B1: [
    ["If it rains tomorrow, we ___ at home.", "will stay", "stay", "stayed", "would stay"],
    ["The book ___ by millions of people.", "is read", "read", "reads", "has reading"],
    ["I used to ___ football when I was a child.", "play", "playing", "played", "plays"],
    ["She suggested ___ to the cinema.", "going", "go", "to go", "went"],
    ["This is the man ___ lives next door.", "who", "whom", "whose", "which"],
    ["I wish I ___ more free time.", "had", "have", "would have", "having"],
    ["He has been working here ___ five years.", "for", "since", "from", "during"],
    ["You ___ wear a seatbelt. It's the law.", "have to", "must to", "can to", "should to"],
  ],
  B2: [
    ["By the time we arrived, the film ___.", "had already started", "already started", "has already started", "was already starting"],
    ["If I had known about the traffic, I ___ earlier.", "would have left", "would leave", "will leave", "had left"],
    ["She denied ___ the money.", "taking", "to take", "take", "to taking"],
    ["Not only ___ late, but he also forgot the documents.", "did he arrive", "he arrived", "he did arrive", "arrived he"],
    ["The report, ___ was published last week, has caused controversy.", "which", "that", "what", "who"],
    ["I'd rather you ___ smoke in here.", "didn't", "don't", "won't", "wouldn't"],
    ["He is said ___ the company fifty years ago.", "to have founded", "to found", "founding", "to be founded"],
    ["Hardly ___ the room when the phone rang.", "had he entered", "he had entered", "he entered", "did he enter"],
  ],
  C1: [
    ["Had it not been for your help, we ___ the deadline.", "would have missed", "will miss", "had missed", "are missing"],
    ["The committee insisted that he ___ the proposal.", "withdraw", "withdraws", "withdrew", "would withdraw"],
    ["Little ___ he know that the project would fail.", "did", "does", "had", "was"],
    ["Seldom ___ such a remarkable performance.", "have I seen", "I have seen", "I saw", "did saw"],
    ["No sooner had she sat down ___ the phone rang.", "than", "when", "then", "that"],
    ["The project, ___ completion was delayed, has finally been approved.", "whose", "which", "of which", "that"],
    ["I'd sooner die than ___ him the truth.", "tell", "telling", "to tell", "told"],
    ["The more he practised, ___ he became.", "the more confident", "more confident the", "the most confident", "most confidently"],
  ],
  C2: [
    ["The minister's remarks were seen as an attempt to ___ the crisis.", "defuse", "diffuse", "dispel", "deflate"],
    ["Her argument is ___: it assumes what it sets out to prove.", "circular", "cyclical", "rounded", "spherical"],
    ["The two proposals are not mutually ___; we can adopt both.", "exclusive", "exclusionary", "excluding", "excluded"],
    ["The treaty was signed ___ considerable opposition.", "notwithstanding", "despite of", "in spite", "although"],
    ["The findings ___ the hypothesis that sleep aids memory.", "corroborate", "collaborate", "corrugate", "corrode"],
    ["Politicians often ___ when asked direct questions.", "prevaricate", "procrastinate", "predicate", "prevail"],
    ["The novel is a ___ of styles, borrowing from many traditions.", "pastiche", "pasture", "pastime", "pastry"],
    ["His ___ remarks offended no one, yet committed him to nothing.", "anodyne", "anomalous", "anonymous", "anecdotal"],
  ],
};

/* Vocabulary (English word → Bengali meaning), hand-calibrated to CEFR levels.
   NOTE: the project's own vocab datasets were NOT used here because their level labels are unreliable
   (e.g. "Protein", "Balcony", "Marathon" sit in B2; "Routine" and "Launch" appear in two levels).
   [word, correct Bengali meaning] — distractors are the other meanings of the same level. */
export const VOCAB = {
  A1: [["breakfast", "সকালের নাস্তা"], ["window", "জানালা"], ["teacher", "শিক্ষক"], ["cheap", "সস্তা"],
       ["sleep", "ঘুমানো"], ["early", "তাড়াতাড়ি"], ["hungry", "ক্ষুধার্ত"], ["river", "নদী"]],
  A2: [["borrow", "ধার নেওয়া"], ["unusual", "অস্বাভাবিক"], ["crowded", "ভিড়পূর্ণ"], ["delay", "বিলম্ব"],
       ["recipe", "রান্নার প্রণালী"], ["neighbour", "প্রতিবেশী"], ["refund", "টাকা ফেরত"], ["luggage", "মালপত্র"]],
  B1: [["reliable", "নির্ভরযোগ্য"], ["achieve", "অর্জন করা"], ["damage", "ক্ষতি"], ["benefit", "সুবিধা"],
       ["embarrassed", "বিব্রত"], ["request", "অনুরোধ"], ["rumour", "গুজব"], ["attitude", "মনোভাব"]],
  B2: [["reluctant", "অনিচ্ছুক"], ["inevitable", "অনিবার্য"], ["controversial", "বিতর্কিত"], ["deteriorate", "অবনতি হওয়া"],
       ["substantial", "উল্লেখযোগ্য"], ["reinforce", "শক্তিশালী করা"], ["overwhelming", "অপ্রতিরোধ্য"], ["compensate", "ক্ষতিপূরণ দেওয়া"]],
  C1: [["ubiquitous", "সর্বব্যাপী"], ["ephemeral", "ক্ষণস্থায়ী"], ["meticulous", "অতি খুঁটিনাটি-সচেতন"], ["pragmatic", "বাস্তববাদী"],
       ["scrutinize", "খুঁটিয়ে পরীক্ষা করা"], ["mitigate", "প্রশমিত করা"], ["exacerbate", "আরও খারাপ করা"], ["tenacious", "দৃঢ়প্রতিজ্ঞ"]],
  C2: [["perfunctory", "দায়সারা"], ["obfuscate", "ঘোলাটে করা"], ["sycophant", "চাটুকার"], ["ostensibly", "বাহ্যত"],
       ["capricious", "খামখেয়ালি"], ["recalcitrant", "একগুঁয়ে অবাধ্য"], ["equivocal", "দ্ব্যর্থক"], ["magnanimous", "উদারমনা"]],
};
