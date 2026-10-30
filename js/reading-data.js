/* =====================================================
   ENGLISH SHEKHO — READING CENTER DATA
   Passages + Vocabulary-in-Context + Comprehension Quiz
   ===================================================== */

/* ──────────────────────────────────────
   Each passage:
   id, title, category, level, readMinutes, xp,
   icon, color, border,
   text:   array of paragraph strings (English only)
   vocab:  { word: { meaning_bn, pos } }  ← words to highlight inside `text`
   quiz:   [{ q, opts, ans, exp }]
────────────────────────────────────── */

export const PASSAGES = [

  /* ════════════════════════════════
     STORY — 6 passages
  ════════════════════════════════ */

  { id:"r1", title:"A Rainy Morning", category:"Story", level:"A1", readMinutes:2, xp:40,
    icon:"🌧️", color:"rgba(45,212,191,.12)", border:"rgba(45,212,191,.25)",
    text:[
      "It was a rainy morning in Dhaka. Rina woke up and looked out of the window. The sky was grey and the rain was falling softly on the street.",
      "She put on her raincoat and picked up her umbrella. Her school bag was heavy, but she was happy because today was her favourite subject — Art class.",
      "On the way to school, she saw a little cat hiding under a car. The cat looked cold and hungry. Rina stopped and gave the cat a small piece of bread from her bag.",
      "The cat ate the bread quickly and looked up at her with bright eyes. Rina smiled and continued walking to school, feeling warm inside despite the cold rain."
    ],
    vocab:{
      "raincoat":{meaning_bn:"বৃষ্টি থেকে রক্ষা করার কোট", pos:"noun"},
      "umbrella":{meaning_bn:"ছাতা", pos:"noun"},
      "hiding":{meaning_bn:"লুকিয়ে থাকা", pos:"verb"},
      "despite":{meaning_bn:"সত্ত্বেও", pos:"preposition"}
    },
    quiz:[
      {q:"What was the weather like in the morning?", opts:["Sunny","Rainy","Snowy","Windy"], ans:1, exp:"প্যাসেজে বলা হয়েছে 'It was a rainy morning'।"},
      {q:"Why was Rina happy?", opts:["She had no homework","Today was Art class","She got a gift","School was closed"], ans:1, exp:"'Today was her favourite subject — Art class'।"},
      {q:"What did Rina give the cat?", opts:["Milk","Water","A piece of bread","Rice"], ans:2, exp:"'Rina gave the cat a small piece of bread'।"}
    ]
  },

  { id:"r2", title:"The Lost Wallet", category:"Story", level:"A1", readMinutes:2, xp:40,
    icon:"👛", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    text:[
      "Karim was walking home from the market when he saw a brown wallet on the ground. He picked it up and opened it carefully.",
      "Inside, there was some money and an identity card with a photo and an address. Karim thought about keeping the money, but he knew that would be wrong.",
      "He decided to find the owner. He walked to the address on the card. An old man opened the door and looked very worried.",
      "\"Are you looking for this?\" Karim asked, showing the wallet. The old man's face lit up with joy. \"Thank you so much, young man! You have saved my day,\" he said, and offered Karim a reward, but Karim politely refused."
    ],
    vocab:{
      "wallet":{meaning_bn:"মানিব্যাগ", pos:"noun"},
      "identity card":{meaning_bn:"পরিচয়পত্র", pos:"noun"},
      "worried":{meaning_bn:"চিন্তিত", pos:"adjective"},
      "refused":{meaning_bn:"প্রত্যাখ্যান করা", pos:"verb"}
    },
    quiz:[
      {q:"What did Karim find on the ground?", opts:["A phone","A wallet","A book","A key"], ans:1, exp:"'He saw a brown wallet on the ground'।"},
      {q:"How did Karim find the owner's address?", opts:["From a letter","From the identity card","From a neighbour","From the police"], ans:1, exp:"Identity card-এ address ছিল।"},
      {q:"Did Karim accept the reward?", opts:["Yes","No","He asked for money instead","Not mentioned"], ans:1, exp:"'Karim politely refused'।"}
    ]
  },

  { id:"r3", title:"My First Day at School", category:"Story", level:"A1", readMinutes:2, xp:40,
    icon:"🎒", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    text:[
      "I still remember my first day at school. I was only five years old and very nervous. My mother held my hand tightly as we walked through the big gate.",
      "Everything looked strange — the tall building, the noisy children, and the loud bell. I wanted to cry, but I tried to be brave.",
      "My teacher smiled at me and said, \"Don't worry, everyone feels nervous on their first day.\" She gave me a colourful pencil and a small notebook.",
      "By the end of the day, I had made two new friends and learned how to write my own name. I went home feeling proud and excited for the next day."
    ],
    vocab:{
      "nervous":{meaning_bn:"নার্ভাস, চিন্তিত", pos:"adjective"},
      "tightly":{meaning_bn:"দৃঢ়ভাবে", pos:"adverb"},
      "brave":{meaning_bn:"সাহসী", pos:"adjective"},
      "proud":{meaning_bn:"গর্বিত", pos:"adjective"}
    },
    quiz:[
      {q:"How old was the writer on the first day?", opts:["Four","Five","Six","Seven"], ans:1, exp:"'I was only five years old'।"},
      {q:"What did the teacher give the writer?", opts:["A book and a bag","A pencil and a notebook","A toy","Nothing"], ans:1, exp:"'She gave me a colourful pencil and a small notebook'।"},
      {q:"How did the writer feel at the end of the day?", opts:["Sad","Angry","Proud and excited","Tired"], ans:2, exp:"'I went home feeling proud and excited'।"}
    ]
  },

  { id:"r4", title:"The Clever Crow", category:"Story", level:"A2", readMinutes:3, xp:60,
    icon:"🐦", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    text:[
      "On a hot summer day, a thirsty crow flew around looking for water. After a long search, she found a clay pot with a little water at the bottom.",
      "She tried to put her beak inside, but the water level was too low to reach. The pot was too narrow for her to push her head deeper, and she could not knock it over because it was too heavy.",
      "The crow thought carefully for a moment. Then she had a brilliant idea. She noticed some small pebbles lying near the pot.",
      "One by one, she picked up the pebbles with her beak and dropped them into the pot. Gradually, the water rose higher and higher until it finally reached the top.",
      "The clever crow drank the water happily and flew away, proving that intelligence can solve problems that strength cannot."
    ],
    vocab:{
      "thirsty":{meaning_bn:"তৃষ্ণার্ত", pos:"adjective"},
      "beak":{meaning_bn:"পাখির ঠোঁট", pos:"noun"},
      "narrow":{meaning_bn:"সরু", pos:"adjective"},
      "pebbles":{meaning_bn:"নুড়ি পাথর", pos:"noun"},
      "gradually":{meaning_bn:"ধীরে ধীরে", pos:"adverb"}
    },
    quiz:[
      {q:"What problem did the crow have?", opts:["No food","Water was too deep in the pot","Water level was too low to reach","The pot was broken"], ans:2, exp:"'The water level was too low to reach'।"},
      {q:"How did the crow solve the problem?", opts:["She broke the pot","She tilted the pot","She dropped pebbles into the pot","She asked another bird for help"], ans:2, exp:"'She picked up the pebbles... and dropped them into the pot'।"},
      {q:"What is the lesson of this story?", opts:["Strength is everything","Intelligence can solve problems strength cannot","Never trust a pot","Crows cannot fly"], ans:1, exp:"'Intelligence can solve problems that strength cannot'।"}
    ]
  },

  { id:"r5", title:"A Letter to a Friend", category:"Story", level:"A2", readMinutes:3, xp:60,
    icon:"✉️", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    text:[
      "Dear Tanvir, I hope this letter finds you in good health. I am writing to tell you about my recent trip to Cox's Bazar with my family.",
      "We arrived on a Friday afternoon and stayed at a small hotel near the beach. The sea was incredibly beautiful, with waves crashing gently onto the golden sand.",
      "Every morning, we woke up early to watch the sunrise. My younger sister collected seashells while my father took countless photographs of the view.",
      "On the last day, we visited a local market and bought some dried fish as souvenirs for our relatives. The whole trip was unforgettable, and I wish you could have joined us.",
      "I hope we can plan a trip together next time. Please write back soon and tell me about your holidays too. Your friend, Rafsan."
    ],
    vocab:{
      "incredibly":{meaning_bn:"অবিশ্বাস্যভাবে", pos:"adverb"},
      "gently":{meaning_bn:"নরমভাবে", pos:"adverb"},
      "countless":{meaning_bn:"অসংখ্য", pos:"adjective"},
      "souvenirs":{meaning_bn:"স্মারক উপহার", pos:"noun"},
      "unforgettable":{meaning_bn:"অবিস্মরণীয়", pos:"adjective"}
    },
    quiz:[
      {q:"Where did Rafsan travel to?", opts:["Sylhet","Cox's Bazar","Sundarbans","Rangamati"], ans:1, exp:"'My recent trip to Cox's Bazar'।"},
      {q:"What did the sister do at the beach?", opts:["Took photos","Collected seashells","Went swimming","Bought souvenirs"], ans:1, exp:"'My younger sister collected seashells'।"},
      {q:"What did they buy as souvenirs?", opts:["Shells","Dried fish","Clothes","Toys"], ans:1, exp:"'We... bought some dried fish as souvenirs'।"}
    ]
  },

  { id:"r6", title:"The Old Banyan Tree", category:"Story", level:"B1", readMinutes:4, xp:80,
    icon:"🌳", color:"rgba(251,146,60,.12)", border:"rgba(251,146,60,.25)",
    text:[
      "In the centre of our village stood an enormous banyan tree, believed to be over two hundred years old. Its thick branches spread out in every direction, providing shade for the entire village square.",
      "Generations of villagers had gathered beneath its canopy to discuss important matters, celebrate festivals, and simply rest during the scorching afternoons of summer.",
      "My grandfather often told me stories about the tree, claiming that it had witnessed the birth, marriage, and death of almost everyone in the village. To him, the tree was not merely a plant but a silent guardian of our history.",
      "Unfortunately, a severe storm last year damaged several of its largest branches, and many feared the ancient tree would not survive. However, with careful attention from the villagers, the banyan tree slowly began to recover.",
      "Today, fresh green leaves have started sprouting from its battered trunk, symbolising resilience and the enduring bond between nature and the community that has cared for it for so long."
    ],
    vocab:{
      "enormous":{meaning_bn:"বিশাল", pos:"adjective"},
      "canopy":{meaning_bn:"গাছের পাতার ছাউনি", pos:"noun"},
      "scorching":{meaning_bn:"প্রচণ্ড গরম", pos:"adjective"},
      "guardian":{meaning_bn:"রক্ষক", pos:"noun"},
      "resilience":{meaning_bn:"সহনশীলতা, দৃঢ়তা", pos:"noun"}
    },
    quiz:[
      {q:"How old was the banyan tree believed to be?", opts:["100 years","150 years","Over 200 years","50 years"], ans:2, exp:"'Believed to be over two hundred years old'।"},
      {q:"What did the grandfather believe about the tree?", opts:["It was dangerous","It was just a plant","It was a silent guardian of history","It needed to be cut down"], ans:2, exp:"'The tree was not merely a plant but a silent guardian of our history'।"},
      {q:"What happened to the tree last year?", opts:["It was cut down","A storm damaged its branches","It was sold","It died completely"], ans:1, exp:"'A severe storm last year damaged several of its largest branches'।"},
      {q:"What does the recovery of the tree symbolise?", opts:["Weakness","Resilience and community bond","Danger","Nothing important"], ans:1, exp:"'Symbolising resilience and the enduring bond between nature and the community'।"}
    ]
  },

  /* ════════════════════════════════
     ARTICLE / NON-FICTION — 6 passages
  ════════════════════════════════ */

  { id:"r7", title:"Benefits of Drinking Water", category:"Article", level:"A1", readMinutes:2, xp:40,
    icon:"💧", color:"rgba(45,212,191,.12)", border:"rgba(45,212,191,.25)",
    text:[
      "Water is one of the most important things our body needs every day. Doctors say that an adult should drink at least eight glasses of water daily.",
      "Drinking enough water helps keep our skin healthy and glowing. It also helps the body remove waste and toxins through urine and sweat.",
      "Water gives us energy and helps us concentrate better at school or work. Without enough water, we can feel tired, get headaches, and find it hard to focus.",
      "So remember to carry a water bottle with you and drink water regularly throughout the day, even if you don't feel very thirsty."
    ],
    vocab:{
      "toxins":{meaning_bn:"বিষাক্ত পদার্থ", pos:"noun"},
      "concentrate":{meaning_bn:"মনোযোগ দেওয়া", pos:"verb"},
      "regularly":{meaning_bn:"নিয়মিতভাবে", pos:"adverb"}
    },
    quiz:[
      {q:"How many glasses of water should an adult drink daily?", opts:["Four","Six","Eight","Ten"], ans:2, exp:"'At least eight glasses of water daily'।"},
      {q:"What can happen without enough water?", opts:["Better focus","Headaches and tiredness","More energy","Nothing"], ans:1, exp:"'We can feel tired, get headaches'।"}
    ]
  },

  { id:"r8", title:"How Bees Help the Environment", category:"Article", level:"A2", readMinutes:3, xp:60,
    icon:"🐝", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    text:[
      "Bees play an extremely important role in nature. As they fly from flower to flower collecting nectar, they also transfer pollen, which helps plants reproduce.",
      "This process, called pollination, is essential for the growth of fruits, vegetables, and many other crops that humans depend on for food.",
      "Scientists estimate that nearly one-third of the food we eat exists because of pollinators like bees. Without them, many plants would simply disappear.",
      "Unfortunately, bee populations around the world are declining due to pesticides, pollution, and the loss of natural habitats. Many environmentalists are now working hard to protect bees and raise awareness about their importance."
    ],
    vocab:{
      "nectar":{meaning_bn:"মধু, ফুলের রস", pos:"noun"},
      "pollination":{meaning_bn:"পরাগসংযোগ", pos:"noun"},
      "estimate":{meaning_bn:"আনুমানিক হিসাব করা", pos:"verb"},
      "habitats":{meaning_bn:"বসবাসস্থল", pos:"noun"}
    },
    quiz:[
      {q:"What do bees transfer between flowers?", opts:["Water","Pollen","Seeds","Leaves"], ans:1, exp:"'They also transfer pollen'।"},
      {q:"What fraction of our food depends on pollinators?", opts:["One-tenth","One-fifth","One-third","Half"], ans:2, exp:"'Nearly one-third of the food we eat'।"},
      {q:"Why are bee populations declining?", opts:["Too much rain","Pesticides, pollution, habitat loss","Too many flowers","Cold weather"], ans:1, exp:"'Due to pesticides, pollution, and the loss of natural habitats'।"}
    ]
  },

  { id:"r9", title:"The Rise of Online Learning", category:"Article", level:"B1", readMinutes:4, xp:80,
    icon:"💻", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    text:[
      "Over the past decade, online learning has transformed the way millions of students access education worldwide. What was once considered a niche alternative to traditional classrooms has now become mainstream.",
      "Several factors have contributed to this shift. Firstly, the widespread availability of smartphones and affordable internet has made digital content accessible even in remote areas.",
      "Secondly, online platforms often offer more flexibility, allowing learners to study at their own pace and revisit difficult topics as many times as needed — something a traditional classroom rarely permits.",
      "However, critics argue that online learning lacks the social interaction and discipline that face-to-face education provides. Students may also struggle with self-motivation when no teacher is physically present to guide them.",
      "Despite these challenges, most educators agree that a blended approach, combining both online and traditional methods, may offer the most effective path forward for the future of education."
    ],
    vocab:{
      "niche":{meaning_bn:"নির্দিষ্ট ক্ষুদ্র গোষ্ঠীর জন্য", pos:"adjective"},
      "mainstream":{meaning_bn:"মূলধারা", pos:"adjective"},
      "flexibility":{meaning_bn:"নমনীয়তা", pos:"noun"},
      "self-motivation":{meaning_bn:"আত্ম-উদ্দীপনা", pos:"noun"},
      "blended":{meaning_bn:"মিশ্রিত", pos:"adjective"}
    },
    quiz:[
      {q:"What has made online learning more accessible?", opts:["Cheaper books","Smartphones and affordable internet","More teachers","Government grants"], ans:1, exp:"'The widespread availability of smartphones and affordable internet'।"},
      {q:"What advantage does online learning offer?", opts:["More homework","Flexibility to study at one's own pace","No exams","Shorter courses"], ans:1, exp:"'Online platforms often offer more flexibility'।"},
      {q:"What do critics say online learning lacks?", opts:["Good content","Social interaction and discipline","Affordable price","Variety of subjects"], ans:1, exp:"'Lacks the social interaction and discipline'।"},
      {q:"What do most educators recommend?", opts:["Only online classes","Only traditional classes","A blended approach","Stopping online classes"], ans:2, exp:"'A blended approach... may offer the most effective path forward'।"}
    ]
  },

  { id:"r10", title:"Climate Change and Bangladesh", category:"Article", level:"B1", readMinutes:4, xp:80,
    icon:"🌍", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    text:[
      "Bangladesh is widely recognised as one of the countries most vulnerable to the effects of climate change. Its low-lying geography and dense population make it especially susceptible to flooding, cyclones, and rising sea levels.",
      "Scientists predict that even a modest rise in sea level could displace millions of people living along the coastal regions, forcing them to migrate inland in search of safer ground.",
      "Agriculture, which forms the backbone of the rural economy, is also under threat. Unpredictable rainfall patterns and increased salinity in soil have already begun affecting crop yields in several coastal districts.",
      "In response, the government and various organisations have implemented adaptation strategies, including the construction of embankments, the cultivation of salt-resistant rice varieties, and early-warning systems for natural disasters.",
      "While these measures provide some relief, experts insist that long-term solutions require global cooperation, since climate change is a problem that no single nation can solve alone."
    ],
    vocab:{
      "vulnerable":{meaning_bn:"ঝুঁকিপূর্ণ", pos:"adjective"},
      "susceptible":{meaning_bn:"প্রবণ, ঝুঁকিগ্রস্ত", pos:"adjective"},
      "displace":{meaning_bn:"স্থানচ্যুত করা", pos:"verb"},
      "salinity":{meaning_bn:"লবণাক্ততা", pos:"noun"},
      "embankments":{meaning_bn:"বাঁধ", pos:"noun"}
    },
    quiz:[
      {q:"Why is Bangladesh vulnerable to climate change?", opts:["High elevation","Low-lying geography and dense population","Small population","Desert climate"], ans:1, exp:"'Its low-lying geography and dense population'।"},
      {q:"What threat does agriculture face?", opts:["Too much sunlight","Unpredictable rainfall and soil salinity","Lack of farmers","Too many crops"], ans:1, exp:"'Unpredictable rainfall patterns and increased salinity in soil'।"},
      {q:"What is one adaptation strategy mentioned?", opts:["Cutting down forests","Building embankments","Stopping farming","Closing coastal areas"], ans:1, exp:"'The construction of embankments'।"},
      {q:"What do experts say about long-term solutions?", opts:["Only Bangladesh can solve it","It requires global cooperation","It cannot be solved","It is not a real problem"], ans:1, exp:"'Long-term solutions require global cooperation'।"}
    ]
  },

  { id:"r11", title:"The Power of Habit", category:"Article", level:"B2", readMinutes:5, xp:100,
    icon:"🔁", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    text:[
      "Habits are the small, often unconscious decisions that shape the majority of our daily lives. Researchers estimate that nearly forty percent of our daily actions are not the result of deliberate decision-making but rather automatic routines performed out of habit.",
      "Understanding how habits form can be tremendously useful for anyone wishing to improve their productivity or break unwanted patterns of behaviour. According to behavioural scientists, every habit consists of three components: a cue, a routine, and a reward.",
      "The cue acts as a trigger that signals the brain to initiate a particular behaviour. The routine is the behaviour itself, which can be physical, emotional, or mental. Finally, the reward reinforces the behaviour, making the brain more likely to remember and repeat the pattern in the future.",
      "Breaking a bad habit, therefore, is not simply about willpower. It often requires identifying the underlying cue and consciously replacing the routine with a healthier alternative, while still providing the brain with a similar reward.",
      "This explains why many self-improvement strategies that focus solely on eliminating a behaviour, without addressing its root cause, tend to fail in the long run."
    ],
    vocab:{
      "unconscious":{meaning_bn:"অচেতন", pos:"adjective"},
      "deliberate":{meaning_bn:"ইচ্ছাকৃত", pos:"adjective"},
      "trigger":{meaning_bn:"উদ্দীপক, কারণ", pos:"noun"},
      "reinforces":{meaning_bn:"আরও দৃঢ় করে", pos:"verb"},
      "willpower":{meaning_bn:"ইচ্ছাশক্তি", pos:"noun"}
    },
    quiz:[
      {q:"What percentage of daily actions are habitual, according to researchers?", opts:["10%","25%","Nearly 40%","75%"], ans:2, exp:"'Nearly forty percent of our daily actions'।"},
      {q:"What are the three components of a habit?", opts:["Thought, action, result","Cue, routine, reward","Idea, plan, outcome","Trigger, fear, response"], ans:1, exp:"'A cue, a routine, and a reward'।"},
      {q:"What is required to break a bad habit successfully?", opts:["Only willpower","Identifying the cue and replacing the routine","Ignoring the habit","Punishing oneself"], ans:1, exp:"'Identifying the underlying cue and consciously replacing the routine'।"},
      {q:"Why do many self-improvement strategies fail?", opts:["They are too easy","They don't address the root cause","People don't try hard enough","They take too long"], ans:1, exp:"'Without addressing its root cause, tend to fail in the long run'।"}
    ]
  },

  { id:"r12", title:"Artificial Intelligence: Promise and Peril", category:"Article", level:"C1", readMinutes:6, xp:120,
    icon:"🤖", color:"rgba(167,139,250,.12)", border:"rgba(167,139,250,.25)",
    text:[
      "Artificial intelligence has rapidly evolved from a niche academic pursuit into one of the most transformative technologies of the modern era, permeating nearly every sector of human endeavour, from healthcare diagnostics to financial forecasting.",
      "Proponents argue that AI systems, with their capacity to process vast quantities of data far beyond human capability, hold the potential to solve some of humanity's most intractable problems, including disease prediction, climate modelling, and resource optimisation.",
      "Nevertheless, this rapid proliferation has not been without considerable controversy. Critics highlight concerns surrounding algorithmic bias, wherein AI systems trained on flawed or unrepresentative datasets can inadvertently perpetuate existing societal inequalities.",
      "Furthermore, the displacement of human labour by automation raises profound questions about the future structure of employment and economic distribution, particularly within industries reliant on routine, repetitive tasks.",
      "Perhaps most contentious of all is the question of accountability: when an autonomous system makes a consequential error, determining where responsibility lies — with the developer, the deploying organisation, or the technology itself — remains a largely unresolved legal and ethical quandary.",
      "As governments and international bodies scramble to draft regulatory frameworks, the central challenge remains striking a delicate balance between fostering innovation and safeguarding against the technology's most pernicious potential consequences."
    ],
    vocab:{
      "permeating":{meaning_bn:"সর্বত্র বিস্তার লাভ করা", pos:"verb"},
      "intractable":{meaning_bn:"দুরূহ, সমাধান করা কঠিন", pos:"adjective"},
      "proliferation":{meaning_bn:"দ্রুত বিস্তার/বৃদ্ধি", pos:"noun"},
      "inadvertently":{meaning_bn:"অনিচ্ছাকৃতভাবে", pos:"adverb"},
      "contentious":{meaning_bn:"বিতর্কিত", pos:"adjective"},
      "pernicious":{meaning_bn:"ক্ষতিকর", pos:"adjective"}
    },
    quiz:[
      {q:"What do proponents of AI argue?", opts:["AI is dangerous and should be banned","AI can solve intractable problems like disease prediction","AI has no real benefits","AI only works in healthcare"], ans:1, exp:"'Hold the potential to solve some of humanity's most intractable problems'।"},
      {q:"What is 'algorithmic bias' according to the passage?", opts:["A type of computer virus","AI systems perpetuating inequalities from flawed data","A pricing strategy","A programming language error"], ans:1, exp:"'AI systems trained on flawed or unrepresentative datasets can inadvertently perpetuate existing societal inequalities'।"},
      {q:"What unresolved question does the passage raise about errors?", opts:["How much AI costs","Who is accountable when AI makes an error","How fast AI can compute","Where AI is developed"], ans:1, exp:"'Determining where responsibility lies... remains a largely unresolved legal and ethical quandary'।"},
      {q:"What is the central challenge for regulators, per the passage?", opts:["Banning AI completely","Balancing innovation with safeguarding against risks","Making AI cheaper","Increasing AI speed"], ans:1, exp:"'Striking a delicate balance between fostering innovation and safeguarding against... consequences'।"}
    ]
  },

  /* ════════════════════════════════
     NEW A1 — STORY (3 passages)
  ════════════════════════════════ */

  { id:"r13", title:"A Visit to the Market", category:"Story", level:"A1", readMinutes:2, xp:40,
    icon:"🛒", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    text:[
      "Every Friday morning, Amina goes to the market with her mother. The market is full of colours, sounds, and smells.",
      "They walk past stalls of fresh fruit — red apples, yellow bananas, and green grapes. Amina's mother stops to buy some tomatoes and onions for dinner.",
      "Next, they visit the fish seller. He calls out loudly, telling everyone about his fresh fish. Amina covers her ears because the noise is so loud.",
      "On their way home, Amina's mother buys her a small toy from a street vendor. Amina smiles and holds her mother's hand tightly as they walk back home together."
    ],
    vocab:{
      "stalls":{meaning_bn:"দোকানের ছোট কাঠামো", pos:"noun"},
      "loudly":{meaning_bn:"জোরে শব্দে", pos:"adverb"},
      "vendor":{meaning_bn:"বিক্রেতা", pos:"noun"}
    },
    quiz:[
      {q:"When does Amina go to the market?", opts:["Monday","Wednesday","Friday morning","Sunday evening"], ans:2, exp:"'Every Friday morning, Amina goes to the market'।"},
      {q:"What does Amina's mother buy for dinner?", opts:["Fish and rice","Tomatoes and onions","Apples and bananas","Bread and milk"], ans:1, exp:"'Buy some tomatoes and onions for dinner'।"},
      {q:"Why does Amina cover her ears?", opts:["It is cold","The fish seller is loud","She is scared","She has a headache"], ans:1, exp:"'He calls out loudly... the noise is so loud'।"}
    ]
  },

  { id:"r14", title:"The New Puppy", category:"Story", level:"A1", readMinutes:2, xp:40,
    icon:"🐶", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    text:[
      "Last weekend, Tariq's father brought home a small brown puppy. Tariq was so excited that he could not stop smiling all day.",
      "The puppy was very playful. It ran around the living room and chewed on Tariq's shoes. Tariq decided to name the puppy \"Bruno.\"",
      "Every morning, Tariq wakes up early to feed Bruno and take him for a walk in the park. Bruno loves chasing birds and rolling in the grass.",
      "At night, Bruno sleeps in a small basket next to Tariq's bed. Tariq says Bruno is now his best friend, and he cannot imagine life without him."
    ],
    vocab:{
      "playful":{meaning_bn:"খেলাপ্রবণ, চঞ্চল", pos:"adjective"},
      "chewed":{meaning_bn:"কামড়ে চিবানো", pos:"verb"},
      "chasing":{meaning_bn:"তাড়া করা", pos:"verb"}
    },
    quiz:[
      {q:"What colour is the puppy?", opts:["Black","White","Brown","Grey"], ans:2, exp:"'A small brown puppy'।"},
      {q:"What did Tariq name the puppy?", opts:["Rex","Bruno","Tommy","Max"], ans:1, exp:"'Tariq decided to name the puppy \"Bruno\"'।"},
      {q:"Where does Bruno sleep at night?", opts:["Outside","In the kitchen","In a basket next to Tariq's bed","In the garden"], ans:2, exp:"'Bruno sleeps in a small basket next to Tariq's bed'।"}
    ]
  },

  { id:"r15", title:"A Birthday Surprise", category:"Story", level:"A1", readMinutes:2, xp:40,
    icon:"🎂", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    text:[
      "Today is Mina's tenth birthday. She woke up and came downstairs, but the house was very quiet. She felt a little sad because nobody said \"Happy Birthday\" to her.",
      "She walked into the living room, and suddenly the lights turned on. \"Surprise!\" everyone shouted. Her family and friends were all there with balloons and a big cake.",
      "Mina was so happy that she almost cried with joy. Her best friend gave her a beautiful drawing as a gift, and her brother gave her a new storybook.",
      "They sang the birthday song together, and Mina blew out the candles on her cake. It was the best birthday she had ever had."
    ],
    vocab:{
      "quiet":{meaning_bn:"নিরিবিলি, শান্ত", pos:"adjective"},
      "balloons":{meaning_bn:"বেলুন", pos:"noun"},
      "candles":{meaning_bn:"মোমবাতি", pos:"noun"}
    },
    quiz:[
      {q:"How old is Mina turning?", opts:["Eight","Nine","Ten","Eleven"], ans:2, exp:"'Today is Mina's tenth birthday'।"},
      {q:"Why did Mina feel sad at first?", opts:["She lost a toy","Nobody said Happy Birthday","She was sick","She missed school"], ans:1, exp:"'Nobody said \"Happy Birthday\" to her'।"},
      {q:"What did Mina's brother give her?", opts:["A toy","A drawing","A new storybook","A cake"], ans:2, exp:"'Her brother gave her a new storybook'।"}
    ]
  },

  /* ════════════════════════════════
     NEW A1 — ARTICLE (3 passages)
  ════════════════════════════════ */

  { id:"r16", title:"Why We Need Sleep", category:"Article", level:"A1", readMinutes:2, xp:40,
    icon:"😴", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    text:[
      "Sleep is very important for our body and mind. Children need about ten hours of sleep every night, while adults need around eight hours.",
      "When we sleep, our body rests and repairs itself. Our brain also uses this time to organise the things we learned during the day.",
      "If we do not get enough sleep, we may feel tired, angry, or unable to concentrate. Our memory can also become weaker over time.",
      "To sleep well, it is good to go to bed at the same time every night and avoid using phones right before sleeping."
    ],
    vocab:{
      "repairs":{meaning_bn:"মেরামত করা, ঠিক করা", pos:"verb"},
      "organise":{meaning_bn:"সাজানো, গুছানো", pos:"verb"},
      "concentrate":{meaning_bn:"মনোযোগ দেওয়া", pos:"verb"}
    },
    quiz:[
      {q:"How many hours of sleep do adults need?", opts:["Six hours","Eight hours","Ten hours","Twelve hours"], ans:1, exp:"'Adults need around eight hours'।"},
      {q:"What does our brain do while we sleep?", opts:["Nothing","Organises things we learned","Stops working completely","Creates new memories only"], ans:1, exp:"'Our brain also uses this time to organise the things we learned'।"},
      {q:"What can happen if we don't sleep enough?", opts:["We become taller","We feel tired and cannot concentrate","Our skin improves","We become stronger"], ans:1, exp:"'We may feel tired, angry, or unable to concentrate'।"}
    ]
  },

  { id:"r17", title:"The Four Seasons", category:"Article", level:"A1", readMinutes:2, xp:40,
    icon:"🍂", color:"rgba(251,146,60,.12)", border:"rgba(251,146,60,.25)",
    text:[
      "In many countries, the year is divided into four seasons: spring, summer, autumn, and winter. Each season brings different weather and changes in nature.",
      "Spring is the season when flowers bloom and the weather becomes warmer after winter. Many animals wake up from their long winter sleep.",
      "Summer is the hottest season. The days are longer, and people often enjoy outdoor activities like swimming and travelling.",
      "Autumn, also called fall, is when leaves change colour and fall from the trees. Finally, winter is the coldest season, and in some places, it even snows."
    ],
    vocab:{
      "bloom":{meaning_bn:"ফুল ফোটা", pos:"verb"},
      "outdoor":{meaning_bn:"বাইরের, খোলা জায়গায়", pos:"adjective"},
      "snows":{meaning_bn:"তুষারপাত হওয়া", pos:"verb"}
    },
    quiz:[
      {q:"How many seasons are mentioned in the passage?", opts:["Two","Three","Four","Five"], ans:2, exp:"'Divided into four seasons'।"},
      {q:"What happens to flowers in spring?", opts:["They die","They bloom","They turn brown","Nothing changes"], ans:1, exp:"'Flowers bloom and the weather becomes warmer'।"},
      {q:"What is another name for autumn?", opts:["Fall","Spring","Monsoon","Summer"], ans:0, exp:"'Autumn, also called fall'।"}
    ]
  },

  { id:"r18", title:"Healthy Eating Habits", category:"Article", level:"A1", readMinutes:2, xp:40,
    icon:"🥗", color:"rgba(45,212,191,.12)", border:"rgba(45,212,191,.25)",
    text:[
      "Eating healthy food is important for a strong body and a sharp mind. Fruits and vegetables give us vitamins that help us stay healthy and fight illness.",
      "Doctors recommend eating five servings of fruits and vegetables every day. It is also important to drink enough water and avoid too much sugar.",
      "Eating too much junk food, like chips and sweets, can make us feel tired and unhealthy over time. It can also cause problems like weight gain.",
      "A balanced diet, with rice, vegetables, fish or meat, and fruit, gives our body all the energy and nutrients it needs to grow and stay strong."
    ],
    vocab:{
      "vitamins":{meaning_bn:"ভিটামিন", pos:"noun"},
      "servings":{meaning_bn:"পরিমাণ, অংশ", pos:"noun"},
      "nutrients":{meaning_bn:"পুষ্টি উপাদান", pos:"noun"}
    },
    quiz:[
      {q:"How many servings of fruits/vegetables do doctors recommend daily?", opts:["Two","Three","Five","Eight"], ans:2, exp:"'Doctors recommend eating five servings... every day'।"},
      {q:"What can too much junk food cause?", opts:["Better health","Weight gain and tiredness","More energy","Stronger bones"], ans:1, exp:"'Can make us feel tired... cause problems like weight gain'।"},
      {q:"What does a balanced diet include?", opts:["Only fruit","Only rice","Rice, vegetables, fish/meat, and fruit","Only sweets"], ans:2, exp:"'Rice, vegetables, fish or meat, and fruit'।"}
    ]
  },

  /* ════════════════════════════════
     NEW A2 — STORY (3 passages)
  ════════════════════════════════ */

  { id:"r19", title:"The Honest Woodcutter", category:"Story", level:"A2", readMinutes:3, xp:60,
    icon:"🪓", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    text:[
      "Once there lived a poor woodcutter who earned his living by cutting trees near a river. One day, while he was cutting a branch, his old iron axe slipped from his hands and fell into the deep water.",
      "The woodcutter sat by the riverbank and began to cry, for the axe was his only tool and he had no money to buy a new one.",
      "Suddenly, a fairy appeared from the river and asked him why he was so upset. After hearing his story, she dived into the water and brought up a golden axe, asking if it was his.",
      "The honest woodcutter said no, it was not his axe. The fairy then brought a silver axe, but he again said it was not his. Finally, she brought up his old iron axe, and he happily said, \"Yes, this one is mine!\"",
      "Impressed by his honesty, the fairy gave him all three axes as a reward. The woodcutter returned home rich, having learned that honesty is always rewarded in the end."
    ],
    vocab:{
      "woodcutter":{meaning_bn:"কাঠুরে", pos:"noun"},
      "riverbank":{meaning_bn:"নদীর তীর", pos:"noun"},
      "honesty":{meaning_bn:"সততা", pos:"noun"}
    },
    quiz:[
      {q:"What happened to the woodcutter's axe?", opts:["It broke","It was stolen","It fell into the river","He sold it"], ans:2, exp:"'His old iron axe slipped from his hands and fell into the deep water'।"},
      {q:"Why did the woodcutter refuse the golden and silver axes?", opts:["He wanted more money","They were not his axe","He didn't like gold","He was scared"], ans:1, exp:"He honestly said the golden and silver axes were not his।"},
      {q:"What is the lesson of this story?", opts:["Always cry for help","Honesty is rewarded","Never go near a river","Gold is more valuable than iron"], ans:1, exp:"'Honesty is always rewarded in the end'।"}
    ]
  },

  { id:"r20", title:"Lost in the City", category:"Story", level:"A2", readMinutes:3, xp:60,
    icon:"🏙️", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    text:[
      "Farhan had just moved to Dhaka from a small village to start university. On his second day, he decided to explore the city alone, without telling anyone where he was going.",
      "He took several buses and walked through many unfamiliar streets, enjoying the busy markets and tall buildings. However, after a few hours, he suddenly realised that he had no idea how to get back to his hostel.",
      "His phone battery had died, and he could not remember the name of the street where he lived. Feeling anxious, he approached a kind shopkeeper and explained his situation.",
      "The shopkeeper let him use his phone to call a friend, who came and picked him up an hour later. Farhan learned an important lesson that day: always carry a charged phone and the address written down when exploring a new city."
    ],
    vocab:{
      "unfamiliar":{meaning_bn:"অপরিচিত", pos:"adjective"},
      "anxious":{meaning_bn:"উদ্বিগ্ন", pos:"adjective"},
      "approached":{meaning_bn:"কাছে যাওয়া", pos:"verb"}
    },
    quiz:[
      {q:"Why did Farhan move to Dhaka?", opts:["For a job","To start university","To visit family","For a holiday"], ans:1, exp:"'Farhan had just moved to Dhaka... to start university'।"},
      {q:"What problem did Farhan face?", opts:["He lost his bag","His phone died and he got lost","He missed his bus","He lost his money"], ans:1, exp:"'His phone battery had died'... he could not find his way back।"},
      {q:"Who helped Farhan?", opts:["A police officer","A teacher","A kind shopkeeper","His family"], ans:2, exp:"'He approached a kind shopkeeper and explained his situation'।"}
    ]
  },

  { id:"r21", title:"The Charity Football Match", category:"Story", level:"A2", readMinutes:3, xp:60,
    icon:"⚽", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    text:[
      "Every year, our school organises a charity football match to raise money for children who cannot afford an education. This year, I was chosen to be the captain of my class team.",
      "We practised every afternoon for two weeks, even though it was very tiring after a full day of classes. Our coach taught us new strategies and encouraged us to never give up.",
      "On the day of the match, the whole school gathered to watch. The game was extremely close, and the score remained tied until the very last minute.",
      "In the final seconds, I managed to score the winning goal. Everyone cheered loudly, and I felt incredibly proud, not because we won, but because we had helped raise a large amount of money for a good cause."
    ],
    vocab:{
      "charity":{meaning_bn:"দাতব্য, সেবামূলক", pos:"noun"},
      "strategies":{meaning_bn:"কৌশল", pos:"noun"},
      "tied":{meaning_bn:"সমান (স্কোর)", pos:"adjective"}
    },
    quiz:[
      {q:"Why does the school organise the football match?", opts:["For fun only","To raise money for education","To find new players","To celebrate a holiday"], ans:1, exp:"'To raise money for children who cannot afford an education'।"},
      {q:"How long did they practise?", opts:["One week","Two weeks","One month","Three days"], ans:1, exp:"'We practised every afternoon for two weeks'।"},
      {q:"Why did the writer feel proud at the end?", opts:["Only because they won","Because they helped raise money for a good cause","Because the coach praised him","Because he was tired"], ans:1, exp:"'Not because we won, but because we had helped raise a large amount of money for a good cause'।"}
    ]
  },

  /* ════════════════════════════════
     NEW A2 — ARTICLE (3 passages)
  ════════════════════════════════ */

  { id:"r22", title:"The Importance of Recycling", category:"Article", level:"A2", readMinutes:3, xp:60,
    icon:"♻️", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    text:[
      "Recycling means turning waste materials, such as paper, plastic, and glass, into new products instead of throwing them away. This simple act can have a huge positive impact on our environment.",
      "When we recycle, we reduce the amount of waste that ends up in landfills, which helps to keep our land and water clean. It also saves natural resources, since fewer raw materials need to be extracted from the earth.",
      "For example, recycling one tonne of paper can save around seventeen trees from being cut down. Similarly, recycling plastic bottles reduces the amount of plastic pollution in our oceans, which protects marine life.",
      "Many schools and communities now encourage students to separate their rubbish into different bins for paper, plastic, and organic waste, making the recycling process easier and more effective for everyone involved."
    ],
    vocab:{
      "landfills":{meaning_bn:"বর্জ্য ফেলার স্থান", pos:"noun"},
      "extracted":{meaning_bn:"আহরণ করা, তোলা", pos:"verb"},
      "pollution":{meaning_bn:"দূষণ", pos:"noun"}
    },
    quiz:[
      {q:"What does recycling mean, according to the passage?", opts:["Throwing waste away","Turning waste into new products","Burning rubbish","Burying waste underground"], ans:1, exp:"'Turning waste materials... into new products'।"},
      {q:"How many trees can recycling one tonne of paper save?", opts:["Five","Ten","Seventeen","Fifty"], ans:2, exp:"'Recycling one tonne of paper can save around seventeen trees'।"},
      {q:"How does recycling plastic help the ocean?", opts:["It makes water salty","It reduces plastic pollution and protects marine life","It has no effect","It increases fish population directly"], ans:1, exp:"'Reduces the amount of plastic pollution in our oceans, which protects marine life'।"}
    ]
  },

  { id:"r23", title:"Social Media: A Double-Edged Sword", category:"Article", level:"A2", readMinutes:3, xp:60,
    icon:"📱", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    text:[
      "Social media has become a major part of daily life for millions of young people around the world. Platforms allow users to connect with friends, share photos, and stay updated on current events.",
      "On the positive side, social media helps people stay in touch with family members who live far away and provides a space for creative expression through writing, photography, and videos.",
      "However, spending too much time on social media can also create problems. Many users compare their lives to the seemingly perfect lives of others online, which can lead to feelings of sadness or low self-esteem.",
      "Experts suggest setting a daily time limit for social media use and taking regular breaks to maintain a healthy balance between online life and real-world activities such as exercise and face-to-face conversations."
    ],
    vocab:{
      "platforms":{meaning_bn:"মাধ্যম, প্ল্যাটফর্ম", pos:"noun"},
      "self-esteem":{meaning_bn:"আত্মসম্মান", pos:"noun"},
      "maintain":{meaning_bn:"বজায় রাখা", pos:"verb"}
    },
    quiz:[
      {q:"What is one positive use of social media mentioned?", opts:["Making more money","Staying in touch with distant family","Avoiding exercise","Sleeping better"], ans:1, exp:"'Helps people stay in touch with family members who live far away'।"},
      {q:"What problem can too much social media use cause?", opts:["Better grades","Feelings of sadness or low self-esteem","More friends","Improved health"], ans:1, exp:"'Can lead to feelings of sadness or low self-esteem'।"},
      {q:"What do experts suggest?", opts:["Quit social media completely","Set a daily time limit and take breaks","Use it all day","Ignore the problem"], ans:1, exp:"'Setting a daily time limit for social media use and taking regular breaks'।"}
    ]
  },

  { id:"r24", title:"How Plants Make Their Food", category:"Article", level:"A2", readMinutes:3, xp:60,
    icon:"🌱", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    text:[
      "Unlike humans and animals, plants do not need to eat food to survive. Instead, they make their own food through a process called photosynthesis.",
      "During photosynthesis, plants absorb sunlight through their leaves, take in carbon dioxide from the air, and draw water up through their roots. These three ingredients combine inside the leaf to produce glucose, a type of sugar that gives the plant energy.",
      "As a useful side effect, this process also releases oxygen into the air, which humans and animals need to breathe. This is one reason why forests are often called the \"lungs of the earth.\"",
      "Without photosynthesis, there would be no oxygen for us to breathe and no food for animals that depend on plants. This makes it one of the most important processes for all life on our planet."
    ],
    vocab:{
      "absorb":{meaning_bn:"শোষণ করা", pos:"verb"},
      "glucose":{meaning_bn:"একপ্রকার চিনি, গ্লুকোজ", pos:"noun"},
      "oxygen":{meaning_bn:"অক্সিজেন", pos:"noun"}
    },
    quiz:[
      {q:"What is the process by which plants make food called?", opts:["Respiration","Digestion","Photosynthesis","Pollination"], ans:2, exp:"'A process called photosynthesis'।"},
      {q:"What three things do plants need for photosynthesis?", opts:["Soil, air, heat","Sunlight, carbon dioxide, water","Sugar, oxygen, soil","Water, fire, wind"], ans:1, exp:"'Absorb sunlight... take in carbon dioxide... draw water up through their roots'।"},
      {q:"What gas do plants release during photosynthesis?", opts:["Carbon dioxide","Nitrogen","Oxygen","Hydrogen"], ans:2, exp:"'This process also releases oxygen into the air'।"}
    ]
  },

  /* ════════════════════════════════
     NEW A1 — STORY (2 more)
  ════════════════════════════════ */

  { id:"r25", title:"My Family", category:"Story", level:"A1", readMinutes:2, xp:40,
    icon:"👨‍👩‍👧‍👦", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    text:[
      "My name is Lima. I live in a small flat in Chittagong with my family. There are five people in my family: my father, my mother, my older brother, my younger sister, and me.",
      "My father works at a bank, and he leaves home early every morning. My mother is a teacher at a primary school near our house. She teaches young children how to read and write.",
      "My older brother is in college. He likes playing cricket with his friends on weekends. My younger sister is only six years old, and she loves drawing pictures of flowers and animals.",
      "In the evening, we all sit together and have dinner. We talk about our day and laugh a lot. I love my family very much, and we always try to help each other."
    ],
    vocab:{
      "flat":{meaning_bn:"ফ্ল্যাট, বাসা", pos:"noun"},
      "primary school":{meaning_bn:"প্রাথমিক বিদ্যালয়", pos:"noun"},
      "weekends":{meaning_bn:"সাপ্তাহিক ছুটির দিন", pos:"noun"}
    },
    quiz:[
      {q:"How many people are in Lima's family?", opts:["Three","Four","Five","Six"], ans:2, exp:"'There are five people in my family'।"},
      {q:"What does Lima's mother do?", opts:["Doctor","Bank worker","Teacher","Shopkeeper"], ans:2, exp:"'My mother is a teacher at a primary school'।"},
      {q:"What does Lima's younger sister love doing?", opts:["Playing cricket","Drawing pictures","Reading books","Cooking"], ans:1, exp:"'She loves drawing pictures of flowers and animals'।"}
    ]
  },

  { id:"r26", title:"A Day at the Park", category:"Story", level:"A1", readMinutes:2, xp:40,
    icon:"🌳", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    text:[
      "On Saturday afternoon, Rakib and his friends went to the park near their house. The weather was sunny, and the park was full of people enjoying the day.",
      "They played football for an hour on the green grass. After that, they sat under a big tree and ate the snacks they had brought with them — sandwiches and orange juice.",
      "Rakib's little sister wanted to play on the swings, so they walked to the playground area. She laughed loudly every time she went up high in the air.",
      "Before going home, they bought ice cream from a small shop near the park gate. It was a perfect, happy day, and Rakib could not wait to come back again next weekend."
    ],
    vocab:{
      "swings":{meaning_bn:"দোলনা", pos:"noun"},
      "playground":{meaning_bn:"খেলার মাঠ", pos:"noun"},
      "snacks":{meaning_bn:"হালকা খাবার", pos:"noun"}
    },
    quiz:[
      {q:"What was the weather like at the park?", opts:["Rainy","Cloudy","Sunny","Cold"], ans:2, exp:"'The weather was sunny'।"},
      {q:"What did the friends eat under the tree?", opts:["Rice and fish","Sandwiches and orange juice","Pizza","Fruit only"], ans:1, exp:"'They had brought with them — sandwiches and orange juice'।"},
      {q:"What did Rakib's sister want to play on?", opts:["Football","Swings","Bicycle","Slide"], ans:1, exp:"'She wanted to play on the swings'।"}
    ]
  },

  /* ════════════════════════════════
     NEW A1 — ARTICLE (2 more)
  ════════════════════════════════ */

  { id:"r27", title:"Different Ways to Travel", category:"Article", level:"A1", readMinutes:2, xp:40,
    icon:"🚌", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    text:[
      "People travel from one place to another in many different ways. In cities, buses and rickshaws are very common because they are cheap and easy to find.",
      "For longer journeys between cities, people often take a train or a bus. Trains are usually comfortable and allow passengers to see the countryside as they travel.",
      "Some people prefer to travel by car because it gives them more freedom to stop whenever they want. However, cars can get stuck in heavy traffic, especially in big cities.",
      "For travelling to other countries, people usually take an aeroplane, since it is the fastest way to cover very long distances in just a few hours."
    ],
    vocab:{
      "rickshaws":{meaning_bn:"রিকশা", pos:"noun"},
      "passengers":{meaning_bn:"যাত্রী", pos:"noun"},
      "distances":{meaning_bn:"দূরত্ব", pos:"noun"}
    },
    quiz:[
      {q:"Why are buses and rickshaws common in cities?", opts:["They are expensive","They are cheap and easy to find","They are very fast","They are comfortable only"], ans:1, exp:"'They are cheap and easy to find'।"},
      {q:"What can people see while travelling by train?", opts:["Nothing","The countryside","Only buildings","The ocean"], ans:1, exp:"'Allow passengers to see the countryside as they travel'।"},
      {q:"What is the fastest way to travel to other countries?", opts:["Car","Train","Bus","Aeroplane"], ans:3, exp:"'People usually take an aeroplane, since it is the fastest way'।"}
    ]
  },

  { id:"r28", title:"Keeping Our Body Clean", category:"Article", level:"A1", readMinutes:2, xp:40,
    icon:"🧼", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    text:[
      "Keeping our body clean is very important for staying healthy. We should wash our hands with soap before eating and after using the toilet.",
      "Brushing our teeth twice a day, in the morning and before going to bed, helps prevent toothache and keeps our breath fresh.",
      "Taking a bath every day removes dirt and sweat from our skin, which can otherwise cause itching or bad smells. It is also important to wear clean clothes.",
      "If we do not keep ourselves clean, germs can spread easily and make us sick. Good hygiene habits protect not only ourselves but also the people around us."
    ],
    vocab:{
      "prevent":{meaning_bn:"প্রতিরোধ করা", pos:"verb"},
      "sweat":{meaning_bn:"ঘাম", pos:"noun"},
      "hygiene":{meaning_bn:"স্বাস্থ্যবিধি", pos:"noun"}
    },
    quiz:[
      {q:"When should we wash our hands?", opts:["Only after eating","Before eating and after using the toilet","Once a day","Only when dirty"], ans:1, exp:"'Before eating and after using the toilet'।"},
      {q:"How many times a day should we brush our teeth?", opts:["Once","Twice","Three times","Four times"], ans:1, exp:"'Brushing our teeth twice a day'।"},
      {q:"What can happen if we don't keep clean?", opts:["We become stronger","Germs spread and make us sick","We feel fresh","Nothing happens"], ans:1, exp:"'Germs can spread easily and make us sick'।"}
    ]
  },

  /* ════════════════════════════════
     NEW A2 — STORY (2 more)
  ════════════════════════════════ */

  { id:"r29", title:"A Trip to the Doctor", category:"Story", level:"A2", readMinutes:3, xp:60,
    icon:"🩺", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    text:[
      "Last week, Nabila woke up with a high fever and a sore throat. Her mother decided to take her to see a doctor at the nearby clinic right away.",
      "At the clinic, they had to wait for nearly thirty minutes because several other patients were ahead of them. Nabila felt nervous, as she did not enjoy visiting doctors.",
      "When it was finally her turn, the doctor checked her temperature and looked carefully into her throat. He told her mother that it was just a common cold and nothing serious to worry about.",
      "The doctor prescribed some medicine and advised Nabila to drink warm water and rest for a few days. He also said that she should avoid cold drinks until she felt completely better.",
      "Within three days, Nabila started feeling much better and was able to return to school. She thanked the doctor for his help and felt relieved that it was nothing serious."
    ],
    vocab:{
      "sore throat":{meaning_bn:"গলা ব্যথা", pos:"noun"},
      "prescribed":{meaning_bn:"ব্যবস্থাপত্র দেওয়া", pos:"verb"},
      "relieved":{meaning_bn:"স্বস্তি বোধ করা", pos:"adjective"}
    },
    quiz:[
      {q:"Why did Nabila go to the clinic?", opts:["For a checkup","She had a fever and sore throat","For a vaccination","To visit a friend"], ans:1, exp:"'Nabila woke up with a high fever and a sore throat'।"},
      {q:"What did the doctor say Nabila had?", opts:["A serious illness","A common cold","An infection requiring surgery","Nothing wrong"], ans:1, exp:"'It was just a common cold and nothing serious'।"},
      {q:"How long did it take for Nabila to feel better?", opts:["One day","Three days","A week","A month"], ans:1, exp:"'Within three days, Nabila started feeling much better'।"}
    ]
  },

  { id:"r30", title:"The School Science Fair", category:"Story", level:"A2", readMinutes:3, xp:60,
    icon:"🔬", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    text:[
      "Every year, our school holds a science fair where students present projects they have worked on for weeks. This year, I decided to build a small model of a volcano that could actually erupt using baking soda and vinegar.",
      "I spent two weekends building the model with my father, carefully painting it to look like a real mountain. I also prepared a poster explaining how real volcanoes work.",
      "On the day of the fair, I felt extremely nervous as judges walked around examining each project. When they reached my table, I demonstrated the eruption, and the judges seemed impressed by the bright orange \"lava.\"",
      "Later that afternoon, the results were announced, and I was thrilled to learn that my project had won second place. My father was incredibly proud, and I felt that all the hard work had truly paid off."
    ],
    vocab:{
      "erupt":{meaning_bn:"অগ্ন্যুৎপাত হওয়া, ফেটে পড়া", pos:"verb"},
      "demonstrated":{meaning_bn:"প্রদর্শন করা", pos:"verb"},
      "thrilled":{meaning_bn:"উত্তেজিত, আনন্দিত", pos:"adjective"}
    },
    quiz:[
      {q:"What did the writer build for the science fair?", opts:["A robot","A model volcano","A solar system model","A computer"], ans:1, exp:"'I decided to build a small model of a volcano'।"},
      {q:"What materials did the volcano use to erupt?", opts:["Water and salt","Baking soda and vinegar","Fire and oil","Sand and stones"], ans:1, exp:"'Could actually erupt using baking soda and vinegar'।"},
      {q:"What place did the project win?", opts:["First place","Second place","Third place","No prize"], ans:1, exp:"'My project had won second place'।"}
    ]
  },

  /* ════════════════════════════════
     NEW A2 — ARTICLE (2 more)
  ════════════════════════════════ */

  { id:"r31", title:"The Magic of Reading Books", category:"Article", level:"A2", readMinutes:3, xp:60,
    icon:"📚", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    text:[
      "Reading books regularly offers many benefits beyond simple entertainment. It helps improve vocabulary, strengthens the imagination, and increases our general knowledge of the world.",
      "Studies have shown that people who read often tend to have better concentration and stronger writing skills compared to those who rarely pick up a book.",
      "Fiction books, such as novels and short stories, allow readers to experience different lives and emotions, building empathy and a deeper understanding of other people.",
      "Non-fiction books, on the other hand, provide useful facts and real information about history, science, and many other subjects, helping readers learn practical things about the world.",
      "Setting aside just thirty minutes a day for reading, whether on paper or a screen, can make a significant difference to a person's knowledge and language skills over time."
    ],
    vocab:{
      "imagination":{meaning_bn:"কল্পনাশক্তি", pos:"noun"},
      "empathy":{meaning_bn:"সমব্যথিতা, সহমর্মিতা", pos:"noun"},
      "significant":{meaning_bn:"গুরুত্বপূর্ণ, তাৎপর্যপূর্ণ", pos:"adjective"}
    },
    quiz:[
      {q:"What does reading help to strengthen?", opts:["Only memory","Vocabulary and imagination","Only handwriting","Sports skills"], ans:1, exp:"'Helps improve vocabulary, strengthens the imagination'।"},
      {q:"What do fiction books help build?", opts:["Mathematical skills","Empathy and understanding of others","Cooking skills","Driving skills"], ans:1, exp:"'Building empathy and a deeper understanding of other people'।"},
      {q:"How much daily reading can make a difference, according to the passage?", opts:["Ten minutes","Thirty minutes","Two hours","Five hours"], ans:1, exp:"'Setting aside just thirty minutes a day for reading'।"}
    ]
  },

  { id:"r32", title:"How Our Weather Forecasts Work", category:"Article", level:"A2", readMinutes:3, xp:60,
    icon:"⛅", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    text:[
      "Have you ever wondered how weather forecasters know whether it will rain tomorrow? Weather forecasting relies on a combination of advanced technology and scientific observation.",
      "Meteorologists, scientists who study weather, use satellites to capture images of clouds from space. These images help them track storms and predict how weather patterns might move over the next few days.",
      "Weather stations on the ground also collect important data, such as temperature, humidity, and wind speed. Computers then use this information to create models that simulate how the atmosphere will behave.",
      "Although forecasts have become much more accurate over the years, they are still predictions, not certainties. This is why forecasters often give a percentage, such as a seventy percent chance of rain, rather than a definite answer."
    ],
    vocab:{
      "meteorologists":{meaning_bn:"আবহাওয়াবিদ", pos:"noun"},
      "humidity":{meaning_bn:"বাতাসের জলীয়বাষ্প, আদ্রতা", pos:"noun"},
      "simulate":{meaning_bn:"অনুকরণ করা, অনুরূপ তৈরি করা", pos:"verb"}
    },
    quiz:[
      {q:"What do meteorologists use to capture images of clouds?", opts:["Telescopes","Satellites","Microscopes","Drones only"], ans:1, exp:"'Use satellites to capture images of clouds from space'।"},
      {q:"What data do weather stations collect?", opts:["Only temperature","Temperature, humidity, and wind speed","Only rainfall amount","Population data"], ans:1, exp:"'Temperature, humidity, and wind speed'।"},
      {q:"Why do forecasters give a percentage chance of rain?", opts:["Forecasts are always wrong","Forecasts are predictions, not certainties","To confuse people","Because it sounds scientific"], ans:1, exp:"'They are still predictions, not certainties'।"}
    ]
  },

  /* ════════════════════════════════
     NEW B1 — STORY (5 passages)
  ════════════════════════════════ */

  { id:"r33", title:"The Job Interview", category:"Story", level:"B1", readMinutes:4, xp:80,
    icon:"💼", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    text:[
      "Shuvo had been searching for a job for nearly six months after graduating from university, sending out dozens of applications without receiving a single positive response. When he finally got called for an interview at a marketing firm, he was determined not to waste the opportunity.",
      "The night before, he stayed up late researching the company, practising answers to common interview questions, and carefully choosing a formal outfit. Despite his preparation, his hands trembled slightly as he walked into the reception area the following morning.",
      "The interviewer, a stern-looking woman in her forties, asked him a series of challenging questions about his previous experience and how he would handle difficult clients. Shuvo answered honestly, admitting that although he lacked extensive experience, he was eager to learn and willing to work hard.",
      "To his surprise, the interviewer smiled and explained that she valued honesty and enthusiasm far more than a perfect résumé. A week later, Shuvo received a phone call informing him that he had been selected for the position.",
      "Looking back, Shuvo realised that his months of rejection had taught him resilience, and that being genuine during the interview, rather than pretending to be someone he was not, had ultimately made all the difference."
    ],
    vocab:{
      "applications":{meaning_bn:"আবেদনপত্র", pos:"noun"},
      "trembled":{meaning_bn:"কাঁপা", pos:"verb"},
      "résumé":{meaning_bn:"জীবন বৃত্তান্ত", pos:"noun"},
      "resilience":{meaning_bn:"সহনশীলতা", pos:"noun"}
    },
    quiz:[
      {q:"How long had Shuvo been searching for a job?", opts:["Two months","Six months","One year","Three weeks"], ans:1, exp:"'Nearly six months after graduating'।"},
      {q:"What did Shuvo admit during the interview?", opts:["He had no interest in the job","He lacked extensive experience but was eager to learn","He had another job offer","He didn't prepare at all"], ans:1, exp:"'He lacked extensive experience, he was eager to learn and willing to work hard'।"},
      {q:"What did the interviewer value most?", opts:["A perfect résumé","Honesty and enthusiasm","Formal clothing","Connections"], ans:1, exp:"'She valued honesty and enthusiasm far more than a perfect résumé'।"},
      {q:"What lesson did Shuvo learn?", opts:["Never apply for jobs","Pretend to be someone else","Being genuine makes a difference","Interviews are unfair"], ans:2, exp:"'Being genuine... had ultimately made all the difference'।"}
    ]
  },

  { id:"r34", title:"The Power Cut", category:"Story", level:"B1", readMinutes:4, xp:80,
    icon:"🔌", color:"rgba(251,146,60,.12)", border:"rgba(251,146,60,.25)",
    text:[
      "It was a sweltering evening in July when the electricity suddenly went out across our entire neighbourhood. Within seconds, the constant hum of fans and air conditioners fell silent, leaving an eerie quietness in its place.",
      "My younger siblings began complaining almost immediately, frustrated that they could not continue watching their favourite cartoon. My mother, however, calmly lit several candles and suggested we all sit together on the rooftop to escape the stuffy heat indoors.",
      "As we climbed the stairs, we noticed that nearly every household in the neighbourhood had done the same thing. People were chatting with their neighbours, children were playing in the moonlight, and the atmosphere felt surprisingly cheerful despite the inconvenience.",
      "My grandfather began telling stories about his childhood, when electricity was a luxury few households possessed, and how families would gather like this almost every evening. For the first time in years, I genuinely listened to his stories instead of scrolling through my phone.",
      "When the power finally returned three hours later, nobody rushed back inside immediately. We had unexpectedly rediscovered something valuable that modern convenience often makes us forget: the simple pleasure of spending time together."
    ],
    vocab:{
      "sweltering":{meaning_bn:"প্রচণ্ড গরম", pos:"adjective"},
      "eerie":{meaning_bn:"রহস্যময়, অস্বাভাবিক", pos:"adjective"},
      "stuffy":{meaning_bn:"গুমোট, বদ্ধ", pos:"adjective"},
      "luxury":{meaning_bn:"বিলাসিতা", pos:"noun"}
    },
    quiz:[
      {q:"What happened suddenly one evening in July?", opts:["A storm started","The electricity went out","Their phone broke","A guest arrived"], ans:1, exp:"'The electricity suddenly went out across our entire neighbourhood'।"},
      {q:"Where did the family go to escape the heat?", opts:["A neighbour's house","The rooftop","The market","A relative's home"], ans:1, exp:"'Suggested we all sit together on the rooftop'।"},
      {q:"What did the grandfather talk about?", opts:["Politics","His childhood, when electricity was rare","Sports","Cooking"], ans:1, exp:"'When electricity was a luxury few households possessed'।"},
      {q:"What did the family rediscover that evening?", opts:["A lost item","The pleasure of spending time together","A new hobby","Nothing important"], ans:1, exp:"'The simple pleasure of spending time together'।"}
    ]
  },

  { id:"r35", title:"Starting a Small Business", category:"Story", level:"B1", readMinutes:4, xp:80,
    icon:"🏪", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    text:[
      "After working for five years as an accountant, Reshma decided to take a significant risk and open her own small bakery, something she had dreamed about since childhood. Her family was sceptical, worried that she was giving up a stable salary for an uncertain venture.",
      "The first few months were undeniably difficult. Reshma had to learn everything from managing finances to negotiating with suppliers, often working twelve-hour days while barely breaking even financially.",
      "There were moments when she seriously considered giving up, particularly after a batch of cakes spoiled due to a faulty refrigerator, resulting in a substantial financial loss. However, her determination, along with encouragement from loyal customers who appreciated her authentic recipes, kept her motivated.",
      "Gradually, word of her delicious pastries spread through the neighbourhood, and within a year, her small bakery had developed a devoted following. She eventually hired two employees and began supplying cakes to local cafes as well.",
      "Reflecting on her journey, Reshma often tells aspiring entrepreneurs that success rarely happens overnight; it requires patience, resilience, and an unwavering belief in one's own vision, even when others doubt it."
    ],
    vocab:{
      "sceptical":{meaning_bn:"সন্দিহান", pos:"adjective"},
      "venture":{meaning_bn:"ব্যবসায়িক উদ্যোগ", pos:"noun"},
      "substantial":{meaning_bn:"যথেষ্ট, বড়", pos:"adjective"},
      "entrepreneurs":{meaning_bn:"উদ্যোক্তা", pos:"noun"}
    },
    quiz:[
      {q:"What did Reshma do before opening her bakery?", opts:["She was a teacher","She was an accountant","She was a chef","She was a student"], ans:1, exp:"'After working for five years as an accountant'।"},
      {q:"What setback did Reshma face?", opts:["A theft","A batch of cakes spoiled due to a faulty refrigerator","A fire","A lawsuit"], ans:1, exp:"'A batch of cakes spoiled due to a faulty refrigerator'।"},
      {q:"What kept Reshma motivated?", opts:["Government support","Encouragement from loyal customers","Luck","Her family's pressure"], ans:1, exp:"'Encouragement from loyal customers who appreciated her authentic recipes'।"},
      {q:"What does Reshma believe is needed for success?", opts:["Quick luck","Patience, resilience, and belief in one's vision","A large loan","Connections only"], ans:1, exp:"'It requires patience, resilience, and an unwavering belief in one's own vision'।"}
    ]
  },

  { id:"r36", title:"The Misunderstanding", category:"Story", level:"B1", readMinutes:4, xp:80,
    icon:"💬", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    text:[
      "Imran and Sajid had been close friends since childhood, but a small misunderstanding nearly ended their friendship of fifteen years. It began when Sajid failed to attend Imran's wedding, sending only a brief text message of apology without any explanation.",
      "Hurt and confused, Imran assumed that Sajid no longer valued their friendship and gradually stopped responding to his calls and messages. Sajid, on the other hand, interpreted Imran's silence as anger and decided not to push the matter, assuming Imran needed space.",
      "Months passed in awkward silence until a mutual friend's birthday party brought them face to face once again. Initially, the atmosphere was tense, with both men avoiding direct conversation.",
      "Eventually, after several uncomfortable minutes, Imran finally asked Sajid directly why he had missed the wedding. Sajid explained, visibly embarrassed, that his father had suffered a medical emergency that same night, and he had been too overwhelmed to explain properly at the time.",
      "Realising how a simple lack of communication had caused months of unnecessary distance, both friends apologised and agreed that, in future, they would always talk things through honestly rather than assuming the worst about each other."
    ],
    vocab:{
      "misunderstanding":{meaning_bn:"ভুল বোঝাবুঝি", pos:"noun"},
      "interpreted":{meaning_bn:"বুঝে নেওয়া, অর্থ করা", pos:"verb"},
      "overwhelmed":{meaning_bn:"অভিভূত, বিপর্যস্ত", pos:"adjective"}
    },
    quiz:[
      {q:"What caused the conflict between Imran and Sajid?", opts:["A money dispute","Sajid missing Imran's wedding without explanation","A fight about politics","A misunderstanding about a job"], ans:1, exp:"'Sajid failed to attend Imran's wedding, sending only a brief text message'।"},
      {q:"Why did Sajid miss the wedding?", opts:["He forgot the date","His father had a medical emergency","He was on a trip","He didn't want to attend"], ans:1, exp:"'His father had suffered a medical emergency that same night'।"},
      {q:"What did both friends agree to do in the future?", opts:["Never speak again","Avoid each other's events","Talk things through honestly","Ignore misunderstandings"], ans:2, exp:"'They would always talk things through honestly rather than assuming the worst'।"}
    ]
  },

  { id:"r37", title:"Surviving the Flood", category:"Story", level:"B1", readMinutes:4, xp:80,
    icon:"🌊", color:"rgba(45,212,191,.12)", border:"rgba(45,212,191,.25)",
    text:[
      "When the monsoon rains arrived early that year, nobody in our village anticipated just how severe the flooding would eventually become. Within a few days, water had risen well above knee height, submerging the narrow dirt roads that connected our homes.",
      "My family, along with several neighbours, made the difficult decision to relocate temporarily to a nearby relief shelter situated on higher ground. We could only carry a few essential belongings, leaving behind furniture and possessions we feared might never be recovered.",
      "Life at the shelter was undeniably challenging; dozens of families shared limited space, and food supplies occasionally ran short. Despite these hardships, a remarkable sense of community quickly developed, with everyone sharing whatever resources they had.",
      "After nearly three weeks, the floodwaters gradually began to recede, allowing us to return home. Although our house had sustained considerable damage, with a portion of the roof collapsed, we felt profoundly grateful simply to be alive and reunited as a family.",
      "The experience fundamentally changed my perspective on material possessions; I learned that, no matter how difficult circumstances become, human resilience and community support can help people endure almost anything."
    ],
    vocab:{
      "submerging":{meaning_bn:"নিমজ্জিত করা", pos:"verb"},
      "relocate":{meaning_bn:"স্থানান্তর করা", pos:"verb"},
      "recede":{meaning_bn:"কমে যাওয়া, পিছিয়ে যাওয়া", pos:"verb"},
      "endure":{meaning_bn:"সহ্য করা, টিকে থাকা", pos:"verb"}
    },
    quiz:[
      {q:"What caused the flooding in the story?", opts:["A river burst","Early and severe monsoon rains","A dam failure","An earthquake"], ans:1, exp:"'When the monsoon rains arrived early that year... how severe the flooding would become'।"},
      {q:"Where did the family go during the flood?", opts:["A relative's house in another city","A relief shelter on higher ground","A hotel","Nowhere, they stayed home"], ans:1, exp:"'Relocate temporarily to a nearby relief shelter situated on higher ground'।"},
      {q:"What developed at the shelter despite the hardships?", opts:["Conflict among families","A sense of community","Illness","Chaos"], ans:1, exp:"'A remarkable sense of community quickly developed'।"},
      {q:"How did the experience change the writer's perspective?", opts:["Made them fear rain forever","Made them value possessions more","Showed the value of resilience and community","Made them want to move away permanently"], ans:2, exp:"'Human resilience and community support can help people endure almost anything'।"}
    ]
  },

  /* ════════════════════════════════
     NEW B1 — ARTICLE (4 passages)
  ════════════════════════════════ */

  { id:"r38", title:"The Science of Memory", category:"Article", level:"B1", readMinutes:4, xp:80,
    icon:"🧠", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    text:[
      "Memory is a complex cognitive process that allows us to encode, store, and later retrieve information. Scientists generally divide memory into three main types: sensory memory, short-term memory, and long-term memory.",
      "Sensory memory holds information from our senses for only a fraction of a second, just long enough for our brain to decide whether it is worth paying attention to. Short-term memory, by contrast, can hold a limited amount of information, typically around seven items, for roughly twenty to thirty seconds.",
      "If information in short-term memory is rehearsed or considered particularly meaningful, it may be transferred into long-term memory, where it can potentially be stored indefinitely. This transfer process, known as consolidation, often occurs during sleep, which explains why a good night's rest is crucial for learning.",
      "Interestingly, memories are not stored like files in a cabinet; rather, every time we recall a memory, our brain partially reconstructs it, which means our memories can subtly change or become distorted over repeated recollections.",
      "Understanding how memory works has practical applications, particularly in education, where techniques such as spaced repetition and active recall have been shown to significantly improve long-term retention of information."
    ],
    vocab:{
      "cognitive":{meaning_bn:"মননশীল, চিন্তাবিষয়ক", pos:"adjective"},
      "retrieve":{meaning_bn:"পুনরুদ্ধার করা", pos:"verb"},
      "consolidation":{meaning_bn:"দৃঢ়ীকরণ, একত্রীকরণ", pos:"noun"},
      "distorted":{meaning_bn:"বিকৃত", pos:"adjective"}
    },
    quiz:[
      {q:"What are the three main types of memory mentioned?", opts:["Visual, audio, sensory","Sensory, short-term, long-term","Fast, slow, permanent","Active, passive, neutral"], ans:1, exp:"'Sensory memory, short-term memory, and long-term memory'।"},
      {q:"What process transfers information to long-term memory, and when does it often occur?", opts:["Consolidation, during exercise","Consolidation, during sleep","Retrieval, during eating","Encoding, while talking"], ans:1, exp:"'This transfer process, known as consolidation, often occurs during sleep'।"},
      {q:"What happens each time we recall a memory?", opts:["It disappears","Our brain partially reconstructs it","It becomes permanently fixed","Nothing changes"], ans:1, exp:"'Every time we recall a memory, our brain partially reconstructs it'।"},
      {q:"What educational technique is mentioned as improving retention?", opts:["Memorising once","Spaced repetition and active recall","Reading quickly","Watching videos only"], ans:1, exp:"'Techniques such as spaced repetition and active recall have been shown to significantly improve long-term retention'।"}
    ]
  },

  { id:"r39", title:"Urbanisation and Its Challenges", category:"Article", level:"B1", readMinutes:4, xp:80,
    icon:"🏙️", color:"rgba(251,146,60,.12)", border:"rgba(251,146,60,.25)",
    text:[
      "Urbanisation, the process by which increasing numbers of people move from rural areas to cities, has accelerated dramatically over the past century. In Bangladesh alone, the urban population has grown substantially as people seek better employment opportunities and access to services.",
      "While cities often offer improved access to education, healthcare, and job prospects, rapid urbanisation also brings significant challenges. Overcrowding frequently leads to inadequate housing, with many newcomers forced to live in informal settlements lacking proper sanitation.",
      "Traffic congestion has become a defining feature of many growing cities, as infrastructure struggles to keep pace with population growth. This not only wastes time but also contributes considerably to air pollution, affecting public health.",
      "Furthermore, rural areas can suffer from this migration trend, as younger generations leave to pursue city life, sometimes leaving behind ageing populations and declining agricultural productivity.",
      "Urban planners increasingly argue that sustainable development, including affordable housing, efficient public transportation, and green spaces, is essential to ensure that cities can accommodate growing populations without sacrificing residents' quality of life."
    ],
    vocab:{
      "accelerated":{meaning_bn:"ত্বরান্বিত হয়েছে", pos:"verb"},
      "congestion":{meaning_bn:"জটলা, ভিড়", pos:"noun"},
      "sustainable":{meaning_bn:"টেকসই", pos:"adjective"},
      "accommodate":{meaning_bn:"স্থান দেওয়া, ধারণ করা", pos:"verb"}
    },
    quiz:[
      {q:"What is urbanisation, according to the passage?", opts:["Building more farms","People moving from rural areas to cities","A type of pollution","A government policy"], ans:1, exp:"'The process by which increasing numbers of people move from rural areas to cities'।"},
      {q:"What is one challenge of overcrowding mentioned?", opts:["Too many parks","Inadequate housing and poor sanitation","Lower prices","More jobs"], ans:1, exp:"'Inadequate housing, with many newcomers forced to live in informal settlements lacking proper sanitation'।"},
      {q:"How does migration affect rural areas?", opts:["It improves agriculture","It can leave ageing populations and declining productivity","It has no effect","It increases rural population"], ans:1, exp:"'Sometimes leaving behind ageing populations and declining agricultural productivity'।"},
      {q:"What do urban planners say is essential for sustainable cities?", opts:["More cars","Affordable housing, transport, and green spaces","Higher taxes","Fewer residents"], ans:1, exp:"'Affordable housing, efficient public transportation, and green spaces, is essential'।"}
    ]
  },

  { id:"r40", title:"The History of the Internet", category:"Article", level:"B1", readMinutes:4, xp:80,
    icon:"🌐", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    text:[
      "Although it may seem as though the internet has always existed, it is actually a relatively recent invention with origins dating back to the late 1960s. The earliest version, known as ARPANET, was developed by the United States military to allow computers at different universities to communicate with one another.",
      "Throughout the 1970s and 1980s, the network gradually expanded, and researchers developed key technologies, including email and the protocols that allow different computer networks to connect seamlessly, a system known as TCP/IP.",
      "The internet remained largely confined to academic and military use until 1991, when a British scientist named Tim Berners-Lee introduced the World Wide Web, a system that made it dramatically easier for ordinary people to access and navigate information using web browsers.",
      "Throughout the 1990s, internet usage expanded rapidly as personal computers became more affordable and widely available in homes. The early 2000s then witnessed the rise of social media platforms, fundamentally transforming how people communicated and shared information globally.",
      "Today, the internet connects billions of people worldwide, having evolved from a small military project into arguably the most influential technological development in modern human history."
    ],
    vocab:{
      "origins":{meaning_bn:"উৎপত্তি, উৎস", pos:"noun"},
      "protocols":{meaning_bn:"নিয়মাবলি, প্রটোকল", pos:"noun"},
      "seamlessly":{meaning_bn:"নির্বিঘ্নে", pos:"adverb"},
      "transforming":{meaning_bn:"রূপান্তরিত করা", pos:"verb"}
    },
    quiz:[
      {q:"What was the earliest version of the internet called?", opts:["World Wide Web","TCP/IP","ARPANET","Internet 1.0"], ans:2, exp:"'The earliest version, known as ARPANET'।"},
      {q:"Who introduced the World Wide Web?", opts:["Bill Gates","Tim Berners-Lee","Steve Jobs","Mark Zuckerberg"], ans:1, exp:"'A British scientist named Tim Berners-Lee introduced the World Wide Web'।"},
      {q:"When did internet usage expand rapidly in homes?", opts:["1960s","1980s","1990s","2010s"], ans:2, exp:"'Throughout the 1990s, internet usage expanded rapidly as personal computers became more affordable'।"},
      {q:"What rose in the early 2000s, according to the passage?", opts:["Email","Social media platforms","ARPANET","Web browsers"], ans:1, exp:"'The early 2000s then witnessed the rise of social media platforms'।"}
    ]
  },

  { id:"r41", title:"Understanding Renewable Energy", category:"Article", level:"B1", readMinutes:4, xp:80,
    icon:"☀️", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    text:[
      "Renewable energy refers to power generated from natural sources that are continuously replenished, such as sunlight, wind, and flowing water, in contrast to fossil fuels like coal and oil, which take millions of years to form and exist in limited quantities.",
      "Solar power, generated using panels that convert sunlight directly into electricity, has become increasingly affordable over the past decade, making it accessible to ordinary households rather than just large companies.",
      "Wind energy, harnessed through large turbines, has similarly expanded, particularly in coastal regions where wind speeds tend to be more consistent and reliable throughout the year.",
      "One of the primary advantages of renewable energy is that it produces little to no greenhouse gas emissions during operation, helping to combat climate change. However, critics point out challenges, including the intermittent nature of sunlight and wind, meaning energy storage solutions are still required for consistent supply.",
      "Despite these challenges, many countries are investing heavily in renewable infrastructure, recognising that transitioning away from fossil fuels is essential for both environmental sustainability and long-term energy security."
    ],
    vocab:{
      "replenished":{meaning_bn:"পুনরায় পূর্ণ করা", pos:"verb"},
      "harnessed":{meaning_bn:"কাজে ব্যবহার করা, নিয়ন্ত্রণে আনা", pos:"verb"},
      "intermittent":{meaning_bn:"বিরতিহীন নয়, থেমে থেমে হয়", pos:"adjective"},
      "infrastructure":{meaning_bn:"অবকাঠামো", pos:"noun"}
    },
    quiz:[
      {q:"What does renewable energy come from?", opts:["Coal and oil","Natural sources that are continuously replenished","Nuclear waste","Underground gas only"], ans:1, exp:"'Power generated from natural sources that are continuously replenished'।"},
      {q:"What is a main advantage of renewable energy?", opts:["It is always cheap","It produces little to no greenhouse gas emissions","It never needs storage","It works only at night"], ans:1, exp:"'It produces little to no greenhouse gas emissions during operation'।"},
      {q:"What challenge do critics point out about renewable energy?", opts:["It is too clean","The intermittent nature of sunlight and wind","It costs nothing","It harms no one"], ans:1, exp:"'The intermittent nature of sunlight and wind, meaning energy storage solutions are still required'।"}
    ]
  },

  /* ════════════════════════════════
     NEW B2 — STORY (6 passages)
  ════════════════════════════════ */

  { id:"r42", title:"The Inheritance Dispute", category:"Story", level:"B2", readMinutes:5, xp:100,
    icon:"📜", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    text:[
      "When their elderly father passed away unexpectedly, Farhana and her younger brother Habib discovered, much to their dismay, that he had left behind a will that neither of them had previously known existed. The document stipulated that the ancestral family home should be sold and the proceeds divided equally, a decision that immediately created tension between the two siblings.",
      "Farhana, who had cared for their father throughout his final years, felt a profound sense of betrayal upon learning that the house, where she had invested considerable emotional energy and personal sacrifice, would simply be sold to strangers. Habib, conversely, who lived abroad and had limited involvement in their father's care, argued pragmatically that selling the property and dividing the money was the fairest possible solution.",
      "Their disagreement escalated over several weeks, with each sibling enlisting various relatives to support their respective positions, ultimately straining relationships throughout the extended family. Neither was willing to compromise, each viewing the situation through the lens of their own sacrifices and circumstances.",
      "It was only when their elderly aunt intervened, gently reminding them of how their father had always prioritised family harmony above material possessions, that both siblings paused to reconsider their entrenched positions. Recognising that continuing this dispute would have devastated something their father valued far more than the house itself, they eventually reached a compromise: Farhana would retain the house, compensating Habib with an amount they jointly considered fair.",
      "Reflecting on the ordeal years later, both siblings acknowledged that the inheritance itself had mattered far less than preserving the relationship their father had spent a lifetime nurturing, a lesson that proved more valuable than any property could ever be."
    ],
    vocab:{
      "stipulated":{meaning_bn:"নির্ধারণ করা হয়েছিল (চুক্তিতে)", pos:"verb"},
      "pragmatically":{meaning_bn:"বাস্তবিকভাবে", pos:"adverb"},
      "entrenched":{meaning_bn:"দৃঢ়ভাবে প্রতিষ্ঠিত", pos:"adjective"},
      "ordeal":{meaning_bn:"কঠিন পরীক্ষা, যন্ত্রণাদায়ক অভিজ্ঞতা", pos:"noun"}
    },
    quiz:[
      {q:"What did the father's will stipulate?", opts:["The house should go to Farhana","The house should be sold and proceeds divided equally","The house should be donated","Nothing about the house"], ans:1, exp:"'The ancestral family home should be sold and the proceeds divided equally'।"},
      {q:"Why did Farhana feel betrayed?", opts:["She wanted money instead","She had invested emotional energy in the house her father wanted sold","She disliked her brother","She never liked the house"], ans:1, exp:"'The house, where she had invested considerable emotional energy and personal sacrifice, would simply be sold'।"},
      {q:"Who helped resolve the dispute?", opts:["A lawyer","Their elderly aunt","A judge","Their father's friend"], ans:1, exp:"'Their elderly aunt intervened, gently reminding them'।"},
      {q:"What lesson did the siblings learn?", opts:["Money matters most","Preserving relationships matters more than property","Wills should be ignored","Siblings should never disagree"], ans:1, exp:"'The inheritance itself had mattered far less than preserving the relationship'।"}
    ]
  },

  { id:"r43", title:"The Whistleblower", category:"Story", level:"B2", readMinutes:5, xp:100,
    icon:"📢", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    text:[
      "Tahmina had worked as a quality control inspector at a pharmaceutical manufacturing plant for nearly seven years when she first noticed irregularities in the testing records for a newly launched medication. Initially, she assumed it was a clerical error, but upon further investigation, she discovered evidence suggesting that certain safety tests had been deliberately falsified to meet aggressive production deadlines.",
      "Faced with this troubling discovery, Tahmina found herself wrestling with an agonising dilemma. Reporting the issue could potentially save countless patients from harm, yet she was acutely aware that doing so might cost her not only her job but also her professional reputation within an industry where loyalty was highly valued.",
      "After several sleepless nights deliberating over the moral and practical implications, she ultimately decided to report her findings to the relevant regulatory authority, providing documented evidence to substantiate her claims. As she had anticipated, the company's management reacted with considerable hostility, attempting to discredit her professionally and even threatening legal action.",
      "The subsequent investigation, which lasted several gruelling months, eventually vindicated Tahmina entirely, confirming that the falsified records had indeed compromised patient safety. The company faced substantial fines, and several senior executives were dismissed, while Tahmina, despite losing her position, received considerable support from public health advocates who praised her courage.",
      "Years later, having rebuilt her career at a different company with stronger ethical standards, Tahmina remained convinced that, despite the personal cost, prioritising public safety over self-interest had been unquestionably the right decision, even though it had undeniably been the most difficult choice of her professional life."
    ],
    vocab:{
      "falsified":{meaning_bn:"মিথ্যা বানিয়ে দেখানো", pos:"verb"},
      "deliberating":{meaning_bn:"বিবেচনা করা, ভেবে দেখা", pos:"verb"},
      "substantiate":{meaning_bn:"প্রমাণ দিয়ে সমর্থন করা", pos:"verb"},
      "vindicated":{meaning_bn:"নির্দোষ প্রমাণিত করা", pos:"verb"}
    },
    quiz:[
      {q:"What did Tahmina discover at her job?", opts:["A pay discrepancy","Falsified safety test records","A theft","Office politics"], ans:1, exp:"'Certain safety tests had been deliberately falsified to meet aggressive production deadlines'।"},
      {q:"What dilemma did Tahmina face?", opts:["Whether to take a promotion","Whether to report the issue despite personal risk","Whether to quit immediately","Whether to ask for a raise"], ans:1, exp:"'Reporting the issue could... save countless patients... yet... cost her... job'।"},
      {q:"How did the company react to her report?", opts:["They thanked her","They reacted with hostility and threatened legal action","They promoted her","They ignored it completely"], ans:1, exp:"'The company's management reacted with considerable hostility... threatening legal action'।"},
      {q:"What was the outcome of the investigation?", opts:["Tahmina was found guilty","The company was vindicated","Tahmina was vindicated and the company was fined","Nothing happened"], ans:2, exp:"'The investigation... eventually vindicated Tahmina entirely... The company faced substantial fines'।"}
    ]
  },

  { id:"r44", title:"The Reunion", category:"Story", level:"B2", readMinutes:5, xp:100,
    icon:"🤝", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    text:[
      "Twenty-five years had elapsed since Nasreen had last set foot in her childhood village, a place she had deliberately avoided ever since circumstances had compelled her family to relocate abruptly following a bitter property dispute with relatives. When an old school friend extended an invitation to a reunion gathering, she found herself oscillating between curiosity and profound apprehension.",
      "Arriving at the village after such a prolonged absence proved to be a disorienting experience; familiar landmarks had either vanished entirely or transformed beyond recognition, while unfamiliar buildings now occupied spaces she vividly remembered as open fields. Nevertheless, the moment she encountered her childhood friends, decades seemed to dissolve almost instantaneously.",
      "Among the attendees was her estranged cousin, Rafique, with whom the original dispute had originated, and whom she had not spoken to since their families' falling out. Their initial encounter was undeniably awkward, characterised by stilted conversation and carefully measured words, both clearly uncertain how to navigate the weight of accumulated history between them.",
      "As the evening progressed, however, and old memories were shared amid laughter and nostalgia, Rafique unexpectedly approached her privately, offering a sincere apology for his role in the conflict that had fractured their families decades earlier. Nasreen, surprised by her own willingness to forgive, found that the resentment she had nurtured for so long had somehow lost its grip on her.",
      "Departing the village the following morning, Nasreen reflected that reconciliation, though it had taken an entire generation to materialise, had ultimately proven far more liberating than she could have ever anticipated, demonstrating that even the most deeply entrenched grievances can eventually be dissolved by time and genuine willingness."
    ],
    vocab:{
      "oscillating":{meaning_bn:"দোদুল্যমান হওয়া", pos:"verb"},
      "disorienting":{meaning_bn:"বিভ্রান্তিকর", pos:"adjective"},
      "estranged":{meaning_bn:"বিচ্ছিন্ন, সম্পর্কচ্ছিন্ন", pos:"adjective"},
      "reconciliation":{meaning_bn:"পুনর্মিলন, মিটমাট", pos:"noun"}
    },
    quiz:[
      {q:"Why had Nasreen avoided her childhood village?", opts:["She disliked the place","A bitter property dispute with relatives forced relocation","She moved for a job","She was scared of it"], ans:1, exp:"'Circumstances had compelled her family to relocate abruptly following a bitter property dispute'।"},
      {q:"Who was Rafique?", opts:["Nasreen's school teacher","Her estranged cousin involved in the original dispute","A stranger","Her old friend's husband"], ans:1, exp:"'Her estranged cousin, Rafique, with whom the original dispute had originated'।"},
      {q:"What did Rafique do at the reunion?", opts:["He avoided Nasreen","He apologised for his role in the conflict","He argued with her","He ignored everyone"], ans:1, exp:"'Offering a sincere apology for his role in the conflict'।"},
      {q:"What did Nasreen conclude about reconciliation?", opts:["It is impossible","It can be liberating, even after a long time","It always fails","It requires lawyers"], ans:1, exp:"'Reconciliation... had ultimately proven far more liberating than she could have ever anticipated'।"}
    ]
  },

  { id:"r45", title:"The Scholarship", category:"Story", level:"B2", readMinutes:5, xp:100,
    icon:"🎓", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    text:[
      "Growing up in a household where finances were perpetually tight, Sumon had long understood that pursuing higher education would necessitate securing a scholarship, since his family simply could not afford the substantial tuition fees demanded by reputable universities. Consequently, throughout his secondary education, he dedicated himself with extraordinary discipline to his studies, often sacrificing leisure activities that his peers took entirely for granted.",
      "When applications opened for a prestigious, fully-funded scholarship programme abroad, Sumon recognised this as potentially his sole viable pathway towards the future he envisioned. The application process proved gruelling, demanding not only outstanding academic credentials but also compelling essays articulating his aspirations and an arduous series of interviews conducted via video call.",
      "Throughout the months of waiting for a decision, Sumon oscillated between cautious optimism and crushing anxiety, acutely aware that this single opportunity could fundamentally alter the trajectory of his entire life. His family, despite their financial constraints, offered unwavering emotional support, frequently reminding him that his effort alone, regardless of the outcome, already constituted a remarkable achievement.",
      "When the acceptance email finally arrived, Sumon experienced an overwhelming surge of emotion that left him momentarily speechless; years of sacrifice and relentless dedication had culminated in this singular, transformative moment. His mother, upon hearing the news, wept tears of profound joy and relief, recognising that her son's future now held possibilities she herself had never dared imagine.",
      "Reflecting on his journey years later as a successful professional, Sumon frequently emphasises to younger students from similarly disadvantaged backgrounds that circumstances, however challenging, need not determine ultimate outcomes, provided one maintains unwavering perseverance and refuses to surrender to apparent limitations."
    ],
    vocab:{
      "necessitate":{meaning_bn:"আবশ্যক করা", pos:"verb"},
      "gruelling":{meaning_bn:"কষ্টকর, পরিশ্রমী", pos:"adjective"},
      "trajectory":{meaning_bn:"গতিপথ, দিকনির্দেশ", pos:"noun"},
      "perseverance":{meaning_bn:"অধ্যবসায়", pos:"noun"}
    },
    quiz:[
      {q:"Why did Sumon need a scholarship?", opts:["He preferred studying abroad","His family couldn't afford tuition fees","He wanted a change of scenery","He failed local exams"], ans:1, exp:"'His family simply could not afford the substantial tuition fees'।"},
      {q:"What did the application process require?", opts:["Only good grades","Academic credentials, essays, and interviews","Just a recommendation letter","Nothing significant"], ans:1, exp:"'Outstanding academic credentials but also compelling essays... an arduous series of interviews'।"},
      {q:"How did Sumon's family support him during the wait?", opts:["They pressured him constantly","They offered unwavering emotional support","They ignored the situation","They discouraged him"], ans:1, exp:"'His family... offered unwavering emotional support'।"},
      {q:"What message does Sumon give to younger students?", opts:["Give up if it's hard","Circumstances don't have to determine outcomes with perseverance","Scholarships are impossible","Money is everything"], ans:1, exp:"'Circumstances... need not determine ultimate outcomes, provided one maintains unwavering perseverance'।"}
    ]
  },

  { id:"r46", title:"The Silent Treatment", category:"Story", level:"B2", readMinutes:5, xp:100,
    icon:"🤐", color:"rgba(251,146,60,.12)", border:"rgba(251,146,60,.25)",
    text:[
      "Following a heated argument about household responsibilities, Maliha and her husband Kabir found themselves trapped in an uncomfortable period of mutual silence that, much to their own embarrassment, persisted for nearly an entire week. Neither was willing to initiate reconciliation first, each privately convinced that doing so would somehow constitute an admission of fault.",
      "What had originally begun as a relatively trivial disagreement concerning who should handle particular domestic chores had, through stubborn pride and accumulated resentment, escalated into something considerably more consequential, casting a palpable tension over their entire household. Their young daughter, perceptive beyond her years, noticed the unusual atmosphere and began anxiously enquiring why her parents seemed perpetually distant from one another.",
      "It was this innocent observation from their daughter that ultimately compelled both Maliha and Kabir to confront the absurdity of their prolonged standoff. Recognising that their pride was inflicting genuine emotional distress upon their child, who deserved a harmonious home environment, both reluctantly acknowledged that continuing the silent treatment served no constructive purpose whatsoever.",
      "That evening, Kabir tentatively initiated conversation, acknowledging that his initial reaction during their argument had been disproportionately harsh, while Maliha, in turn, admitted that she too had contributed unnecessarily to the conflict's escalation through her own stubbornness. Their subsequent conversation, though initially awkward, gradually evolved into a more substantive discussion about establishing clearer expectations regarding household responsibilities moving forward.",
      "Reflecting afterwards, both realised that their daughter's innocent concern had achieved what neither adult's pride had permitted: a genuine willingness to communicate openly, demonstrating that sometimes the simplest perspectives illuminate truths that adults, entangled in their own egos, struggle considerably to perceive."
    ],
    vocab:{
      "trivial":{meaning_bn:"তুচ্ছ, ছোটখাটো", pos:"adjective"},
      "palpable":{meaning_bn:"স্পষ্টভাবে অনুভবযোগ্য", pos:"adjective"},
      "standoff":{meaning_bn:"অমিলের অবস্থা, স্থবিরতা", pos:"noun"},
      "illuminate":{meaning_bn:"আলোকিত করা, স্পষ্ট করা", pos:"verb"}
    },
    quiz:[
      {q:"What originally caused the argument between Maliha and Kabir?", opts:["Money problems","A disagreement about household chores","An in-law conflict","A work issue"], ans:1, exp:"'A relatively trivial disagreement concerning who should handle particular domestic chores'।"},
      {q:"Who noticed the tense atmosphere at home?", opts:["A neighbour","Their young daughter","Kabir's mother","A friend"], ans:1, exp:"'Their young daughter, perceptive beyond her years, noticed the unusual atmosphere'।"},
      {q:"What made the parents end the silent treatment?", opts:["A counsellor's advice","Their daughter's innocent concern","A deadline","Outside pressure"], ans:1, exp:"'Their daughter's innocent concern had achieved what neither adult's pride had permitted'।"},
      {q:"What did the couple discuss after reconciling?", opts:["Moving house","Clearer expectations about household responsibilities","Having another child","Nothing specific"], ans:1, exp:"'A more substantive discussion about establishing clearer expectations regarding household responsibilities'।"}
    ]
  },

  { id:"r47", title:"The Long Commute", category:"Story", level:"B2", readMinutes:5, xp:100,
    icon:"🚆", color:"rgba(45,212,191,.12)", border:"rgba(45,212,191,.25)",
    text:[
      "For nearly three years, Jamal had endured a punishing daily commute lasting almost three hours each way, travelling from his modest hometown to the capital city where his only viable employment opportunity existed. Initially, the exhausting routine felt entirely manageable, sustained by youthful energy and gratitude for simply having secured stable employment.",
      "Gradually, however, the cumulative toll of such relentless travel began manifesting itself in increasingly tangible ways: chronic exhaustion that no amount of weekend rest seemed capable of alleviating, deteriorating relationships with family members who rarely saw him awake, and a creeping sense that his existence had been reduced to an exhausting cycle of travelling and working with negligible time for anything else.",
      "Matters reached a critical juncture when Jamal collapsed from sheer exhaustion during a particularly demanding week, prompting an unavoidable medical consultation during which his physician explicitly warned him that continuing this unsustainable lifestyle posed serious risks to his long-term health.",
      "Confronted with this stark warning, Jamal began seriously contemplating alternatives, eventually negotiating with his employer to work remotely for a portion of each week, a compromise that would have seemed unthinkable merely months earlier. Although his employer initially expressed reservations, Jamal's consistently strong performance record ultimately persuaded them to grant a trial arrangement.",
      "Within mere weeks of implementing this revised schedule, Jamal noticed substantial improvements in both his physical wellbeing and his relationships with family, ultimately concluding that career advancement, however significant, should never come at the expense of fundamental health and meaningful personal connections."
    ],
    vocab:{
      "cumulative":{meaning_bn:"ক্রমবর্ধমান, পুঞ্জীভূত", pos:"adjective"},
      "alleviating":{meaning_bn:"কমানো, লাঘব করা", pos:"verb"},
      "unsustainable":{meaning_bn:"অস্থায়ী, টিকিয়ে রাখা অসম্ভব", pos:"adjective"},
      "reservations":{meaning_bn:"সংরক্ষিত মতামত, দ্বিধা", pos:"noun"}
    },
    quiz:[
      {q:"How long was Jamal's daily commute each way?", opts:["One hour","Two hours","Nearly three hours","Five hours"], ans:2, exp:"'A punishing daily commute lasting almost three hours each way'।"},
      {q:"What happened that forced Jamal to reconsider his routine?", opts:["He lost his job","He collapsed from exhaustion","He got married","He moved house"], ans:1, exp:"'Jamal collapsed from sheer exhaustion during a particularly demanding week'।"},
      {q:"What did Jamal negotiate with his employer?", opts:["A pay raise","Working remotely part of the week","A new job title","Longer holidays"], ans:1, exp:"'Negotiating with his employer to work remotely for a portion of each week'।"},
      {q:"What conclusion did Jamal reach?", opts:["Work matters more than health","Career success shouldn't come at the cost of health and relationships","Commuting builds character","He should quit entirely"], ans:1, exp:"'Career advancement... should never come at the expense of fundamental health and meaningful personal connections'।"}
    ]
  },

  /* ════════════════════════════════
     NEW B2 — ARTICLE (5 passages)
  ════════════════════════════════ */

  { id:"r48", title:"The Psychology of Procrastination", category:"Article", level:"B2", readMinutes:5, xp:100,
    icon:"⏳", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    text:[
      "Procrastination, the act of delaying or postponing tasks despite knowing that such delay will likely have negative consequences, is a phenomenon that affects nearly everyone at some point, yet remains widely misunderstood. Contrary to popular belief, procrastination is rarely a simple matter of laziness or poor time management.",
      "Psychological research increasingly suggests that procrastination is fundamentally an emotional regulation problem rather than a productivity issue. Individuals often postpone tasks not because they lack the necessary skills or time, but because the task itself triggers negative emotions such as anxiety, self-doubt, or fear of failure, which the brain instinctively seeks to avoid.",
      "This avoidance provides temporary emotional relief, reinforcing the procrastinating behaviour through a psychological mechanism similar to other forms of negative reinforcement. Unfortunately, this short-term relief typically generates greater stress later, as deadlines approach and the abandoned task looms larger in one's awareness.",
      "Interestingly, perfectionism frequently exacerbates procrastination, since individuals who hold unrealistically high standards for their own work may delay starting altogether, fearing that their effort will inevitably fall short of these internalised expectations. Breaking this cycle, researchers suggest, requires addressing the underlying emotional triggers rather than simply implementing stricter scheduling techniques.",
      "Effective strategies, therefore, often involve self-compassion rather than self-criticism, alongside breaking overwhelming tasks into smaller, more psychologically manageable components, thereby reducing the emotional resistance that originally fuelled the avoidance behaviour."
    ],
    vocab:{
      "phenomenon":{meaning_bn:"ঘটনা, বিষয়", pos:"noun"},
      "reinforcing":{meaning_bn:"দৃঢ় করা, আরও শক্তিশালী করা", pos:"verb"},
      "exacerbates":{meaning_bn:"আরও খারাপ করে তোলে", pos:"verb"},
      "self-compassion":{meaning_bn:"নিজের প্রতি সহানুভূতি", pos:"noun"}
    },
    quiz:[
      {q:"What does research suggest procrastination fundamentally is?", opts:["Pure laziness","An emotional regulation problem","A time management skill gap","A genetic trait"], ans:1, exp:"'Procrastination is fundamentally an emotional regulation problem rather than a productivity issue'।"},
      {q:"Why do people often avoid tasks, according to the passage?", opts:["They are too busy","Tasks trigger negative emotions like anxiety and self-doubt","They forget about them","They dislike all work"], ans:1, exp:"'The task itself triggers negative emotions such as anxiety, self-doubt, or fear of failure'।"},
      {q:"How does perfectionism affect procrastination?", opts:["It reduces it","It exacerbates it by fear of falling short of high standards","It has no effect","It eliminates it"], ans:1, exp:"'Perfectionism frequently exacerbates procrastination... fearing that their effort will inevitably fall short'।"},
      {q:"What strategy do researchers suggest for overcoming procrastination?", opts:["Stricter punishment","Self-compassion and breaking tasks into smaller parts","Working longer hours","Ignoring deadlines"], ans:1, exp:"'Self-compassion rather than self-criticism, alongside breaking overwhelming tasks into smaller... components'।"}
    ]
  },

  { id:"r49", title:"The Ethics of Genetic Engineering", category:"Article", level:"B2", readMinutes:5, xp:100,
    icon:"🧬", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    text:[
      "Advances in genetic engineering, particularly techniques such as CRISPR gene editing, have granted scientists unprecedented ability to modify the genetic code of living organisms with remarkable precision. While these technologies hold tremendous promise for eliminating hereditary diseases and improving agricultural yields, they simultaneously raise profound ethical questions that society has yet to fully resolve.",
      "One of the most contentious applications involves the possibility of editing human embryos to eliminate genetic disorders before birth. Proponents argue that preventing devastating, incurable diseases constitutes an unambiguous moral good, potentially sparing countless families from immense suffering.",
      "Critics, however, raise concerns regarding where such interventions might ultimately lead. If editing embryos to prevent disease becomes normalised, some worry this could gradually progress towards selecting for non-medical traits such as height, intelligence, or appearance, effectively creating a form of genetic stratification between those who can afford such enhancements and those who cannot.",
      "Furthermore, the long-term consequences of editing the human germline, meaning changes that would be inherited by future generations, remain largely unknown, since current scientific understanding of complex genetic interactions is still considerably incomplete. Unintended consequences discovered only after such changes have already propagated through subsequent generations could prove irreversible.",
      "Given these considerable uncertainties, many scientists and ethicists advocate for extreme caution, suggesting that robust international regulatory frameworks must be established before such technologies are deployed more widely, ensuring that scientific capability does not outpace society's careful ethical deliberation."
    ],
    vocab:{
      "unprecedented":{meaning_bn:"অভূতপূর্ব", pos:"adjective"},
      "contentious":{meaning_bn:"বিতর্কিত", pos:"adjective"},
      "stratification":{meaning_bn:"স্তরবিন্যাস, বিভাজন", pos:"noun"},
      "germline":{meaning_bn:"বংশগতি ধারা", pos:"noun"}
    },
    quiz:[
      {q:"What technology is mentioned as enabling precise gene editing?", opts:["MRI scanning","CRISPR","X-ray","Ultrasound"], ans:1, exp:"'Techniques such as CRISPR gene editing'।"},
      {q:"What do proponents of embryo editing argue?", opts:["It is always dangerous","Preventing incurable diseases is a moral good","It should be banned","It has no benefits"], ans:1, exp:"'Preventing devastating, incurable diseases constitutes an unambiguous moral good'।"},
      {q:"What concern do critics raise about non-medical trait editing?", opts:["It is too expensive only","It could create genetic stratification between rich and poor","It is impossible technically","It has already happened"], ans:1, exp:"'Effectively creating a form of genetic stratification between those who can afford such enhancements and those who cannot'।"},
      {q:"What do scientists and ethicists advocate for?", opts:["Immediate widespread use","Extreme caution and international regulatory frameworks","Banning all genetic research","Ignoring the ethical questions"], ans:1, exp:"'Many scientists and ethicists advocate for extreme caution, suggesting that robust international regulatory frameworks must be established'।"}
    ]
  },

  { id:"r50", title:"Globalisation and Local Culture", category:"Article", level:"B2", readMinutes:5, xp:100,
    icon:"🌏", color:"rgba(251,146,60,.12)", border:"rgba(251,146,60,.25)",
    text:[
      "Globalisation, the increasing interconnectedness of economies, cultures, and populations across the world, has fundamentally transformed how societies interact, trade, and exchange ideas over the past several decades. While this process has generated undeniable economic benefits, including expanded markets and increased access to goods previously unavailable in many regions, it has also generated considerable debate regarding its impact on local cultural identities.",
      "Critics frequently argue that globalisation promotes a homogenising effect, whereby distinct local traditions, languages, and customs gradually erode under the pervasive influence of dominant global cultures, particularly Western consumerist values disseminated through multinational corporations and digital media.",
      "Evidence supporting this concern includes the observable decline of numerous indigenous languages worldwide, alongside the proliferation of identical multinational chain stores and franchises that increasingly characterise urban landscapes from Dhaka to São Paulo, creating a somewhat uniform global aesthetic that some argue diminishes cultural distinctiveness.",
      "Conversely, proponents contend that globalisation need not necessarily eradicate local culture, and may instead facilitate a more complex process of cultural hybridisation, wherein local communities selectively adopt and adapt global influences while simultaneously preserving and even revitalising traditional practices, sometimes for new global audiences.",
      "This perspective is substantiated by numerous examples wherein traditional crafts, cuisines, and artistic expressions have gained renewed international appreciation precisely because of increased global connectivity, suggesting that the relationship between globalisation and local culture is considerably more nuanced than a simple narrative of cultural destruction would suggest."
    ],
    vocab:{
      "homogenising":{meaning_bn:"একরূপ করে তোলা", pos:"adjective"},
      "disseminated":{meaning_bn:"ছড়িয়ে দেওয়া হয়েছে", pos:"verb"},
      "hybridisation":{meaning_bn:"মিশ্রণ, সংকরায়ন", pos:"noun"},
      "nuanced":{meaning_bn:"সূক্ষ্ম পার্থক্যপূর্ণ", pos:"adjective"}
    },
    quiz:[
      {q:"What concern do critics of globalisation raise?", opts:["It increases poverty","It causes a homogenising effect eroding local traditions","It has no economic effect","It only affects rich countries"], ans:1, exp:"'Globalisation promotes a homogenising effect, whereby distinct local traditions... gradually erode'।"},
      {q:"What evidence is given for cultural homogenisation?", opts:["Rising local languages","Decline of indigenous languages and identical chain stores","More festivals","Less trade"], ans:1, exp:"'The observable decline of numerous indigenous languages... alongside the proliferation of identical multinational chain stores'।"},
      {q:"What do proponents of globalisation argue instead?", opts:["Culture is destroyed completely","It can lead to cultural hybridisation, preserving and adapting traditions","Local culture never changes","Globalisation should be stopped"], ans:1, exp:"'May instead facilitate a more complex process of cultural hybridisation'।"},
      {q:"What conclusion does the passage reach?", opts:["Globalisation always destroys culture","The relationship is more nuanced than a simple destruction narrative","Globalisation has stopped","Local culture is irrelevant now"], ans:1, exp:"'The relationship between globalisation and local culture is considerably more nuanced than a simple narrative of cultural destruction'।"}
    ]
  },

  { id:"r51", title:"The Rise of Remote Work", category:"Article", level:"B2", readMinutes:5, xp:100,
    icon:"🏠", color:"rgba(45,212,191,.12)", border:"rgba(45,212,191,.25)",
    text:[
      "The global shift towards remote work, significantly accelerated by circumstances surrounding the COVID-19 pandemic, has fundamentally reshaped conventional assumptions about where and how productive labour must be performed. What was once considered an unconventional arrangement reserved primarily for freelancers has rapidly evolved into a mainstream practice embraced by major corporations across diverse industries.",
      "Proponents of remote work highlight numerous advantages, including eliminated commuting time, increased flexibility for employees managing family responsibilities, and access to broader talent pools unconstrained by geographic proximity to physical offices. Furthermore, several studies have indicated that, contrary to initial managerial scepticism, productivity levels among remote workers often match or even exceed those observed in traditional office environments.",
      "Nevertheless, this transition has not been without considerable complications. Many organisations report difficulties maintaining cohesive company culture and facilitating the spontaneous collaborative interactions that naturally occur within shared physical spaces. Additionally, numerous employees have reported experiencing feelings of isolation and difficulty establishing clear boundaries between professional and personal life when working from home.",
      "Consequently, many organisations have gravitated towards hybrid models, combining remote flexibility with periodic in-person collaboration, attempting to capture benefits from both arrangements while mitigating their respective drawbacks. This compromise, while imperfect, appears to represent the emerging consensus among forward-thinking organisations navigating this unprecedented transformation.",
      "Looking forward, most workplace analysts anticipate that remote and hybrid arrangements will likely persist as permanent fixtures within the broader employment landscape, fundamentally and irreversibly altering long-held assumptions about the necessity of centralised physical workplaces for maintaining organisational productivity and cohesion."
    ],
    vocab:{
      "unconventional":{meaning_bn:"অপ্রচলিত", pos:"adjective"},
      "scepticism":{meaning_bn:"সন্দেহবাদ", pos:"noun"},
      "cohesive":{meaning_bn:"সুসংহত, একতাবদ্ধ", pos:"adjective"},
      "mitigating":{meaning_bn:"প্রশমিত করা, কমানো", pos:"verb"}
    },
    quiz:[
      {q:"What accelerated the shift to remote work?", opts:["New technology only","The COVID-19 pandemic","Government policy","Employee demand alone"], ans:1, exp:"'Significantly accelerated by circumstances surrounding the COVID-19 pandemic'।"},
      {q:"What did studies find about remote worker productivity?", opts:["It always decreases","It often matches or exceeds office productivity","It cannot be measured","It is irrelevant"], ans:1, exp:"'Productivity levels among remote workers often match or even exceed those observed in traditional office environments'।"},
      {q:"What complication do many organisations report with remote work?", opts:["Higher costs only","Difficulty maintaining company culture and collaboration","Too much productivity","No complications at all"], ans:1, exp:"'Many organisations report difficulties maintaining cohesive company culture and facilitating... collaborative interactions'।"},
      {q:"What model have many organisations adopted as a compromise?", opts:["Fully remote only","Fully in-office only","Hybrid models combining remote and in-person work","No work at all"], ans:2, exp:"'Many organisations have gravitated towards hybrid models, combining remote flexibility with periodic in-person collaboration'।"}
    ]
  },

  { id:"r52", title:"Understanding Inflation", category:"Article", level:"B2", readMinutes:5, xp:100,
    icon:"📈", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    text:[
      "Inflation, defined broadly as the rate at which the general level of prices for goods and services rises within an economy, is a phenomenon that affects virtually every aspect of daily economic life, from grocery shopping to long-term savings decisions. While moderate inflation is generally considered a normal feature of healthy economic growth, excessive or unpredictable inflation can severely undermine economic stability.",
      "Economists typically attribute inflation to several interrelated causes. Demand-pull inflation occurs when consumer demand for goods and services outpaces the economy's capacity to produce them, driving prices upward as a natural consequence of scarcity. Conversely, cost-push inflation arises when production costs, such as raw materials or wages, increase substantially, compelling businesses to raise prices to maintain profitability.",
      "Central banks, recognising inflation's significant influence over economic stability, typically attempt to manage inflation through monetary policy tools, most notably adjusting interest rates. Raising interest rates tends to discourage borrowing and spending, thereby cooling demand and moderating inflationary pressure, although this approach risks simultaneously slowing overall economic growth.",
      "For ordinary citizens, persistently high inflation erodes purchasing power, meaning that a fixed amount of money buys progressively fewer goods over time, disproportionately affecting individuals with fixed incomes, such as pensioners, who cannot easily increase their earnings to compensate for rising costs.",
      "Consequently, governments and central banks worldwide continuously monitor inflation indicators, attempting to strike a delicate balance between fostering sufficient economic growth and preventing the kind of runaway inflation that has historically devastated economies, eroding public confidence and destabilising entire financial systems."
    ],
    vocab:{
      "outpaces":{meaning_bn:"ছাড়িয়ে যায়", pos:"verb"},
      "scarcity":{meaning_bn:"স্বল্পতা, ঘাটতি", pos:"noun"},
      "purchasing power":{meaning_bn:"ক্রয়ক্ষমতা", pos:"noun"},
      "destabilising":{meaning_bn:"অস্থিতিশীল করে তোলা", pos:"verb"}
    },
    quiz:[
      {q:"What is inflation, as defined in the passage?", opts:["A decrease in prices","The rate at which general prices rise","A type of tax","A stock market crash"], ans:1, exp:"'The rate at which the general level of prices for goods and services rises within an economy'।"},
      {q:"What causes demand-pull inflation?", opts:["Falling wages","Consumer demand outpacing production capacity","Lower taxes","Reduced spending"], ans:1, exp:"'Demand-pull inflation occurs when consumer demand... outpaces the economy's capacity to produce them'।"},
      {q:"How do central banks typically try to control inflation?", opts:["Printing more money only","Adjusting interest rates","Banning trade","Ignoring it"], ans:1, exp:"'Typically attempt to manage inflation through monetary policy tools, most notably adjusting interest rates'।"},
      {q:"Who is disproportionately affected by high inflation?", opts:["Wealthy investors","People with fixed incomes, such as pensioners","Central banks","Large corporations only"], ans:1, exp:"'Disproportionately affecting individuals with fixed incomes, such as pensioners'।"}
    ]
  },

  /* ════════════════════════════════
     NEW C1 — STORY (6 passages)
  ════════════════════════════════ */

  { id:"r53", title:"The Diplomat's Dilemma", category:"Story", level:"C1", readMinutes:6, xp:120,
    icon:"🤵", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    text:[
      "As a junior diplomat posted to a politically volatile region, Anwar had grown accustomed to navigating delicate negotiations with practised composure, yet nothing had prepared him for the moral quandary that presented itself one humid afternoon. A confidential intelligence briefing revealed that a forthcoming trade agreement, one his government had laboured for years to secure, would inadvertently bolster a regime notorious for systematic human rights abuses.",
      "Anwar found himself caught in an excruciating bind between professional duty and personal conscience. Reporting his reservations through official channels risked derailing an agreement of considerable strategic and economic importance to his nation, potentially jeopardising his own career trajectory in the process. Remaining silent, conversely, meant complicity, however indirect, in perpetuating a regime's egregious conduct.",
      "Over several sleepless nights, Anwar wrestled with competing loyalties: to his nation's pragmatic interests, to his professional obligations, and to principles of basic human decency he had internalised since childhood. He ultimately drafted a meticulously reasoned memorandum, neither overtly insubordinate nor naively idealistic, outlining the ethical implications without explicitly recommending the agreement's cancellation.",
      "His superiors, to his considerable surprise, neither dismissed nor punished him for raising such uncomfortable considerations; instead, the memorandum prompted a protracted internal review that ultimately resulted in additional human rights conditions being appended to the agreement, considerably softening, though not entirely eliminating, his original ethical concerns.",
      "Reflecting on the episode years later, by then a seasoned ambassador, Anwar would frequently counsel younger diplomats that genuine integrity rarely manifests as dramatic, career-ending gestures, but rather through the painstaking, often unglamorous work of raising uncomfortable truths within systems resistant to acknowledging them."
    ],
    vocab:{
      "volatile":{meaning_bn:"অস্থির, পরিবর্তনশীল", pos:"adjective"},
      "quandary":{meaning_bn:"উভয়সংকট, দ্বিধা", pos:"noun"},
      "complicity":{meaning_bn:"সহযোগিতা (অপরাধে)", pos:"noun"},
      "insubordinate":{meaning_bn:"অবাধ্য, আদেশ অমান্যকারী", pos:"adjective"}
    },
    quiz:[
      {q:"What moral quandary did Anwar face?", opts:["A pay dispute","A trade agreement that would bolster a human-rights-abusing regime","A personal scandal","A diplomatic transfer"], ans:1, exp:"'A forthcoming trade agreement... would inadvertently bolster a regime notorious for systematic human rights abuses'।"},
      {q:"What did Anwar ultimately do?", opts:["Resigned immediately","Stayed completely silent","Drafted a carefully reasoned memorandum outlining ethical implications","Leaked the information publicly"], ans:2, exp:"'He ultimately drafted a meticulously reasoned memorandum... outlining the ethical implications'।"},
      {q:"How did his superiors respond?", opts:["They fired him","They punished him severely","They conducted an internal review and added conditions to the agreement","They ignored it completely"], ans:2, exp:"'The memorandum prompted a protracted internal review that ultimately resulted in additional human rights conditions'।"},
      {q:"What does Anwar later counsel younger diplomats?", opts:["Avoid all controversy","Integrity often means quietly raising uncomfortable truths, not dramatic gestures","Always resign on principle","Ignore ethical concerns for career growth"], ans:1, exp:"'Genuine integrity rarely manifests as dramatic, career-ending gestures, but rather through... raising uncomfortable truths'।"}
    ]
  },

  { id:"r54", title:"The Last Manuscript", category:"Story", level:"C1", readMinutes:6, xp:120,
    icon:"📖", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    text:[
      "Following the death of her grandmother, a once-celebrated novelist whose literary reputation had inexplicably faded into relative obscurity over recent decades, Priya discovered an unpublished manuscript tucked away among her grandmother's belongings, evidently composed during the final months of her life. The discovery presented Priya with an unanticipated and rather weighty responsibility.",
      "Reading through the manuscript, Priya recognised immediately that it represented some of her grandmother's most accomplished work, simultaneously more experimental in structure and more emotionally unguarded than anything previously published under her name. Yet certain passages, drawing transparently upon real family conflicts and unresolved grievances, would inevitably cause considerable distress to surviving relatives were the work ever published.",
      "Priya found herself confronting an agonising ethical calculation: honouring what she perceived as her grandmother's final, deeply personal artistic statement against safeguarding her extended family from painful, decades-old wounds being publicly reopened. Several relatives, upon learning of the manuscript's existence, vehemently insisted it remain permanently unpublished, citing privacy concerns that Priya could not entirely dismiss as unreasonable.",
      "After considerable deliberation, consulting literary scholars and her own conscience in equal measure, Priya arrived at a compromise solution: she would publish a substantially edited version, judiciously removing the most identifiably personal references while preserving the manuscript's artistic integrity and thematic depth as faithfully as such editorial intervention permitted.",
      "The eventual publication, though inevitably imperfect compared to the original unedited manuscript, succeeded in reviving critical and public interest in her grandmother's broader literary legacy, suggesting that sometimes preserving an artist's voice necessitates difficult compromises between unfiltered authenticity and the legitimate, competing claims of those whose lives intersected with the artist's own."
    ],
    vocab:{
      "obscurity":{meaning_bn:"অপ্রসিদ্ধি, অজানার অন্ধকার", pos:"noun"},
      "unguarded":{meaning_bn:"অরক্ষিত, খোলামেলা", pos:"adjective"},
      "vehemently":{meaning_bn:"তীব্রভাবে, প্রবলভাবে", pos:"adverb"},
      "judiciously":{meaning_bn:"বিচক্ষণতার সাথে", pos:"adverb"}
    },
    quiz:[
      {q:"What did Priya discover after her grandmother's death?", opts:["A hidden treasure","An unpublished manuscript","A family secret in a letter","An old diary"], ans:1, exp:"'Priya discovered an unpublished manuscript tucked away among her grandmother's belongings'।"},
      {q:"Why was publishing the manuscript ethically complicated?", opts:["It was poorly written","It contained real family conflicts that could distress relatives","It was too short","It had no value"], ans:1, exp:"'Certain passages, drawing transparently upon real family conflicts... would inevitably cause considerable distress to surviving relatives'।"},
      {q:"What compromise did Priya reach?", opts:["Never publish it","Publish it completely unedited","Publish a substantially edited version removing personal references","Destroy the manuscript"], ans:2, exp:"'She would publish a substantially edited version, judiciously removing the most identifiably personal references'।"},
      {q:"What did the eventual publication achieve?", opts:["Nothing notable","It revived interest in her grandmother's literary legacy","It caused a major scandal","It was a complete failure"], ans:1, exp:"'The eventual publication... succeeded in reviving critical and public interest in her grandmother's broader literary legacy'।"}
    ]
  },

  { id:"r55", title:"The Algorithm's Verdict", category:"Story", level:"C1", readMinutes:6, xp:120,
    icon:"⚖️", color:"rgba(167,139,250,.12)", border:"rgba(167,139,250,.25)",
    text:[
      "Nadia, a data scientist employed by a financial institution, had spent eighteen months developing a sophisticated algorithm intended to streamline loan approval decisions, theoretically eliminating human bias from a process historically plagued by inconsistency and occasional discriminatory practices. The system, once deployed, processed applications with remarkable efficiency, dramatically reducing approval times that had previously frustrated countless applicants.",
      "Several months into the system's operation, however, Nadia noticed a troubling pattern emerging from the aggregated approval data: applicants from certain postal codes, predominantly lower-income neighbourhoods with historically marginalised populations, were being systematically rejected at disproportionately higher rates than equivalent applicants from more affluent areas, despite comparable creditworthiness indicators.",
      "Investigating further, Nadia discovered the unsettling explanation: the algorithm, trained on decades of historical lending data, had inadvertently absorbed and perpetuated patterns of discriminatory lending practices embedded within that very historical data, despite no explicit instruction to consider race or neighbourhood demographics directly. The system had essentially learned to discriminate by proxy, correlating seemingly neutral variables with protected characteristics.",
      "Confronting her employer with these findings proved considerably more fraught than anticipated; executives, having invested substantial resources in the system and touted its supposed objectivity publicly, initially resisted acknowledging the problem, fearing reputational and financial repercussions should the issue become public knowledge.",
      "Ultimately, after Nadia persisted with mounting statistical evidence and threatened to escalate her concerns externally, the institution reluctantly agreed to retrain the algorithm using carefully audited data and implement ongoing bias monitoring, a resolution that, while imperfect and arguably overdue, nevertheless demonstrated that even seemingly neutral technological systems require constant vigilant scrutiny to prevent the perpetuation of historical injustices under a veneer of algorithmic objectivity."
    ],
    vocab:{
      "streamline":{meaning_bn:"সহজ ও সুসংগঠিত করা", pos:"verb"},
      "marginalised":{meaning_bn:"প্রান্তিক, উপেক্ষিত", pos:"adjective"},
      "fraught":{meaning_bn:"জটিল, উদ্বেগপূর্ণ", pos:"adjective"},
      "veneer":{meaning_bn:"বহিরাবরণ, উপরিভাগের চাকচিক্য", pos:"noun"}
    },
    quiz:[
      {q:"What was the algorithm originally intended to do?", opts:["Increase loan interest rates","Eliminate human bias from loan approval decisions","Replace all bank employees","Track customer spending"], ans:1, exp:"'Intended to streamline loan approval decisions, theoretically eliminating human bias'।"},
      {q:"What troubling pattern did Nadia discover?", opts:["All applications were approved","Applicants from marginalised postal codes were rejected disproportionately","The system was too slow","Nothing unusual"], ans:1, exp:"'Applicants from certain postal codes, predominantly lower-income neighbourhoods... were being systematically rejected at disproportionately higher rates'।"},
      {q:"Why did the algorithm discriminate despite no explicit instruction to do so?", opts:["It was hacked","It learned patterns from historically biased lending data","It malfunctioned randomly","It was programmed intentionally to discriminate"], ans:1, exp:"'The algorithm, trained on decades of historical lending data, had inadvertently absorbed and perpetuated patterns of discriminatory lending practices'।"},
      {q:"What did the institution eventually agree to do?", opts:["Shut down the system permanently","Retrain the algorithm with audited data and monitor for bias","Ignore the issue","Fire Nadia"], ans:1, exp:"'The institution reluctantly agreed to retrain the algorithm using carefully audited data and implement ongoing bias monitoring'।"}
    ]
  },

  { id:"r56", title:"An Unlikely Mentor", category:"Story", level:"C1", readMinutes:6, xp:120,
    icon:"🧑‍🏫", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    text:[
      "Rafiq had harboured considerable scepticism when assigned, as part of a mandatory corporate mentorship initiative, to be paired with Mr. Haque, an irascible, soon-to-retire senior executive widely regarded throughout the office as abrasive and notoriously impatient with junior staff. Their initial meetings proceeded with stilted formality, each party seemingly enduring rather than embracing the arrangement.",
      "Gradually, however, beneath Mr. Haque's famously curt demeanour, Rafiq began discerning an unexpected depth of professional wisdom, accumulated across nearly four decades navigating the organisation's often byzantine internal politics. Mr. Haque's blunt feedback, while initially jarring to Rafiq's sensibilities, proved consistently more substantively useful than the carefully diplomatic but vague guidance Rafiq had previously received from more conventionally amiable colleagues.",
      "Their relationship underwent a discernible transformation following an incident wherein Rafiq, having proposed an ambitious but ultimately flawed strategic initiative during a high-stakes meeting, found himself publicly and rather mercilessly critiqued by a senior board member. Mr. Haque, defying his reputation for indifference towards junior staff, unexpectedly intervened, diplomatically reframing Rafiq's underlying idea in a manner that salvaged its legitimate merits while diplomatically acknowledging its evident shortcomings.",
      "Privately afterwards, Mr. Haque offered Rafiq an unusually candid assessment, acknowledging his own youthful professional missteps decades earlier and emphasising that resilience following public failure, rather than avoiding failure altogether, constituted the genuine hallmark of long-term professional development. This conversation marked a turning point in their dynamic, evolving from obligatory formality into something approximating genuine mutual respect.",
      "When Mr. Haque eventually retired several months later, Rafiq found himself unexpectedly moved, having come to recognise that the gruff exterior concealing genuine investment in junior colleagues' development represented, perhaps, a more authentic form of mentorship than the superficially pleasant but substantively hollow guidance he had previously encountered throughout his career."
    ],
    vocab:{
      "irascible":{meaning_bn:"খিটখিটে, রগচটা", pos:"adjective"},
      "byzantine":{meaning_bn:"জটিল, দুর্বোধ্য", pos:"adjective"},
      "salvaged":{meaning_bn:"রক্ষা করা, উদ্ধার করা", pos:"verb"},
      "hallmark":{meaning_bn:"বিশেষ চিহ্ন, লক্ষণ", pos:"noun"}
    },
    quiz:[
      {q:"What was Rafiq's initial reaction to being paired with Mr. Haque?", opts:["Excitement","Considerable scepticism","Indifference","Pride"], ans:1, exp:"'Rafiq had harboured considerable scepticism when assigned... to be paired with Mr. Haque'।"},
      {q:"What did Rafiq begin to discern beneath Mr. Haque's curt demeanour?", opts:["Hidden anger","Unexpected depth of professional wisdom","Complete incompetence","Nothing of value"], ans:1, exp:"'Rafiq began discerning an unexpected depth of professional wisdom'।"},
      {q:"What did Mr. Haque do during the high-stakes meeting incident?", opts:["He stayed silent","He criticised Rafiq further","He intervened and reframed Rafiq's idea constructively","He left the meeting"], ans:2, exp:"'Mr. Haque... unexpectedly intervened, diplomatically reframing Rafiq's underlying idea'।"},
      {q:"What did Mr. Haque emphasise as the hallmark of professional development?", opts:["Avoiding all failure","Resilience following public failure","Always being right","Working alone"], ans:1, exp:"'Resilience following public failure, rather than avoiding failure altogether, constituted the genuine hallmark of long-term professional development'।"}
    ]
  },

  { id:"r57", title:"The Translator's Burden", category:"Story", level:"C1", readMinutes:6, xp:120,
    icon:"🗣️", color:"rgba(251,146,60,.12)", border:"rgba(251,146,60,.25)",
    text:[
      "Working as a court interpreter assigned to asylum hearings, Lubna had grown accustomed to the emotionally taxing nature of her profession, yet nothing had adequately prepared her for the particular case that would ultimately compel her to reconsider the fundamental boundaries of her role. The applicant, a young woman recounting harrowing experiences of persecution, struggled considerably to articulate certain culturally specific concepts that possessed no direct linguistic equivalent in English.",
      "Lubna found herself confronting an excruciating professional dilemma: rendering the testimony with strict literal fidelity risked producing a translation that, while technically accurate, would fail to convey the testimony's genuine emotional weight and cultural context to the adjudicating officer, potentially jeopardising the applicant's case. Conversely, providing more interpretive, contextually elaborated translation risked overstepping the strict neutrality her professional code demanded.",
      "Throughout the hearing, Lubna navigated this tension with painstaking care, occasionally requesting brief pauses to formulate translations that preserved literal accuracy while incorporating minimal explanatory context regarding cultural nuances, always carefully flagging when she was providing clarification beyond direct translation, thereby maintaining transparency about the boundaries of her interpretive choices.",
      "Following the hearing's conclusion, during which the application was ultimately granted, Lubna found herself reflecting extensively on the inherent limitations of her profession: that perfect linguistic neutrality, while theoretically aspirational, often proved practically unattainable when translating not merely words but entire frameworks of meaning embedded within vastly different cultural contexts.",
      "This realisation, rather than diminishing her commitment to professional integrity, instead deepened her appreciation for the considerable interpretive judgment her role inevitably demanded, reinforcing her conviction that conscientious interpreters must continuously navigate the delicate, often underappreciated space between mechanical literalism and meaningful, contextually informed communication."
    ],
    vocab:{
      "harrowing":{meaning_bn:"হৃদয়বিদারক, কষ্টদায়ক", pos:"adjective"},
      "fidelity":{meaning_bn:"নিষ্ঠা, যথার্থতা", pos:"noun"},
      "adjudicating":{meaning_bn:"বিচার করা, রায় দেওয়া", pos:"verb"},
      "aspirational":{meaning_bn:"আকাঙ্ক্ষিত, লক্ষ্যপ্রবণ", pos:"adjective"}
    },
    quiz:[
      {q:"What was Lubna's profession?", opts:["Lawyer","Judge","Court interpreter","Journalist"], ans:2, exp:"'Working as a court interpreter assigned to asylum hearings'।"},
      {q:"What dilemma did Lubna face during the hearing?", opts:["Whether to lie","Balancing literal translation accuracy with conveying cultural/emotional context","Whether to attend the hearing","A pay dispute"], ans:1, exp:"'Rendering the testimony with strict literal fidelity... versus providing more interpretive, contextually elaborated translation'।"},
      {q:"How did Lubna handle the tension during translation?", opts:["She ignored cultural context completely","She paused to formulate careful translations and flagged any added clarification","She refused to continue","She made up details freely"], ans:1, exp:"'Occasionally requesting brief pauses to formulate translations... always carefully flagging when she was providing clarification'।"},
      {q:"What did Lubna conclude about her profession afterwards?", opts:["Perfect neutrality is always achievable","Perfect linguistic neutrality is often practically unattainable","Interpreters should avoid all judgment","Her job is unnecessary"], ans:1, exp:"'Perfect linguistic neutrality, while theoretically aspirational, often proved practically unattainable'।"}
    ]
  },

  { id:"r58", title:"The Whistling Pipes", category:"Story", level:"C1", readMinutes:6, xp:120,
    icon:"🏚️", color:"rgba(45,212,191,.12)", border:"rgba(45,212,191,.25)",
    text:[
      "When Rumana inherited her late grandfather's decades-old textile factory, a once-thriving enterprise that had gradually fallen into financial disrepair under increasingly outdated management practices, she confronted a daunting decision that extended well beyond conventional business calculations. The factory employed nearly two hundred long-serving workers, many of whom had dedicated their entire working lives to the institution, despite its evidently declining profitability.",
      "Financial advisors, examining the factory's books with characteristic dispassion, unanimously recommended liquidation, arguing persuasively that the antiquated machinery and outdated production methods rendered the business fundamentally unviable within an increasingly competitive global textile market dominated by considerably more efficient, technologically sophisticated competitors.",
      "Rumana, however, found herself wrestling with considerations extending beyond pure financial pragmatism. Closing the factory would devastate an entire community substantially dependent upon its continued operation, many workers possessing limited alternative employment prospects given their age, specialised skills, and the region's otherwise stagnant local economy.",
      "After months of painstaking deliberation, consulting industry experts, workers' representatives, and her own conscience, Rumana arrived at an ambitious, financially risky compromise: rather than liquidating outright, she would secure substantial loans to modernise production capabilities while simultaneously retraining the existing workforce, betting considerably on her conviction that institutional loyalty and accumulated expertise, properly leveraged, could yet prove commercially viable.",
      "The subsequent transformation, while undeniably arduous and fraught with considerable financial uncertainty throughout its initial years, eventually yielded a leaner, more competitive enterprise that retained the overwhelming majority of its original workforce, demonstrating that, occasionally, decisions privileging human considerations alongside financial pragmatism can yield outcomes that purely numerical calculations would have dismissed as implausible."
    ],
    vocab:{
      "disrepair":{meaning_bn:"অযত্ন, ক্ষয়প্রাপ্ত অবস্থা", pos:"noun"},
      "liquidation":{meaning_bn:"বিলোপসাধন, ব্যবসা বন্ধ করে দেওয়া", pos:"noun"},
      "antiquated":{meaning_bn:"সেকেলে, পুরাতন", pos:"adjective"},
      "leveraged":{meaning_bn:"কাজে লাগানো, সুবিধা নেওয়া", pos:"verb"}
    },
    quiz:[
      {q:"What did Rumana inherit from her grandfather?", opts:["A house","A textile factory in financial disrepair","A bank","A farm"], ans:1, exp:"'A once-thriving enterprise that had gradually fallen into financial disrepair'।"},
      {q:"What did financial advisors recommend?", opts:["Expansion","Liquidation","Selling to a competitor","Doing nothing"], ans:1, exp:"'Financial advisors... unanimously recommended liquidation'।"},
      {q:"Why did Rumana hesitate to follow this advice?", opts:["She didn't trust the advisors","Closing would devastate a community dependent on the factory","She had no other plans","She wanted more money"], ans:1, exp:"'Closing the factory would devastate an entire community substantially dependent upon its continued operation'।"},
      {q:"What compromise did Rumana choose?", opts:["Immediate closure","Modernising production while retraining the existing workforce","Selling the factory","Ignoring the problem"], ans:1, exp:"'She would secure substantial loans to modernise production capabilities while simultaneously retraining the existing workforce'।"}
    ]
  },

  /* ════════════════════════════════
     NEW C1 — ARTICLE (5 passages)
  ════════════════════════════════ */

  { id:"r59", title:"The Paradox of Choice", category:"Article", level:"C1", readMinutes:6, xp:120,
    icon:"🛍️", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    text:[
      "Conventional economic theory has long presupposed that increased choice invariably enhances consumer welfare, operating on the straightforward premise that more options necessarily afford individuals greater opportunity to satisfy their particular preferences. However, psychological research over recent decades has substantially complicated this seemingly intuitive assumption, revealing what researchers have termed the paradox of choice.",
      "Empirical studies have demonstrated that, beyond a certain threshold, increased choice can paradoxically diminish rather than enhance satisfaction and decision-making capacity. Consumers confronted with excessive options frequently experience heightened decision paralysis, becoming overwhelmed by the cognitive burden of comparing numerous alternatives, sometimes resulting in decision avoidance altogether.",
      "Furthermore, even when consumers successfully navigate extensive choice and arrive at a decision, the subsequent satisfaction with that choice often diminishes compared to scenarios involving more limited options. This phenomenon, researchers suggest, stems partly from heightened opportunity costs associated with extensive choice: the more alternatives foregone, the more acutely individuals subsequently regret potential paths not taken, engaging in counterfactual comparisons that erode satisfaction with their actual selection.",
      "Additionally, excessive choice tends to elevate expectations regarding the ideal outcome, since an abundance of options implicitly suggests that a perfect choice, precisely matching one's preferences, must logically exist somewhere among the available alternatives. This inflated expectation frequently sets consumers up for disappointment, since actual outcomes rarely match such idealised, theoretically optimal possibilities.",
      "These findings carry substantial practical implications across numerous domains, from retail design to public policy, suggesting that thoughtfully curated choice architecture, deliberately limiting options to a manageable, carefully considered selection, may paradoxically serve consumer welfare more effectively than simply maximising the sheer quantity of available alternatives."
    ],
    vocab:{
      "presupposed":{meaning_bn:"পূর্ব থেকে অনুমান করা হয়েছে", pos:"verb"},
      "paralysis":{meaning_bn:"অক্ষমতা, স্থবিরতা", pos:"noun"},
      "counterfactual":{meaning_bn:"বাস্তবতার বিপরীত কল্পনা", pos:"adjective"},
      "curated":{meaning_bn:"সযত্নে নির্বাচিত", pos:"adjective"}
    },
    quiz:[
      {q:"What does conventional economic theory assume about choice?", opts:["More choice always reduces welfare","More choice invariably enhances consumer welfare","Choice has no effect","Choice should be eliminated"], ans:1, exp:"'Conventional economic theory has long presupposed that increased choice invariably enhances consumer welfare'।"},
      {q:"What is the 'paradox of choice'?", opts:["Choice always increases happiness","Beyond a threshold, increased choice can diminish satisfaction and decision-making capacity","People never make decisions","Choice has no psychological effect"], ans:1, exp:"'Beyond a certain threshold, increased choice can paradoxically diminish rather than enhance satisfaction'।"},
      {q:"Why does excessive choice lead to regret?", opts:["People forget their choices","Heightened opportunity costs lead to regret over paths not taken","Choices are always wrong","People dislike all options"], ans:1, exp:"'The more alternatives foregone, the more acutely individuals subsequently regret potential paths not taken'।"},
      {q:"What practical implication does the passage suggest?", opts:["Always maximise the number of choices","Thoughtfully curated, limited choice architecture may serve consumers better","Choice should be random","Consumers should ignore options"], ans:1, exp:"'Thoughtfully curated choice architecture, deliberately limiting options... may paradoxically serve consumer welfare more effectively'।"}
    ]
  },

  { id:"r60", title:"Cognitive Biases in Decision-Making", category:"Article", level:"C1", readMinutes:6, xp:120,
    icon:"🧩", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    text:[
      "Human decision-making, long assumed within classical economic theory to proceed along largely rational lines, has been substantially reconceptualised following decades of research within behavioural economics and cognitive psychology, revealing the pervasive influence of systematic cognitive biases that consistently distort judgment in predictable, non-random directions.",
      "Confirmation bias, perhaps among the most extensively documented of these phenomena, describes the tendency for individuals to selectively seek out, interpret, and recall information that corroborates pre-existing beliefs, while simultaneously disregarding or minimising contradictory evidence. This bias proves particularly consequential within polarised political contexts, wherein individuals consuming identical factual information frequently arrive at diametrically opposed conclusions, each reinforced by selective attention to confirmatory evidence.",
      "Anchoring bias, another well-documented phenomenon, illustrates how initial information disproportionately influences subsequent judgments, even when that initial information bears no logical relevance to the decision at hand. Experimental research has repeatedly demonstrated that arbitrary numerical anchors, even ones participants explicitly recognise as random, measurably influence subsequent numerical estimates across diverse contexts, from price negotiations to judicial sentencing decisions.",
      "Availability heuristic represents yet another consequential bias, whereby individuals overestimate the probability of events that come readily to mind, often due to vivid, recent, or emotionally salient media coverage, rather than accurately assessing actual statistical frequency. This explains, for instance, why individuals frequently overestimate risks associated with dramatic but statistically rare events, such as aeroplane crashes, while underestimating considerably more common but less sensationally reported risks.",
      "Awareness of these systematic biases, while insufficient to eliminate their influence entirely, given their largely unconscious operation, nevertheless provides valuable insight for designing institutional safeguards, decision-making protocols, and educational interventions aimed at mitigating their potentially distorting consequences across consequential domains including medicine, law, and public policy."
    ],
    vocab:{
      "reconceptualised":{meaning_bn:"পুনর্গঠিত ধারণা", pos:"verb"},
      "corroborates":{meaning_bn:"সমর্থন করে, প্রমাণ করে", pos:"verb"},
      "heuristic":{meaning_bn:"সহজ সমাধান পদ্ধতি, অনুমাননির্ভর কৌশল", pos:"noun"},
      "salient":{meaning_bn:"উল্লেখযোগ্য, প্রকটভাবে দৃশ্যমান", pos:"adjective"}
    },
    quiz:[
      {q:"What is confirmation bias?", opts:["Seeking only contradictory evidence","Selectively seeking and recalling information that confirms pre-existing beliefs","Always changing one's mind","Ignoring all evidence"], ans:1, exp:"'The tendency for individuals to selectively seek out, interpret, and recall information that corroborates pre-existing beliefs'।"},
      {q:"What does anchoring bias demonstrate?", opts:["Initial information has no effect on judgment","Initial information disproportionately influences subsequent judgments, even when irrelevant","People always ignore numbers","Bias only affects judges"], ans:1, exp:"'Initial information disproportionately influences subsequent judgments, even when that initial information bears no logical relevance'।"},
      {q:"What does the availability heuristic cause people to do?", opts:["Accurately assess all risks","Overestimate probability of vivid or memorable events, like plane crashes","Underestimate all risks equally","Ignore media coverage entirely"], ans:1, exp:"'Individuals frequently overestimate risks associated with dramatic but statistically rare events, such as aeroplane crashes'।"},
      {q:"What does the passage suggest awareness of biases can help with?", opts:["Eliminating biases completely","Designing institutional safeguards and decision-making protocols to mitigate their effects","Nothing useful","Increasing biases further"], ans:1, exp:"'Provides valuable insight for designing institutional safeguards, decision-making protocols, and educational interventions'।"}
    ]
  },

  { id:"r61", title:"The Decline of Attention", category:"Article", level:"C1", readMinutes:6, xp:120,
    icon:"📵", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    text:[
      "Contemporary discourse surrounding digital technology frequently invokes concerns regarding diminishing attention spans, attributing this perceived decline predominantly to incessant smartphone notifications, algorithmically optimised social media platforms engineered explicitly to maximise user engagement, and the proliferation of bite-sized digital content cultivating expectations of near-instantaneous gratification.",
      "While empirical research into this phenomenon remains methodologically contested, with researchers disputing precise measurement techniques and definitional boundaries of attention itself, considerable evidence nonetheless suggests measurable behavioural shifts correlating with widespread digital technology adoption. Studies tracking media consumption patterns, for instance, document a marked decline in average engagement duration with individual pieces of online content over successive years.",
      "Critics of overly deterministic narratives caution, however, against attributing such shifts exclusively to technology itself, arguing instead that contemporary attention patterns reflect complex interactions between technological affordances and pre-existing psychological tendencies towards novelty-seeking behaviour that predate digital technology entirely. From this perspective, technology companies have simply identified and commercially exploited pre-existing cognitive vulnerabilities rather than fundamentally creating entirely novel psychological phenomena.",
      "Regardless of underlying causal mechanisms, practical consequences appear increasingly evident across numerous domains: educators report mounting difficulties sustaining student engagement during extended instructional periods, employers note declining capacity for prolonged, uninterrupted focus on complex cognitive tasks, and individuals themselves frequently report subjective experiences of diminished capacity for sustained concentration compared to earlier periods in their own lives.",
      "Various interventions, ranging from individual digital minimalism practices to broader institutional and regulatory proposals constraining algorithmic engagement optimisation, have emerged in response, though their long-term efficacy remains empirically uncertain, reflecting the genuinely unprecedented nature of contemporary technology's psychological and societal implications, for which historical precedent offers only limited predictive guidance."
    ],
    vocab:{
      "incessant":{meaning_bn:"অবিরাম, চলমান", pos:"adjective"},
      "gratification":{meaning_bn:"তৃপ্তি, সন্তুষ্টি", pos:"noun"},
      "deterministic":{meaning_bn:"নিয়ন্ত্রণবাদী, পূর্বনির্ধারিত মতবাদ", pos:"adjective"},
      "efficacy":{meaning_bn:"কার্যকারিতা", pos:"noun"}
    },
    quiz:[
      {q:"What is frequently blamed for diminishing attention spans?", opts:["Lack of sleep","Smartphone notifications and engagement-optimised platforms","Better education","Reduced screen time"], ans:1, exp:"'Incessant smartphone notifications, algorithmically optimised social media platforms engineered explicitly to maximise user engagement'।"},
      {q:"What do critics of deterministic narratives argue?", opts:["Technology is entirely to blame","Attention shifts reflect interactions between technology and pre-existing novelty-seeking tendencies","Attention has not changed at all","Only older generations are affected"], ans:1, exp:"'Contemporary attention patterns reflect complex interactions between technological affordances and pre-existing psychological tendencies'।"},
      {q:"What practical consequence do educators report?", opts:["Improved student focus","Difficulties sustaining student engagement during extended periods","No change at all","Students reading more books"], ans:1, exp:"'Educators report mounting difficulties sustaining student engagement during extended instructional periods'।"},
      {q:"What is the status of interventions addressing this issue?", opts:["Proven completely effective","Their long-term efficacy remains empirically uncertain","Already abandoned","Universally successful"], ans:1, exp:"'Their long-term efficacy remains empirically uncertain'।"}
    ]
  },

  { id:"r62", title:"Reassessing Economic Growth", category:"Article", level:"C1", readMinutes:6, xp:120,
    icon:"📊", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    text:[
      "For much of the twentieth century, gross domestic product, commonly abbreviated as GDP, served as the predominant metric through which policymakers and economists assessed national prosperity and societal progress, operating on the implicit assumption that aggregate economic output reliably correlated with overall societal wellbeing.",
      "This assumption, however, has faced increasingly sustained scrutiny from economists and social scientists who contend that GDP, while undeniably useful for measuring certain dimensions of economic activity, systematically fails to capture numerous factors substantially relevant to genuine human flourishing, including income distribution, environmental sustainability, and various dimensions of subjective wellbeing.",
      "Critics highlight, for instance, that GDP growth can occur alongside, or even partly because of, environmentally destructive practices, since GDP calculations conventionally disregard the depletion of natural resources or ecological degradation that may compromise long-term sustainability. Similarly, GDP growth concentrated disproportionately among already affluent populations, while statistically registering as aggregate economic progress, may coincide with stagnant or even deteriorating living standards for substantial portions of the broader population.",
      "In response to these limitations, alternative measurement frameworks have proliferated, including the Genuine Progress Indicator, which explicitly incorporates environmental and social costs into economic calculations, and various subjective wellbeing indices attempting to directly measure self-reported life satisfaction rather than relying exclusively on monetary proxies for human flourishing.",
      "While these alternative metrics have gained increasing academic and, to a lesser extent, policy traction, GDP nonetheless retains considerable institutional inertia as the dominant economic indicator, partly due to measurement consistency advantages and partly due to entrenched institutional and political incentives favouring conventional growth-oriented economic narratives, suggesting that meaningfully displacing GDP's privileged status will likely require sustained, multifaceted advocacy extending considerably beyond purely academic discourse."
    ],
    vocab:{
      "predominant":{meaning_bn:"প্রধান, প্রভাবশালী", pos:"adjective"},
      "depletion":{meaning_bn:"ক্ষয়, অবক্ষয়", pos:"noun"},
      "proliferated":{meaning_bn:"ব্যাপকভাবে বৃদ্ধি পেয়েছে", pos:"verb"},
      "inertia":{meaning_bn:"জড়তা, স্থিতিশীলতা", pos:"noun"}
    },
    quiz:[
      {q:"What has GDP traditionally been used to measure?", opts:["Individual happiness only","National prosperity and societal progress","Environmental health","Political stability"], ans:1, exp:"'GDP... served as the predominant metric through which policymakers... assessed national prosperity and societal progress'।"},
      {q:"What do critics say GDP fails to capture?", opts:["Nothing important","Income distribution, environmental sustainability, and subjective wellbeing","Only inflation","Trade balances"], ans:1, exp:"'Systematically fails to capture numerous factors... including income distribution, environmental sustainability, and various dimensions of subjective wellbeing'।"},
      {q:"What is the Genuine Progress Indicator?", opts:["A stock market index","An alternative metric incorporating environmental and social costs","A type of tax","A government department"], ans:1, exp:"'The Genuine Progress Indicator, which explicitly incorporates environmental and social costs into economic calculations'।"},
      {q:"Why does GDP remain dominant despite criticism?", opts:["It is universally agreed to be perfect","Measurement consistency and entrenched institutional/political incentives","No alternatives exist","It has no critics"], ans:1, exp:"'GDP nonetheless retains considerable institutional inertia... partly due to measurement consistency advantages and... entrenched institutional and political incentives'।"}
    ]
  },

  { id:"r63", title:"The Limits of Free Speech", category:"Article", level:"C1", readMinutes:6, xp:120,
    icon:"🗽", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    text:[
      "The principle of free speech, widely regarded as foundational to liberal democratic societies, rests upon the premise that open discourse, even encompassing views many find objectionable or offensive, ultimately serves society better than restrictive censorship, since unfettered debate theoretically allows truth to emerge through vigorous contestation of competing ideas.",
      "Nevertheless, virtually every democratic society maintains certain constraints upon expressive freedom, reflecting widespread, if sometimes contested, consensus that certain categories of speech, such as direct incitement to imminent violence, demonstrably false statements causing concrete harm, or speech inciting hatred against protected groups, justify legal restriction despite the otherwise robust presumption favouring expressive liberty.",
      "The proliferation of digital communication platforms has substantially complicated longstanding free speech frameworks originally developed primarily with traditional print and broadcast media in mind. Algorithmic content amplification, capable of rapidly disseminating misinformation or extremist content to audiences of unprecedented scale, raises novel questions regarding whether traditional free speech principles, developed within considerably different technological contexts, remain adequately calibrated for contemporary digital realities.",
      "Proponents of more expansive content moderation argue that platforms bear meaningful responsibility for mitigating demonstrable societal harms facilitated through their infrastructure, including coordinated disinformation campaigns and the amplification of extremist ideologies. Critics, conversely, express considerable apprehension that expanded content moderation, however well-intentioned, risks establishing problematic precedents for ideologically motivated censorship, particularly given the considerable subjectivity inherent in distinguishing legitimately harmful content from merely unpopular or controversial viewpoints.",
      "This ongoing tension between safeguarding expressive liberty and mitigating genuine societal harms remains unresolved across most democratic societies, reflecting the genuinely difficult balance between competing values that, rather than admitting straightforward resolution, likely requires continuous, context-sensitive recalibration as technological and societal circumstances continue evolving."
    ],
    vocab:{
      "unfettered":{meaning_bn:"অবাধ, নিয়ন্ত্রণহীন", pos:"adjective"},
      "incitement":{meaning_bn:"উসকানি", pos:"noun"},
      "amplification":{meaning_bn:"প্রসারণ, বিস্তার", pos:"noun"},
      "recalibration":{meaning_bn:"পুনঃসমন্বয়, পুনঃনির্ধারণ", pos:"noun"}
    },
    quiz:[
      {q:"What premise underlies the principle of free speech?", opts:["All speech must be banned","Open discourse ultimately serves society better than censorship","Only government speech matters","Speech has no societal value"], ans:1, exp:"'Open discourse... ultimately serves society better than restrictive censorship'।"},
      {q:"What categories of speech are commonly restricted, according to the passage?", opts:["All political speech","Direct incitement to violence, false harmful statements, and hate speech","Academic speech","Religious speech"], ans:1, exp:"'Direct incitement to imminent violence, demonstrably false statements causing concrete harm, or speech inciting hatred against protected groups'।"},
      {q:"What has complicated traditional free speech frameworks?", opts:["Print media","Algorithmic content amplification on digital platforms","Television broadcasting","Radio"], ans:1, exp:"'Algorithmic content amplification, capable of rapidly disseminating misinformation... raises novel questions'।"},
      {q:"What concern do critics of expanded content moderation raise?", opts:["It costs too much money","It risks establishing precedents for ideologically motivated censorship","It is too slow","It has no risks"], ans:1, exp:"'Expanded content moderation... risks establishing problematic precedents for ideologically motivated censorship'।"}
    ]
  },

];

/* ── Categories list (derived) ── */
export const CATEGORIES = ["All", ...new Set(PASSAGES.map(p => p.category))];

/* ── Level summary ── */
export const LEVEL_COUNT = PASSAGES.reduce((acc, p) => {
  acc[p.level] = (acc[p.level] || 0) + 1;
  return acc;
}, {});
