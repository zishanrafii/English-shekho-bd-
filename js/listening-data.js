/* =====================================================
   ENGLISH SHEKHO — LISTENING CENTER DATA
   Total: 42 lessons | A1→C2 | 5 Categories
   ===================================================== */

export const LESSONS = [

  /* ════════════════════════════════
     CONVERSATION — 12 lessons
  ════════════════════════════════ */

  // A1
  { id:"l1", title:"Daily Greetings & Introductions", category:"Conversation", level:"A1", dur:"3:24", durSec:204, xp:50,
    icon:"👋", color:"rgba(45,212,191,.12)", border:"rgba(45,212,191,.25)",
    transcript:[
      "Hello! My name is Sarah. What's your name?",
      "Hi Sarah! I'm Rahim. Nice to meet you.",
      "Nice to meet you too, Rahim. Where are you from?",
      "I'm from Dhaka, Bangladesh. And you?",
      "I'm from London. Are you a student?",
      "Yes, I'm studying English. It's a beautiful language.",
      "That's wonderful! English opens so many doors in life.",
      "I agree. I want to work in an international company one day.",
      "That's a great goal. Keep practising and you'll get there!",
      "Thank you so much, Sarah. You're very encouraging.",
    ],
    quiz:[
      {q:"Where is Rahim from?", opts:["London","Dhaka","Chittagong","New York"], ans:1, exp:"Rahim বলেছে 'I'm from Dhaka, Bangladesh.'"},
      {q:"Why is Rahim learning English?", opts:["For fun","To travel","To work in an international company","For school"], ans:2, exp:"Rahim বলেছে 'I want to work in an international company.'"},
      {q:"What does Sarah say about English?", opts:["It is difficult","It opens many doors","It is boring","It is not useful"], ans:1, exp:"Sarah বলেছে 'English opens so many doors in life.'"},
    ]
  },

  { id:"l1b", title:"Numbers, Days & Time", category:"Conversation", level:"A1", dur:"3:10", durSec:190, xp:50,
    icon:"🔢", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "Excuse me. What time is it, please?",
      "It's half past three in the afternoon.",
      "Thank you. And what day is it today?",
      "Today is Wednesday the fifth of June.",
      "Oh! My appointment is on Friday the seventh.",
      "That's the day after tomorrow.",
      "Yes, at ten o'clock in the morning.",
      "Don't be late! The office opens at nine thirty.",
      "I'll be there at five to ten. Is that okay?",
      "Perfect. See you on Friday then. Goodbye!",
    ],
    quiz:[
      {q:"What time is it in the conversation?", opts:["3:00","3:30","3:15","4:30"], ans:1, exp:"'It's half past three' মানে ৩:৩০।"},
      {q:"When is the appointment?", opts:["Wednesday","Thursday","Friday","Saturday"], ans:2, exp:"'My appointment is on Friday the seventh.'"},
      {q:"What time does the office open?", opts:["9:00","9:30","10:00","8:30"], ans:1, exp:"'The office opens at nine thirty.'"},
    ]
  },

  { id:"l1c", title:"Colours, Clothes & Shopping", category:"Conversation", level:"A1", dur:"3:40", durSec:220, xp:50,
    icon:"🛍️", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    transcript:[
      "Good morning! Can I help you?",
      "Yes please. I'm looking for a shirt.",
      "Of course. What colour would you like?",
      "I'd like a blue one, please. Or maybe white.",
      "We have this lovely blue shirt here. It's very popular.",
      "How much does it cost?",
      "It's twenty-five pounds.",
      "That's a bit expensive. Do you have anything cheaper?",
      "Yes, this white one is only fifteen pounds.",
      "Perfect! I'll take the white one, please.",
      "Great choice. Would you like a bag?",
      "Yes please. Thank you very much!",
    ],
    quiz:[
      {q:"What is the customer looking for?", opts:["Trousers","A shirt","A jacket","Shoes"], ans:1, exp:"'I'm looking for a shirt.'"},
      {q:"How much is the white shirt?", opts:["£25","£20","£15","£10"], ans:2, exp:"'This white one is only fifteen pounds.'"},
      {q:"Which shirt does the customer buy?", opts:["Blue","White","Red","Green"], ans:1, exp:"'I'll take the white one, please.'"},
    ]
  },

  // A2
  { id:"l2", title:"At the Restaurant", category:"Conversation", level:"A2", dur:"4:10", durSec:250, xp:75,
    icon:"🍽️", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "Good evening! Welcome to The Garden Restaurant.",
      "Good evening. A table for two, please.",
      "Of course. This way, please. Here is your menu.",
      "Thank you. What do you recommend today?",
      "Our chef's special is grilled salmon with vegetables. It's delicious.",
      "That sounds lovely. I'll have that, please.",
      "And for you, sir?",
      "I'd like the pasta carbonara, please.",
      "Excellent choices. Would you like anything to drink?",
      "Two glasses of water and a lemonade, please.",
    ],
    quiz:[
      {q:"What is the chef's special?", opts:["Pasta","Pizza","Grilled salmon","Burger"], ans:2, exp:"Waiter বলেছে 'Our chef's special is grilled salmon with vegetables.'"},
      {q:"What drink was ordered?", opts:["Coffee","Two waters and a lemonade","Tea","Juice"], ans:1, exp:"Customer বলেছে 'Two glasses of water and a lemonade.'"},
    ]
  },

  { id:"l3", title:"Asking for Directions", category:"Conversation", level:"A2", dur:"3:45", durSec:225, xp:75,
    icon:"🗺️", color:"rgba(251,146,60,.12)", border:"rgba(251,146,60,.25)",
    transcript:[
      "Excuse me, could you help me? I'm looking for the train station.",
      "Of course! It's not far from here.",
      "Go straight down this road for about five minutes.",
      "Then turn left at the traffic lights.",
      "The station will be on your right, next to a big supermarket.",
      "That sounds straightforward. About how far is it?",
      "It's about a ten-minute walk from here.",
      "Thank you so much. You've been very helpful.",
      "You're welcome. Have a good journey!",
    ],
    quiz:[
      {q:"Where should you turn?", opts:["Right at the lights","Left at the lights","Straight ahead","Back the way you came"], ans:1, exp:"'Turn left at the traffic lights.'"},
      {q:"How long is the walk?", opts:["5 minutes","10 minutes","15 minutes","20 minutes"], ans:1, exp:"'It's about a ten-minute walk.'"},
    ]
  },

  { id:"l4b", title:"Making a Phone Call", category:"Conversation", level:"A2", dur:"3:55", durSec:235, xp:75,
    icon:"📞", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    transcript:[
      "Hello, this is City Clinic. How can I help you?",
      "Hello. I'd like to make an appointment with Dr Ahmed, please.",
      "Of course. Is this your first visit with us?",
      "No, I'm an existing patient. My name is Karim Hossain.",
      "Let me check the schedule. Are you available on Thursday at 3pm?",
      "Thursday at 3pm works perfectly for me.",
      "Wonderful. Can I confirm your phone number?",
      "Yes, it's zero one seven, double four, three eight nine.",
      "Thank you, Mr Hossain. We'll see you on Thursday.",
      "Great. Thank you very much. Goodbye.",
    ],
    quiz:[
      {q:"Why is Karim calling?", opts:["To cancel an appointment","To make an appointment","To ask for directions","To speak to a nurse"], ans:1, exp:"'I'd like to make an appointment with Dr Ahmed.'"},
      {q:"When is the appointment?", opts:["Wednesday 3pm","Thursday 3pm","Friday 3pm","Thursday 5pm"], ans:1, exp:"'Are you available on Thursday at 3pm?'"},
    ]
  },

  { id:"l2b", title:"At the Doctor's", category:"Conversation", level:"A2", dur:"4:00", durSec:240, xp:75,
    icon:"🏥", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    transcript:[
      "Good morning. Please come in and have a seat.",
      "Good morning, Doctor. I haven't been feeling well for a few days.",
      "I'm sorry to hear that. What seems to be the problem?",
      "I have a sore throat and a headache. I also feel very tired.",
      "How long have you had these symptoms?",
      "Since Monday. That's about four days now.",
      "Let me take your temperature. Yes, you have a slight fever.",
      "Is it serious?",
      "No, it sounds like a common cold. I'll prescribe some medicine.",
      "Should I rest at home?",
      "Yes, rest for two or three days and drink plenty of water.",
      "Thank you, Doctor. I hope I feel better soon.",
    ],
    quiz:[
      {q:"What are the patient's symptoms?", opts:["Headache only","Sore throat and headache","Stomach pain","Broken leg"], ans:1, exp:"'I have a sore throat and a headache. I also feel very tired.'"},
      {q:"How long has the patient been unwell?", opts:["Two days","Three days","Four days","A week"], ans:2, exp:"'Since Monday. That's about four days now.'"},
      {q:"What does the doctor recommend?", opts:["Surgery","Rest and water","Exercise","A hospital stay"], ans:1, exp:"'Rest for two or three days and drink plenty of water.'"},
    ]
  },

  // B1
  { id:"l4c", title:"Job Interview", category:"Conversation", level:"B1", dur:"5:30", durSec:330, xp:100,
    icon:"💼", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    transcript:[
      "Good morning. Please take a seat. Thank you for coming in today.",
      "Good morning. Thank you for having me. I'm really excited about this opportunity.",
      "Let's start. Can you tell me a little about yourself?",
      "Of course. I graduated in Computer Science two years ago.",
      "Since then, I've been working as a junior developer at a software firm.",
      "I've gained strong experience in web development and team collaboration.",
      "That's impressive. Why do you want to work for our company specifically?",
      "I've followed your work for a long time. Your products solve real problems.",
      "I believe my skills would contribute meaningfully to your team.",
      "What would you say is your greatest strength?",
      "I'd say my ability to learn quickly and adapt to new challenges.",
      "Excellent. We'll be in touch within the next few days. Thank you.",
    ],
    quiz:[
      {q:"How long has the candidate been working?", opts:["One year","Two years","Three years","Just graduated"], ans:1, exp:"Two years since graduation."},
      {q:"What is the candidate's greatest strength?", opts:["Leadership","Technical skills","Learning quickly and adapting","Communication"], ans:2, exp:"'My ability to learn quickly and adapt to new challenges.'"},
      {q:"When will the company respond?", opts:["Today","Tomorrow","Within a few days","Next week"], ans:2, exp:"'We'll be in touch within the next few days.'"},
    ]
  },

  { id:"l3b", title:"Planning a Holiday", category:"Conversation", level:"B1", dur:"5:00", durSec:300, xp:100,
    icon:"✈️", color:"rgba(96,165,250,.12)", border:"rgba(96,165,250,.25)",
    transcript:[
      "I've been thinking about where to go on holiday this year.",
      "Really? Any ideas? I'd love to go somewhere warm.",
      "I was thinking about Turkey or maybe Thailand.",
      "Thailand sounds amazing. I've always wanted to go there.",
      "It's not too expensive if you book early. Flights are around four hundred pounds.",
      "That's reasonable. How long would we go for?",
      "Two weeks would be perfect. We could visit Bangkok and the islands.",
      "What about accommodation? Hotels can be pricey.",
      "We could mix it up — a few nights in a hotel, then a guesthouse.",
      "That's a great idea. When are you thinking of going?",
      "Probably October. The weather is lovely and it's less crowded.",
      "Perfect. Let's start looking at flights this weekend!",
    ],
    quiz:[
      {q:"Which destination do they decide on?", opts:["Turkey","Thailand","Spain","Japan"], ans:1, exp:"'Thailand sounds amazing. I've always wanted to go there.'"},
      {q:"How much are the flights approximately?", opts:["£200","£300","£400","£500"], ans:2, exp:"'Flights are around four hundred pounds.'"},
      {q:"When do they plan to go?", opts:["July","August","September","October"], ans:3, exp:"'Probably October. The weather is lovely and it's less crowded.'"},
    ]
  },

  // B2
  { id:"l4d", title:"Discussing a Problem at Work", category:"Conversation", level:"B2", dur:"5:50", durSec:350, xp:125,
    icon:"🤝", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    transcript:[
      "I need to raise something that's been on my mind for a while.",
      "Of course. Please go ahead. This is a safe space to talk.",
      "I feel that my contributions aren't being acknowledged in team meetings.",
      "I understand how that must feel. Can you give me a specific example?",
      "Last Tuesday, I proposed the new workflow system, but it was attributed to someone else.",
      "I wasn't aware of that. That certainly shouldn't have happened.",
      "I'd appreciate it if credit were given where it's due in future.",
      "Absolutely. I'll ensure that recognition is handled more carefully going forward.",
      "I also think a more structured meeting format might help everyone contribute fairly.",
      "That's a constructive suggestion. Let's pilot that in our next meeting.",
      "Thank you for listening. I feel much better having raised this.",
      "Thank you for bringing it to my attention. Open communication is essential.",
    ],
    quiz:[
      {q:"What is the main problem being raised?", opts:["Being underpaid","Contributions not being acknowledged","Too much workload","Poor communication"], ans:1, exp:"'I feel that my contributions aren't being acknowledged.'"},
      {q:"What solution does the employee suggest?", opts:["More pay","A new office","A structured meeting format","Fewer meetings"], ans:2, exp:"'A more structured meeting format might help everyone contribute fairly.'"},
    ]
  },

  // C1
  { id:"l4e", title:"Negotiating a Contract", category:"Conversation", level:"C1", dur:"6:30", durSec:390, xp:150,
    icon:"📋", color:"rgba(167,139,250,.12)", border:"rgba(167,139,250,.25)",
    transcript:[
      "Thank you for coming in. I understand you've reviewed our proposal.",
      "Yes, and while we find the terms largely acceptable, there are a few sticking points.",
      "Of course. We're open to discussion. What are your main concerns?",
      "Primarily the payment schedule. Forty percent upfront is more than we typically commit to.",
      "We understand your position. Could you comfortably manage thirty percent?",
      "That would be more workable. We'd also need to revisit the penalty clause.",
      "The penalty clause is fairly standard in our contracts. What specifically concerns you?",
      "The timeline for resolving disputes seems unreasonably short — just fourteen days.",
      "We could extend that to twenty-one days. Would that address your concern?",
      "That would be acceptable. I think we're close to an agreement.",
      "Excellent. I'll have our legal team draft the revised terms by Friday.",
      "We look forward to a productive partnership. Thank you for your flexibility.",
    ],
    quiz:[
      {q:"What is one of the main concerns raised?", opts:["The office location","The payment schedule","The number of employees","The product quality"], ans:1, exp:"'Forty percent upfront is more than we typically commit to.'"},
      {q:"How many days is the revised dispute timeline?", opts:["14 days","21 days","28 days","30 days"], ans:1, exp:"'We could extend that to twenty-one days.'"},
      {q:"When will the revised terms be ready?", opts:["Monday","Wednesday","Friday","Next week"], ans:2, exp:"'I'll have our legal team draft the revised terms by Friday.'"},
    ]
  },

  // C2
  { id:"l4f", title:"A Philosophical Debate", category:"Conversation", level:"C2", dur:"7:30", durSec:450, xp:175,
    icon:"🧠", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "Do you think free will actually exists, or is it simply an illusion?",
      "That's one of the most contested questions in philosophy.",
      "I lean towards compatibilism — the view that free will and determinism can coexist.",
      "Interesting. But if every action is the result of prior causes, in what sense are we truly free?",
      "Freedom, in the compatibilist sense, means acting according to one's own desires and reasons.",
      "But those desires themselves are shaped by factors entirely outside our control.",
      "Agreed. Yet the experience of deliberation feels genuinely meaningful.",
      "Perhaps. But neuroscience suggests decisions are made before we're consciously aware of them.",
      "That research is fascinating but not conclusive. Consciousness may play a role we don't yet understand.",
      "So you'd argue that the question remains open?",
      "Absolutely. Philosophy thrives in the space between certainty and doubt.",
      "A fitting place to leave it. The uncertainty itself seems profoundly human.",
    ],
    quiz:[
      {q:"What philosophical position does the first speaker lean towards?", opts:["Hard determinism","Libertarianism","Compatibilism","Nihilism"], ans:2, exp:"'I lean towards compatibilism — the view that free will and determinism can coexist.'"},
      {q:"What does neuroscience suggest about decisions?", opts:["We are always free","Decisions are made after conscious awareness","Decisions are made before conscious awareness","The brain has no role"], ans:2, exp:"'Neuroscience suggests decisions are made before we're consciously aware of them.'"},
    ]
  },


  /* ════════════════════════════════
     STORY — 10 lessons
  ════════════════════════════════ */

  // A1
  { id:"l5", title:"The Clever Fox", category:"Story", level:"A1", dur:"5:20", durSec:320, xp:75,
    icon:"🦊", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    transcript:[
      "Once upon a time, in a deep green forest, there lived a very clever fox.",
      "The fox was known throughout the forest for his quick thinking.",
      "One hot summer day, the fox was very thirsty.",
      "He searched and searched for water but could not find any.",
      "Finally, he discovered a deep well at the edge of the forest.",
      "He jumped inside and drank until he was no longer thirsty.",
      "But then he realised he could not climb out — the walls were too smooth.",
      "Just then, a goat came by and looked into the well.",
      "Is the water good? asked the goat.",
      "It's the most delicious water in the world! said the fox.",
      "The goat jumped in eagerly. The fox climbed on the goat's back and jumped out.",
      "Always look before you leap! laughed the fox as he ran away.",
    ],
    quiz:[
      {q:"Why did the fox jump into the well?", opts:["To hide","He was thirsty","To swim","He fell in"], ans:1, exp:"সে খুব পিপাসার্ত ছিল।"},
      {q:"How did the fox escape?", opts:["He climbed the walls","A rope was lowered","He climbed on the goat's back","He waited for help"], ans:2, exp:"'The fox climbed on the goat's back and jumped out.'"},
      {q:"What is the moral?", opts:["Be kind to animals","Always look before you leap","Never trust a fox","Water is precious"], ans:1, exp:"'Always look before you leap!'"},
    ]
  },

  { id:"l5b", title:"The Ant and the Grasshopper", category:"Story", level:"A1", dur:"4:30", durSec:270, xp:75,
    icon:"🐜", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    transcript:[
      "One bright summer day, a grasshopper was singing and dancing in the field.",
      "He saw a line of ants walking past, carrying heavy grains of food.",
      "Why are you working so hard? asked the grasshopper. Come and play with me!",
      "We are storing food for winter, said the leader ant. You should do the same.",
      "Winter is far away! laughed the grasshopper. There is plenty of time.",
      "The ants said nothing and continued working hard every day.",
      "When winter came, the field was covered in thick white snow.",
      "The grasshopper had nothing to eat. He was cold and very hungry.",
      "He went to the ants and asked, Please share your food with me.",
      "We warned you in summer, said the ant. We worked hard. You played.",
      "The grasshopper understood his mistake. It was too late to change the past.",
      "The moral: prepare today for the challenges of tomorrow.",
    ],
    quiz:[
      {q:"What were the ants doing in summer?", opts:["Playing","Sleeping","Storing food","Swimming"], ans:2, exp:"'We are storing food for winter.'"},
      {q:"What happened to the grasshopper in winter?", opts:["He was happy","He found food","He was cold and hungry","He helped the ants"], ans:2, exp:"'The grasshopper had nothing to eat. He was cold and very hungry.'"},
      {q:"What is the moral of the story?", opts:["Play every day","Prepare today for tomorrow","Never help others","Winter is fun"], ans:1, exp:"'Prepare today for the challenges of tomorrow.'"},
    ]
  },

  // A2
  { id:"l6b", title:"The Last Letter", category:"Story", level:"A2", dur:"5:00", durSec:300, xp:75,
    icon:"✉️", color:"rgba(96,165,250,.12)", border:"rgba(96,165,250,.25)",
    transcript:[
      "Emma found an old letter in her grandmother's wooden box.",
      "It was written in neat handwriting on yellowed paper.",
      "My dearest Emma, it began, by the time you read this, I will be gone.",
      "But I want you to know how proud I am of the person you have become.",
      "You have your mother's kindness and your grandfather's courage.",
      "Never stop asking questions, and never stop being curious.",
      "The world is full of wonder if you look at it with open eyes.",
      "Emma read the letter three times, her tears falling softly.",
      "She placed it carefully back in the box and held it close.",
      "Some words, she thought, can last forever.",
    ],
    quiz:[
      {q:"Where did Emma find the letter?", opts:["In a drawer","In her grandmother's wooden box","At the post office","Under her bed"], ans:1, exp:"'Emma found an old letter in her grandmother's wooden box.'"},
      {q:"What advice does the letter give?", opts:["Work hard","Travel the world","Never stop being curious","Save money"], ans:2, exp:"'Never stop asking questions, and never stop being curious.'"},
    ]
  },

  { id:"l5c", title:"The Lighthouse Keeper", category:"Story", level:"A2", dur:"5:30", durSec:330, xp:75,
    icon:"🏮", color:"rgba(251,146,60,.12)", border:"rgba(251,146,60,.25)",
    transcript:[
      "Old Thomas had been the lighthouse keeper for forty years.",
      "Every night, without fail, he lit the great lamp at sunset.",
      "One stormy November evening, the power failed just after dark.",
      "Thomas knew that ships were out there in the dangerous sea.",
      "Without the light, they would crash on the rocks below.",
      "He climbed to the top of the tower with a small hand lantern.",
      "The wind was so strong it nearly knocked him off his feet.",
      "But Thomas held on and held his lantern high all through the night.",
      "In the morning, three ships were safely anchored in the bay.",
      "The captains came ashore and found the old man asleep at the top of the tower.",
      "None of them knew his name, but all of them owed him their lives.",
      "Sometimes the greatest heroes are the ones no one ever hears about.",
    ],
    quiz:[
      {q:"Why did Thomas carry a hand lantern to the top?", opts:["To read","Because the power failed","For decoration","To signal ships to stop"], ans:1, exp:"'The power failed just after dark.'"},
      {q:"How many ships were saved?", opts:["One","Two","Three","Four"], ans:2, exp:"'Three ships were safely anchored in the bay.'"},
      {q:"What is the message of the story?", opts:["Lighthouses are important","The greatest heroes are often unrecognised","Never go to sea","Old men are brave"], ans:1, exp:"'Sometimes the greatest heroes are the ones no one ever hears about.'"},
    ]
  },

  // B1
  { id:"l6", title:"The Gift of Time", category:"Story", level:"B1", dur:"6:30", durSec:390, xp:100,
    icon:"⏰", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    transcript:[
      "There was once a young man named Daniel who was always busy.",
      "He worked long hours and rarely spent time with his family.",
      "His father was an old man who loved to sit by the garden.",
      "Every evening, his father would call, Daniel, come sit with me.",
      "But Daniel always replied, Not now, Father. I'm too busy.",
      "One autumn morning, Daniel's father fell very ill.",
      "As Daniel sat beside his hospital bed, his father whispered,",
      "Son, all the money in the world cannot buy back lost time.",
      "Daniel's eyes filled with tears. He finally understood.",
      "Time is the most precious gift we can give to those we love.",
      "From that day forward, Daniel made sure to be present for his family.",
    ],
    quiz:[
      {q:"What did Daniel's father love to do?", opts:["Read books","Sit by the garden","Cook food","Travel"], ans:1, exp:"'His father was an old man who loved to sit by the garden.'"},
      {q:"What is the main message?", opts:["Work hard always","Money is important","Time is the most precious gift","Travel while young"], ans:2, exp:"'Time is the most precious gift we can give.'"},
    ]
  },

  { id:"l6e", title:"The Bridge Builder", category:"Story", level:"B1", dur:"6:00", durSec:360, xp:100,
    icon:"🌉", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "An old man, travelling alone, came to the edge of a wide river at dusk.",
      "The current was strong and cold, but he crossed safely to the other side.",
      "As he reached dry land, he began to build a bridge across the river.",
      "A traveller passing by said, Old man, why do you build this bridge?",
      "You have already crossed the river. You will never use it again.",
      "The old man smiled and continued working.",
      "True, he said. But behind me on the trail, there is a young man who must cross this river.",
      "To him, this current is swift and cold and dark.",
      "The bridge I build today he will cross tomorrow.",
      "The traveller understood and silently joined in the work.",
      "By nightfall, the bridge was complete.",
      "Building for others what we no longer need for ourselves — that is wisdom.",
    ],
    quiz:[
      {q:"Why does the old man build the bridge?", opts:["To impress others","For a young man who must cross later","To earn money","Because he is bored"], ans:1, exp:"'There is a young man who must cross this river.'"},
      {q:"What does the traveller do after understanding?", opts:["Leaves","Watches","Joins in the work","Criticises"], ans:2, exp:"'The traveller understood and silently joined in the work.'"},
    ]
  },

  // B2
  { id:"l6c", title:"The Scientist's Dream", category:"Story", level:"B2", dur:"7:00", durSec:420, xp:125,
    icon:"🔬", color:"rgba(167,139,250,.12)", border:"rgba(167,139,250,.25)",
    transcript:[
      "Dr Maya had dedicated thirty years of her life to finding a cure.",
      "Her colleagues had given up, but Maya refused to abandon her research.",
      "She believed that somewhere in the data lay the answer.",
      "One sleepless night, she noticed an anomaly in her results.",
      "A protein she had dismissed years ago was behaving unexpectedly.",
      "With trembling hands, she ran the test again. And again.",
      "Each time, the results were the same. She had found something remarkable.",
      "The discovery was not just a cure — it was a new understanding of life itself.",
      "Maya sat quietly for a long time, overcome with a profound sense of responsibility.",
      "She picked up the phone and called her team. It was 3am, but no one minded.",
      "Sometimes, she later wrote, the greatest breakthroughs come to those who simply refuse to stop.",
    ],
    quiz:[
      {q:"What had Maya been searching for?", opts:["A new planet","A cure","A scientific theory","Funding"], ans:1, exp:"'Dr Maya had dedicated thirty years of her life to finding a cure.'"},
      {q:"What did she notice that led to the discovery?", opts:["A new chemical","An anomaly in her results","A colleague's mistake","A research paper"], ans:1, exp:"'She noticed an anomaly in her results.'"},
      {q:"What time did she call her team?", opts:["Midnight","1am","3am","Dawn"], ans:2, exp:"'She picked up the phone and called her team. It was 3am.'"},
    ]
  },

  // C1
  { id:"l6d", title:"The Mountain Between Us", category:"Story", level:"C1", dur:"8:00", durSec:480, xp:150,
    icon:"🏔️", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "There are certain truths that only solitude can teach you.",
      "I learned mine at four thousand metres above sea level, alone, in a blizzard.",
      "The expedition had gone wrong on the second day, when Torres twisted his ankle.",
      "We had a choice — turn back, or press on with our diminishing supplies.",
      "Against my better judgement, I chose to continue alone.",
      "The mountain does not care about your ambition or your timeline.",
      "It exists on its own terms, indifferent to human desire.",
      "As night fell, the temperature plummeted to minus twenty.",
      "I built a snow shelter and listened to the wind scream outside.",
      "In that stillness, stripped of every comfort, I understood something fundamental.",
      "We do not conquer nature. We are merely permitted to pass through it.",
      "I descended the next morning, humbled, but profoundly changed.",
    ],
    quiz:[
      {q:"Why did the expedition go wrong?", opts:["Bad weather","Torres twisted his ankle","They ran out of food","They got lost"], ans:1, exp:"'The expedition had gone wrong when Torres twisted his ankle.'"},
      {q:"What did the narrator learn?", opts:["Mountains are dangerous","We conquer nature","We are merely permitted to pass through nature","Solo climbing is impossible"], ans:2, exp:"'We do not conquer nature. We are merely permitted to pass through it.'"},
    ]
  },

  // C2
  { id:"l6f", title:"The Weight of Words", category:"Story", level:"C2", dur:"8:30", durSec:510, xp:175,
    icon:"📝", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    transcript:[
      "The writer had spent thirty years in pursuit of the perfect sentence.",
      "Not a sentence that dazzled or impressed, but one that simply told the truth.",
      "He had published eleven novels, each celebrated, each secretly inadequate to him.",
      "The twelfth sat unfinished on his desk, its opening line rewritten four hundred times.",
      "His editor called. The deadline is tomorrow, she said. What have you got?",
      "The truth, he said. Almost.",
      "Language, he had come to believe, is always a translation of something wordless.",
      "We reach for it with nouns and verbs, but the original thought retreats.",
      "That night, he wrote a single paragraph and stopped.",
      "It was not perfect. But it was honest.",
      "He sent it the next morning with a note: This is as close as I can get.",
      "Sometimes, the most courageous thing a writer can do is admit the gap between intention and expression.",
      "His editor wrote back: This is the best thing you have ever written.",
    ],
    quiz:[
      {q:"What had the writer been searching for?", opts:["Fame","A perfect dazzling sentence","A sentence that simply told the truth","A publisher"], ans:2, exp:"'Not a sentence that dazzled or impressed, but one that simply told the truth.'"},
      {q:"How many times had he rewritten the opening line?", opts:["100","200","400","1000"], ans:2, exp:"'Its opening line rewritten four hundred times.'"},
      {q:"What does the writer send his editor?", opts:["A full novel","Nothing","A single paragraph","An apology"], ans:2, exp:"'He wrote a single paragraph and stopped. He sent it the next morning.'"},
    ]
  },


  /* ════════════════════════════════
     AUDIO LESSON — 12 lessons
  ════════════════════════════════ */

  // A1
  { id:"l7b", title:"Articles — A, An and The", category:"Audio Lesson", level:"A1", dur:"6:00", durSec:360, xp:50,
    icon:"📖", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "Today we are going to learn about articles in English.",
      "There are three articles: a, an, and the.",
      "We use a before words that begin with a consonant sound.",
      "For example: a book, a cat, a university.",
      "We use an before words that begin with a vowel sound.",
      "For example: an apple, an orange, an honest man.",
      "Notice that honest starts with a vowel sound, even though it is spelled with H.",
      "We use the when we are talking about something specific.",
      "For example: Please close the door — we both know which door.",
      "We also use the with rivers, oceans, and mountain ranges.",
      "The Nile, the Pacific Ocean, the Himalayas.",
      "Remember: use the when both speaker and listener know what is being referred to.",
    ],
    quiz:[
      {q:"Which is correct?", opts:["a apple","an apple","the apple always","a honest man"], ans:1, exp:"'an apple' — apple starts with a vowel sound."},
      {q:"When do we use 'the'?", opts:["Before all nouns","When something is specific and known","Before vowel sounds","Never with proper nouns"], ans:1, exp:"'We use the when we are talking about something specific.'"},
    ]
  },

  { id:"l7f", title:"Simple Present vs Present Continuous", category:"Audio Lesson", level:"A1", dur:"6:30", durSec:390, xp:50,
    icon:"🔄", color:"rgba(45,212,191,.12)", border:"rgba(45,212,191,.25)",
    transcript:[
      "Today's lesson is about two very important tenses.",
      "The Simple Present and the Present Continuous.",
      "We use the Simple Present for habits and routines.",
      "For example: I eat breakfast at seven o'clock every morning.",
      "We use the Present Continuous for things happening right now.",
      "For example: I am eating breakfast right now.",
      "Notice the difference. Every morning is a routine. Right now is happening.",
      "The Simple Present uses the base form of the verb.",
      "She reads books. He plays football. They study English.",
      "The Present Continuous uses am, is, or are plus the verb ending in ing.",
      "She is reading a book. He is playing football. They are studying English.",
      "Remember: some verbs don't usually go in continuous form — like know, love, and want.",
    ],
    quiz:[
      {q:"Which sentence uses Simple Present correctly?", opts:["She is eating every day","She eats every day","She was eating every day","She eat every day"], ans:1, exp:"Simple Present: subject + base verb. 'She eats every day.'"},
      {q:"Which verbs don't usually go in continuous form?", opts:["Run, jump, swim","Know, love, want","Eat, drink, sleep","Walk, talk, sing"], ans:1, exp:"'Some verbs don't usually go in continuous form — like know, love, and want.'"},
    ]
  },

  // A2
  { id:"l7g", title:"Past Simple — Regular & Irregular", category:"Audio Lesson", level:"A2", dur:"7:00", durSec:420, xp:75,
    icon:"⏪", color:"rgba(251,146,60,.12)", border:"rgba(251,146,60,.25)",
    transcript:[
      "Today we're learning about the Past Simple tense.",
      "We use the Past Simple for actions that happened and finished in the past.",
      "For regular verbs, we add ed to make the past form.",
      "Walk becomes walked. Talk becomes talked. Play becomes played.",
      "But many common verbs in English are irregular.",
      "They don't follow the ed rule. You have to learn them separately.",
      "Go becomes went. See becomes saw. Eat becomes ate. Buy becomes bought.",
      "For negatives, we use did not, or didn't, plus the base verb.",
      "I didn't go to school yesterday. She didn't eat lunch.",
      "For questions, we use did plus the subject plus the base verb.",
      "Did you go to the market? Did she call you?",
      "Notice — in negatives and questions, the verb goes back to base form.",
    ],
    quiz:[
      {q:"How do you make the past of regular verbs?", opts:["Add s","Add ing","Add ed","Add will"], ans:2, exp:"'For regular verbs, we add ed to make the past form.'"},
      {q:"Which is the correct past of 'go'?", opts:["Goed","Went","Goes","Going"], ans:1, exp:"'Go becomes went' — irregular verb।"},
      {q:"Which negative sentence is correct?", opts:["I not go","I didn't went","I didn't go","I don't went"], ans:2, exp:"Negative: didn't + base verb. 'I didn't go.'"},
    ]
  },

  // B1
  { id:"l7", title:"Present Perfect Tense", category:"Audio Lesson", level:"B1", dur:"7:15", durSec:435, xp:100,
    icon:"📻", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    transcript:[
      "Welcome to today's audio lesson on the Present Perfect Tense.",
      "The Present Perfect is formed with have or has plus the past participle.",
      "For example: I have eaten lunch, or She has visited Paris.",
      "We use the Present Perfect for experiences in our life.",
      "Have you ever seen the ocean? Have you ever eaten sushi?",
      "We also use it for recent events that affect the present.",
      "For example: I can't find my keys. I have lost them!",
      "Important signal words include: just, already, yet, ever, and never.",
      "I have just finished my homework means very recently.",
      "Have you done it yet is used in questions and negatives.",
      "Practice sentence: She has never tried Indian food.",
      "Now it's your turn — make your own Present Perfect sentence!",
    ],
    quiz:[
      {q:"How is Present Perfect formed?", opts:["Subject + V2","Have/Has + past participle","Will + V1","am/is/are + Ving"], ans:1, exp:"'Have/Has + past participle' — যেমন: I have eaten, She has gone।"},
      {q:"Which word means 'very recently'?", opts:["Yet","Ever","Just","Never"], ans:2, exp:"'Just' means very recently."},
      {q:"Which sentence is correct?", opts:["I have went there","She has go to London","They have visited Japan","He have eaten"], ans:2, exp:"'They have visited Japan' — সঠিক: have/has + past participle।"},
    ]
  },

  { id:"l7h", title:"Modal Verbs — Can, Must, Should", category:"Audio Lesson", level:"B1", dur:"7:30", durSec:450, xp:100,
    icon:"🔧", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    transcript:[
      "Today we look at three of the most important modal verbs in English.",
      "Can, must, and should each express a different idea.",
      "Can expresses ability or permission.",
      "I can swim very well. Can I use your phone? Yes, you can.",
      "Must expresses strong obligation or necessity.",
      "You must wear a seatbelt. I must finish this report today.",
      "Should expresses advice or recommendation.",
      "You should drink more water. She should see a doctor.",
      "Now, let's look at the negative forms.",
      "Cannot, or can't, means you are not able to, or not allowed to.",
      "Mustn't means it is prohibited — don't do it.",
      "Shouldn't means it's not a good idea.",
      "Remember: modal verbs are always followed by the base form of the verb.",
    ],
    quiz:[
      {q:"Which modal verb expresses advice?", opts:["Can","Must","Should","Will"], ans:2, exp:"'Should expresses advice or recommendation.'"},
      {q:"What does 'mustn't' mean?", opts:["Not able to","Not necessary","Prohibited","Not recommended"], ans:2, exp:"'Mustn't means it is prohibited — don't do it.'"},
      {q:"What form follows modal verbs?", opts:["Past form","ing form","Base form","to + verb"], ans:2, exp:"'Modal verbs are always followed by the base form of the verb.'"},
    ]
  },

  // B2
  { id:"l7c", title:"Conditionals — Types 1, 2 and 3", category:"Audio Lesson", level:"B2", dur:"8:30", durSec:510, xp:125,
    icon:"🔀", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    transcript:[
      "Today's lesson covers the three main types of conditional sentences.",
      "The First Conditional talks about real and possible future situations.",
      "Its structure is: If plus present simple, will plus base verb.",
      "Example: If it rains tomorrow, I will stay at home.",
      "The Second Conditional talks about unreal or imaginary situations.",
      "Its structure is: If plus past simple, would plus base verb.",
      "Example: If I had a million dollars, I would travel the world.",
      "Notice — this doesn't mean I actually have a million dollars.",
      "The Third Conditional talks about past situations that didn't happen.",
      "Its structure is: If plus past perfect, would have plus past participle.",
      "Example: If I had studied harder, I would have passed the exam.",
      "A common mistake is using would in the if clause — never do this.",
    ],
    quiz:[
      {q:"Which is a correct First Conditional?", opts:["If I would go","If it rains, I will stay home","If I had money, I would buy it","If she had tried, she would have passed"], ans:1, exp:"First Conditional: If + present simple, will + base verb."},
      {q:"What does Second Conditional express?", opts:["Real future events","Past regrets","Unreal or imaginary situations","Scientific facts"], ans:2, exp:"Second Conditional = unreal/imaginary."},
      {q:"Which tense in the Third Conditional if-clause?", opts:["Present Simple","Past Simple","Past Perfect","Future Simple"], ans:2, exp:"Third Conditional: If + Past Perfect, would have + past participle."},
    ]
  },

  { id:"l9", title:"Business English — Meetings", category:"Audio Lesson", level:"B2", dur:"8:00", durSec:480, xp:125,
    icon:"📊", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "Good morning everyone. Thank you for joining today's meeting.",
      "Let's begin with a quick update on the quarterly targets.",
      "As you can see from the data, we've exceeded our sales goals by 15 percent.",
      "I'd like to hand over to Mr Karim now for the marketing report.",
      "Thank you. Our new campaign has reached over 2 million customers.",
      "We're seeing very positive engagement across all digital platforms.",
      "Excellent. Does anyone have any questions or concerns at this stage?",
      "Yes, I'd like to raise the issue of our delivery timeline.",
      "That's a valid point. Let's schedule a separate meeting to discuss that.",
      "Great. To summarise today's meeting: targets are on track.",
      "Please refer to the minutes that will be circulated this afternoon.",
      "Thank you all for your time. The meeting is now adjourned.",
    ],
    quiz:[
      {q:"By how much did they exceed sales goals?", opts:["10%","15%","20%","5%"], ans:1, exp:"'We've exceeded our sales goals by 15 percent.'"},
      {q:"Who gave the marketing report?", opts:["The chairperson","Mr Karim","The secretary","The CEO"], ans:1, exp:"'I'd like to hand over to Mr Karim now for the marketing report.'"},
    ]
  },

  // C1
  { id:"l7d", title:"Academic Vocabulary", category:"Audio Lesson", level:"C1", dur:"9:00", durSec:540, xp:150,
    icon:"🎓", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    transcript:[
      "Welcome to this advanced vocabulary lesson on the Academic Word List.",
      "These words appear frequently in academic texts and formal writing.",
      "The first word is analyze. To analyze means to examine in detail.",
      "Example: Researchers analyzed the data over a period of six months.",
      "Next is constitute. To constitute means to be a part of, or to make up.",
      "Example: Women constitute over half of the university's student population.",
      "The word imply means to suggest something without stating it directly.",
      "Example: The silence implied that no one agreed with the proposal.",
      "To sustain means to maintain something over time.",
      "Example: It is difficult to sustain motivation without clear goals.",
      "Finally, ambiguous means open to more than one interpretation.",
      "Example: The instructions were ambiguous, causing widespread confusion.",
    ],
    quiz:[
      {q:"What does 'ambiguous' mean?", opts:["Very clear","Open to more than one interpretation","Impossible to understand","Formal and academic"], ans:1, exp:"'Ambiguous means open to more than one interpretation.'"},
      {q:"Which sentence uses 'constitute' correctly?", opts:["She constituted to the project","Women constitute half the students","He constituted the answer","They constituted quickly"], ans:1, exp:"'Women constitute over half the population.'"},
    ]
  },

  { id:"l7i", title:"Passive Voice — All Tenses", category:"Audio Lesson", level:"C1", dur:"9:00", durSec:540, xp:150,
    icon:"🔁", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    transcript:[
      "Today's advanced lesson focuses on the passive voice across all tenses.",
      "In the active voice, the subject performs the action.",
      "In the passive voice, the subject receives the action.",
      "The passive is formed with the appropriate form of to be, plus the past participle.",
      "Present Simple passive: The report is written by the manager.",
      "Past Simple passive: The letter was sent yesterday.",
      "Present Perfect passive: The decision has been made.",
      "Future passive: The results will be announced next week.",
      "Present Continuous passive: The bridge is being repaired.",
      "Past Perfect passive: The contract had been signed before the meeting.",
      "We often omit the agent — the by phrase — when it is unknown or unimportant.",
      "For example: The window was broken. We don't need to say by whom.",
    ],
    quiz:[
      {q:"How is the passive voice formed?", opts:["Subject + will + verb","To be + past participle","Have + past participle","Subject + verb + object"], ans:1, exp:"'The passive is formed with to be plus the past participle.'"},
      {q:"When do we omit the agent?", opts:["Always","Never","When unknown or unimportant","Only in formal writing"], ans:2, exp:"'We often omit the agent when it is unknown or unimportant.'"},
      {q:"Which is correct Past Simple passive?", opts:["The letter is sent","The letter was sent","The letter has sent","The letter will sent"], ans:1, exp:"Past Simple passive: was/were + past participle."},
    ]
  },

  // C2
  { id:"l7e", title:"Discourse Markers & Cohesion", category:"Audio Lesson", level:"C2", dur:"9:30", durSec:570, xp:175,
    icon:"🧩", color:"rgba(167,139,250,.12)", border:"rgba(167,139,250,.25)",
    transcript:[
      "At the highest levels of English proficiency, cohesion is everything.",
      "Discourse markers are words and phrases that connect ideas logically.",
      "They signal relationships between sentences and paragraphs.",
      "Additive markers add information: furthermore, moreover, in addition.",
      "Example: The policy was expensive. Moreover, it proved ineffective.",
      "Adversative markers show contrast: however, nevertheless, on the contrary.",
      "Example: The results were promising. Nevertheless, further research is needed.",
      "Causal markers show cause and effect: therefore, consequently, as a result.",
      "Example: Funding was cut. Consequently, the project was abandoned.",
      "Temporal markers sequence events: subsequently, meanwhile, prior to.",
      "Example: She submitted the report. Subsequently, she resigned.",
      "Mastering these markers will elevate your writing to a truly sophisticated level.",
    ],
    quiz:[
      {q:"What is the function of 'nevertheless'?", opts:["To add information","To show contrast","To show cause and effect","To sequence events"], ans:1, exp:"'Nevertheless' is an adversative marker — it shows contrast."},
      {q:"Which marker shows cause and effect?", opts:["Furthermore","However","Consequently","Subsequently"], ans:2, exp:"'Consequently' is a causal marker showing cause and effect."},
    ]
  },

  { id:"l7j", title:"Advanced Register & Style", category:"Audio Lesson", level:"C2", dur:"10:00", durSec:600, xp:175,
    icon:"✒️", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "At C2 level, the ability to shift register is what distinguishes true mastery.",
      "Register refers to the level of formality appropriate to a given context.",
      "A text message to a friend and a letter to a judge require entirely different language.",
      "Formal register avoids contractions, slang, and first-person wherever possible.",
      "It favours the passive voice, complex sentences, and Latinate vocabulary.",
      "Informal register is warm, direct, and personal. It uses contractions freely.",
      "Consider the difference: I'm sorry versus I regret to inform you.",
      "Or: The thing is versus The fundamental issue is.",
      "A sophisticated writer moves fluidly between these registers.",
      "They understand that the right word in the wrong context is the wrong word.",
      "Mastery is not just knowing the rules — it is knowing when to break them.",
      "And knowing the difference between breaking a rule and making an error.",
    ],
    quiz:[
      {q:"What does 'register' refer to?", opts:["Speed of speaking","Level of formality","Vocabulary size","Grammar accuracy"], ans:1, exp:"'Register refers to the level of formality appropriate to a given context.'"},
      {q:"What does formal register favour?", opts:["Contractions and slang","Passive voice and complex sentences","Short simple sentences","Personal anecdotes"], ans:1, exp:"'It favours the passive voice, complex sentences, and Latinate vocabulary.'"},
    ]
  },


  /* ════════════════════════════════
     NEWS — 8 lessons
  ════════════════════════════════ */

  // A2
  { id:"l8c", title:"Education News — Future of Learning", category:"News", level:"A2", dur:"3:50", durSec:230, xp:75,
    icon:"📚", color:"rgba(251,146,60,.12)", border:"rgba(251,146,60,.25)",
    transcript:[
      "Welcome to Education Today. I'm your host, James Walker.",
      "Schools around the world are changing the way they teach.",
      "Many classrooms are now using tablets and computers instead of textbooks.",
      "Students can watch lessons online and study at their own pace.",
      "Teachers say technology helps students who learn in different ways.",
      "However, some experts worry that too much screen time is harmful.",
      "They recommend that children still spend time reading physical books.",
      "Parents are being encouraged to talk to their children about healthy habits.",
      "The most important thing, says one teacher, is to keep children curious.",
      "That curiosity, she says, is what makes great learners.",
    ],
    quiz:[
      {q:"What are many classrooms using instead of textbooks?", opts:["Newspapers","Tablets and computers","Whiteboards","Radio"], ans:1, exp:"'Many classrooms are now using tablets and computers instead of textbooks.'"},
      {q:"What do some experts worry about?", opts:["Too much homework","Too much screen time","Not enough teachers","School fees"], ans:1, exp:"'Some experts worry that too much screen time is harmful.'"},
    ]
  },

  { id:"l8e", title:"Sports News — The Power of Teamwork", category:"News", level:"A2", dur:"3:40", durSec:220, xp:75,
    icon:"⚽", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    transcript:[
      "Good morning. Today we look at how sport teaches important life lessons.",
      "A school football team from a small village has reached the national final.",
      "The team has only twelve players and a very small budget.",
      "Their coach says the secret is simple: they trust each other completely.",
      "Every player knows their role and plays for the team, not for themselves.",
      "The captain, a fifteen-year-old girl named Priya, scores most of the goals.",
      "But she says the goalkeeper and defenders deserve just as much credit.",
      "Without them, I couldn't take any risks going forward, she says.",
      "The final takes place this Saturday at the national stadium.",
      "Whatever the result, their story has already inspired thousands of young players.",
    ],
    quiz:[
      {q:"What is the secret to the team's success?", opts:["A big budget","Famous players","Trusting each other","A professional coach"], ans:2, exp:"'The secret is simple: they trust each other completely.'"},
      {q:"Who is the captain?", opts:["The coach","A fifteen-year-old boy","A fifteen-year-old girl named Priya","The goalkeeper"], ans:2, exp:"'The captain, a fifteen-year-old girl named Priya.'"},
    ]
  },

  // B1
  { id:"l8b", title:"Technology & Artificial Intelligence", category:"News", level:"B1", dur:"4:30", durSec:270, xp:100,
    icon:"🤖", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    transcript:[
      "Good morning. Today we look at the growing influence of artificial intelligence.",
      "AI is now being used in hospitals to help doctors diagnose diseases earlier.",
      "In education, AI tutors are personalising lessons for millions of students.",
      "However, concerns are growing about job losses due to automation.",
      "A recent report suggests that up to 40 percent of jobs could change significantly.",
      "Experts are divided on whether AI will create more jobs than it destroys.",
      "Governments are being called upon to regulate the technology responsibly.",
      "Meanwhile, researchers continue to push the boundaries of what machines can do.",
      "The debate about AI ethics has never been more urgent.",
      "One thing is certain — the world is changing faster than ever before.",
    ],
    quiz:[
      {q:"How is AI being used in hospitals?", opts:["To replace doctors","To help diagnose diseases earlier","To manage finances","To train nurses"], ans:1, exp:"'AI is now being used in hospitals to help doctors diagnose diseases earlier.'"},
      {q:"What percentage of jobs could change?", opts:["10%","20%","40%","60%"], ans:2, exp:"'Up to 40 percent of jobs could change significantly.'"},
    ]
  },

  { id:"l8f", title:"Environment — Saving the Oceans", category:"News", level:"B1", dur:"4:20", durSec:260, xp:100,
    icon:"🌊", color:"rgba(96,165,250,.12)", border:"rgba(96,165,250,.25)",
    transcript:[
      "This week, scientists have published alarming new findings about ocean pollution.",
      "More than eight million tonnes of plastic enter the oceans every year.",
      "Tiny particles of plastic, called microplastics, are now found in fish and seafood.",
      "Researchers say these particles may be harmful to human health as well.",
      "But there is some good news. Communities around the world are taking action.",
      "A coastal village in India has cleared over five tonnes of plastic from its beach.",
      "Young volunteers from forty different countries participated in the clean-up.",
      "Companies are also being pressured to reduce single-use plastic packaging.",
      "Several major supermarkets have already committed to cutting plastic by 2030.",
      "Experts say individual action, combined with government policy, is the only way forward.",
    ],
    quiz:[
      {q:"How much plastic enters the oceans each year?", opts:["1 million tonnes","8 million tonnes","50 million tonnes","100 million tonnes"], ans:1, exp:"'More than eight million tonnes of plastic enter the oceans every year.'"},
      {q:"What are microplastics?", opts:["Large pieces of plastic","Tiny plastic particles","Plastic bags","Plastic bottles"], ans:1, exp:"'Tiny particles of plastic, called microplastics.'"},
      {q:"By when have supermarkets committed to cutting plastic?", opts:["2025","2028","2030","2035"], ans:2, exp:"'Several major supermarkets have committed to cutting plastic by 2030.'"},
    ]
  },

  // B2
  { id:"l8", title:"Climate Change News Report", category:"News", level:"B2", dur:"4:50", durSec:290, xp:125,
    icon:"🌍", color:"rgba(96,165,250,.12)", border:"rgba(96,165,250,.25)",
    transcript:[
      "Good evening. Tonight's top story: climate scientists have released their latest report.",
      "The report warns that global temperatures have risen by 1.2 degrees Celsius.",
      "Scientists say this is primarily caused by greenhouse gas emissions.",
      "Governments around the world are being urged to take immediate action.",
      "Renewable energy sources such as solar and wind power are being promoted.",
      "Many countries have pledged to reach net zero emissions by 2050.",
      "However, critics argue that current pledges are not ambitious enough.",
      "Local communities are also taking action by planting trees and reducing waste.",
      "Experts agree that individual actions, combined with policy change, are essential.",
      "The next global climate summit is scheduled for later this year.",
    ],
    quiz:[
      {q:"By how much have global temperatures risen?", opts:["0.5°C","1.2°C","2.0°C","1.5°C"], ans:1, exp:"'Global temperatures have risen by 1.2 degrees Celsius.'"},
      {q:"What do critics say?", opts:["Pledges are too ambitious","Pledges are not ambitious enough","Everything is fine","Countries should do nothing"], ans:1, exp:"'Critics argue that current pledges are not ambitious enough.'"},
    ]
  },

  { id:"l8g", title:"Economy — Cost of Living Crisis", category:"News", level:"B2", dur:"5:10", durSec:310, xp:125,
    icon:"💰", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "Across many countries, families are struggling with rising living costs.",
      "Inflation has pushed food prices up by as much as fifteen percent in some regions.",
      "Energy bills have doubled in several European countries over the past two years.",
      "Central banks have responded by raising interest rates to slow inflation.",
      "However, higher interest rates also mean higher mortgage repayments for homeowners.",
      "Many renters are finding it increasingly difficult to afford their monthly payments.",
      "Food banks have reported a significant increase in demand across the country.",
      "Economists are divided on when the situation will begin to improve.",
      "Some predict a gradual recovery by the middle of next year.",
      "Others warn that the crisis may deepen before it gets better.",
      "Governments are under pressure to provide targeted support for the most vulnerable.",
    ],
    quiz:[
      {q:"By how much have food prices risen in some regions?", opts:["5%","10%","15%","20%"], ans:2, exp:"'Food prices up by as much as fifteen percent in some regions.'"},
      {q:"How have central banks responded to inflation?", opts:["Cutting interest rates","Raising interest rates","Printing more money","Reducing taxes"], ans:1, exp:"'Central banks have responded by raising interest rates to slow inflation.'"},
    ]
  },

  // C1
  { id:"l8d", title:"Health & Wellbeing Report", category:"News", level:"C1", dur:"5:20", durSec:320, xp:150,
    icon:"🏥", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "Researchers at a leading university have published a landmark study on mental health.",
      "The study, which followed ten thousand participants over a decade, yields striking conclusions.",
      "Those who reported strong social connections were 50 percent less likely to develop depression.",
      "The findings underscore the profound impact of community on psychological wellbeing.",
      "Dr Patel, who led the research, described the results as both alarming and hopeful.",
      "Alarming, because loneliness is reaching epidemic proportions in developed nations.",
      "Hopeful, because the solution — human connection — is within our reach.",
      "The study recommends that governments invest in community centres and social programmes.",
      "It also highlights the role of workplaces in fostering meaningful relationships.",
      "As our world becomes increasingly digital, the report warns, the need for genuine connection grows ever more urgent.",
    ],
    quiz:[
      {q:"What did the study find about social connections?", opts:["They reduce physical illness","They reduce depression by 50%","They improve academic performance","They increase productivity"], ans:1, exp:"'Those with strong social connections were 50 percent less likely to develop depression.'"},
      {q:"How does Dr Patel describe the results?", opts:["Surprising and interesting","Alarming and hopeful","Confusing and unclear","Disappointing"], ans:1, exp:"'Dr Patel described the results as both alarming and hopeful.'"},
    ]
  },

  // C2
  { id:"l8h", title:"Global Politics — Democracy Under Pressure", category:"News", level:"C2", dur:"6:00", durSec:360, xp:175,
    icon:"🗳️", color:"rgba(167,139,250,.12)", border:"rgba(167,139,250,.25)",
    transcript:[
      "In a landmark report released today, political analysts warn of a global democratic recession.",
      "For the seventeenth consecutive year, the number of countries moving towards authoritarianism has exceeded those moving towards democracy.",
      "The erosion of democratic norms, the report argues, rarely happens through outright coup.",
      "More often, it is a gradual process — the weakening of institutions, the concentration of power, the silencing of dissent.",
      "Freedom of the press, described as the oxygen of democracy, is under unprecedented pressure in sixty-two countries.",
      "What is particularly alarming, says the lead researcher, is how normalised these shifts have become.",
      "Citizens, exhausted by uncertainty, sometimes acquiesce to strongman politics in exchange for a perceived sense of stability.",
      "The report does not offer easy solutions, but it insists that civic engagement remains the most powerful counter-force.",
      "Where people organise, protest, vote, and hold their leaders accountable, democratic backsliding can be reversed.",
      "The question, it concludes, is not whether democracy is worth defending, but whether enough people believe it is.",
    ],
    quiz:[
      {q:"How does democratic erosion usually happen?", opts:["Through outright coup","Gradually through weakened institutions","Through foreign invasion","Through economic collapse"], ans:1, exp:"'It is a gradual process — the weakening of institutions, the concentration of power.'"},
      {q:"What does the report say is the most powerful counter-force?", opts:["Military action","International pressure","Civic engagement","Economic sanctions"], ans:2, exp:"'Civic engagement remains the most powerful counter-force.'"},
      {q:"For how many consecutive years has authoritarianism been spreading?", opts:["Ten","Twelve","Seventeen","Twenty"], ans:2, exp:"'For the seventeenth consecutive year.'"},
    ]
  },


  /* ════════════════════════════════
     NEW A1 LESSONS — 10 added
  ════════════════════════════════ */

  // A1 — Conversation
  { id:"a1n1", title:"At the Supermarket", category:"Conversation", level:"A1", dur:"3:15", durSec:195, xp:50,
    icon:"🛒", color:"rgba(45,212,191,.12)", border:"rgba(45,212,191,.25)",
    transcript:[
      "Good morning! Can I help you find something?",
      "Yes, please. Where is the bread?",
      "The bread is in aisle three, next to the butter.",
      "Thank you. And where can I find milk?",
      "The milk is in the fridge at the back of the store.",
      "Oh, and do you have fresh eggs?",
      "Yes, we do. They are near the milk.",
      "Great. How much is this orange juice?",
      "That one is one pound fifty.",
      "Perfect. I'll take two bottles, please.",
      "Of course. Anything else I can help you with?",
      "No, thank you. That's everything!",
    ],
    quiz:[
      {q:"Where is the bread?", opts:["Aisle one","Aisle two","Aisle three","Aisle four"], ans:2, exp:"'The bread is in aisle three, next to the butter.'"},
      {q:"Where is the milk kept?", opts:["On a shelf","In the fridge at the back","Near the entrance","In aisle three"], ans:1, exp:"'The milk is in the fridge at the back of the store.'"},
      {q:"How much is the orange juice?", opts:["£1.00","£1.50","£2.00","£2.50"], ans:1, exp:"'That one is one pound fifty.'"},
    ]
  },

  { id:"a1n2", title:"My Family", category:"Conversation", level:"A1", dur:"3:05", durSec:185, xp:50,
    icon:"👨‍👩‍👧‍👦", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    transcript:[
      "Tell me about your family.",
      "Sure! I have a small family. There are four of us.",
      "Who are they?",
      "My father, my mother, my younger sister, and me.",
      "How old is your sister?",
      "She is twelve years old. She goes to school.",
      "What does your father do?",
      "He is a teacher. He teaches mathematics.",
      "And your mother?",
      "She is a doctor. She works at a hospital.",
      "That sounds like a wonderful family!",
      "Yes, I love them very much.",
    ],
    quiz:[
      {q:"How many people are in the family?", opts:["Three","Four","Five","Six"], ans:1, exp:"'There are four of us.'"},
      {q:"What does the father do?", opts:["He is a doctor","He is a driver","He is a teacher","He is an engineer"], ans:2, exp:"'He is a teacher. He teaches mathematics.'"},
      {q:"Where does the mother work?", opts:["At a school","At a bank","At a hospital","At a shop"], ans:2, exp:"'She works at a hospital.'"},
    ]
  },

  { id:"a1n3", title:"The Weather Today", category:"Conversation", level:"A1", dur:"2:55", durSec:175, xp:50,
    icon:"🌤️", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "Good morning! What is the weather like today?",
      "It is sunny but a little windy.",
      "Is it hot or cold?",
      "It is warm. About twenty-five degrees.",
      "Oh, that's nice! Is it good weather for a walk?",
      "Yes, it is perfect for walking in the park.",
      "What about tomorrow? Will it rain?",
      "The forecast says it will be cloudy in the morning.",
      "Will it rain in the afternoon?",
      "There is a small chance of rain in the evening.",
      "I will bring my umbrella just in case.",
      "Good idea! Better safe than sorry.",
    ],
    quiz:[
      {q:"What is the weather like today?", opts:["Rainy and cold","Sunny and windy","Cloudy and warm","Stormy"], ans:1, exp:"'It is sunny but a little windy.'"},
      {q:"What is the temperature?", opts:["15 degrees","20 degrees","25 degrees","30 degrees"], ans:2, exp:"'About twenty-five degrees.'"},
      {q:"When might it rain?", opts:["In the morning","At noon","In the afternoon","In the evening"], ans:3, exp:"'There is a small chance of rain in the evening.'"},
    ]
  },

  // A1 — Story
  { id:"a1n4", title:"The Lost Kitten", category:"Story", level:"A1", dur:"4:20", durSec:260, xp:75,
    icon:"🐱", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    transcript:[
      "One day, a small kitten got lost in the park.",
      "She walked and walked, but she could not find her home.",
      "She was cold, hungry, and very scared.",
      "A little girl named Mia was playing near the fountain.",
      "She saw the kitten and ran towards it.",
      "The kitten was shaking. Its fur was wet from the rain.",
      "Mia picked up the kitten gently and held it close.",
      "She took the kitten home and gave it some warm milk.",
      "Her mother helped her make a small bed from a cardboard box.",
      "The kitten slept all night, safe and warm.",
      "The next morning, they put up posters around the neighbourhood.",
      "By afternoon, the kitten's owner had called. She was so happy.",
      "Mia felt proud. She had helped someone that day.",
    ],
    quiz:[
      {q:"Where did Mia find the kitten?", opts:["In the garden","Near the fountain in the park","Outside the shop","At school"], ans:1, exp:"'A little girl named Mia was playing near the fountain.'"},
      {q:"What did Mia give the kitten first?", opts:["Food","Warm milk","A toy","A blanket"], ans:1, exp:"'She gave it some warm milk.'"},
      {q:"How did they find the kitten's owner?", opts:["They called the police","They posted on social media","They put up posters","They asked neighbours"], ans:2, exp:"'They put up posters around the neighbourhood.'"},
    ]
  },

  { id:"a1n5", title:"The Boy Who Cried Wolf", category:"Story", level:"A1", dur:"4:00", durSec:240, xp:75,
    icon:"🐺", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    transcript:[
      "Once upon a time, there was a young shepherd boy.",
      "Every day, he watched the sheep on the hill near his village.",
      "He was bored and wanted some excitement.",
      "One day, he ran to the village and shouted, 'Wolf! Wolf! A wolf is attacking the sheep!'",
      "All the villagers ran up the hill to help him.",
      "But when they arrived, there was no wolf.",
      "The boy laughed. He thought it was very funny.",
      "The next week, he did the same thing again.",
      "The villagers ran up again, but again there was no wolf.",
      "They were very angry this time.",
      "Then one day, a real wolf came.",
      "The boy screamed, 'Wolf! Wolf! Please help me!'",
      "But this time, nobody came. Nobody believed him.",
      "The wolf chased all the sheep away.",
      "The boy learned an important lesson that day: never lie.",
    ],
    quiz:[
      {q:"Why did the boy shout 'Wolf!' the first time?", opts:["A wolf came","He was scared","He was bored and wanted excitement","He lost a sheep"], ans:2, exp:"'He was bored and wanted some excitement.'"},
      {q:"What happened when a real wolf came?", opts:["The villagers came quickly","Nobody came to help","The wolf ran away","The shepherd caught the wolf"], ans:1, exp:"'Nobody came. Nobody believed him.'"},
      {q:"What is the lesson of this story?", opts:["Always watch your sheep","Never lie","Be brave","Ask for help"], ans:1, exp:"The boy lied twice, so nobody believed him when he told the truth."},
    ]
  },

  // A1 — Audio Lesson
  { id:"a1n6", title:"The Alphabet & Phonics", category:"Audio Lesson", level:"A1", dur:"5:00", durSec:300, xp:50,
    icon:"🔤", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    transcript:[
      "Welcome to your first English lesson! Today we learn the alphabet.",
      "English has twenty-six letters. Let us go through them slowly.",
      "A is for Apple. B is for Ball. C is for Cat.",
      "D is for Dog. E is for Egg. F is for Fish.",
      "G is for Girl. H is for House. I is for Ice.",
      "J is for Juice. K is for Kite. L is for Lion.",
      "M is for Mango. N is for Night. O is for Orange.",
      "P is for Pencil. Q is for Queen. R is for Rain.",
      "S is for Sun. T is for Tree. U is for Umbrella.",
      "V is for Village. W is for Water. X is for X-ray.",
      "Y is for Yellow. Z is for Zebra.",
      "Now say each letter out loud. Practise every day.",
      "Remember: the more you practise, the faster you will learn.",
    ],
    quiz:[
      {q:"How many letters are in the English alphabet?", opts:["24","25","26","27"], ans:2, exp:"'English has twenty-six letters.'"},
      {q:"What does V stand for in the lesson?", opts:["Valley","Voice","Violin","Village"], ans:3, exp:"'V is for Village.'"},
      {q:"What is the best way to learn faster?", opts:["Read books","Watch videos","Practise every day","Listen to music"], ans:2, exp:"'The more you practise, the faster you will learn.'"},
    ]
  },

  { id:"a1n7", title:"Classroom Language", category:"Audio Lesson", level:"A1", dur:"5:10", durSec:310, xp:50,
    icon:"🏫", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "Today we learn useful phrases for the classroom.",
      "If you do not understand, say: 'Sorry, can you repeat that please?'",
      "If you want to ask a question, say: 'Excuse me, I have a question.'",
      "To ask for help, say: 'Can you help me, please?'",
      "If you are finished, say: 'I have finished. What do I do next?'",
      "To ask the meaning of a word, say: 'What does this word mean?'",
      "To ask how to spell something, say: 'How do you spell that?'",
      "If you need more time, say: 'Can I have a little more time, please?'",
      "Always say 'please' and 'thank you'. It is polite.",
      "Good manners make the classroom a better place for everyone.",
      "Now let us practise these phrases together.",
      "Repeat after me: Sorry, can you repeat that please?",
      "Well done! You are doing great!",
    ],
    quiz:[
      {q:"What do you say if you don't understand?", opts:["I don't know","Sorry, can you repeat that please?","Please stop","I am confused"], ans:1, exp:"'If you do not understand, say: Sorry, can you repeat that please?'"},
      {q:"How do you ask about the meaning of a word?", opts:["Can you help me?","What does this word mean?","How do you spell that?","I have a question"], ans:1, exp:"'What does this word mean?' is the correct phrase."},
      {q:"Why should you say please and thank you?", opts:["Because the teacher says so","Because it is polite","Because it helps you learn","Because it is a rule"], ans:1, exp:"'Always say please and thank you. It is polite.'"},
    ]
  },

  // A1 — News (simple)
  { id:"a1n8", title:"A New Park Opens in the City", category:"News", level:"A1", dur:"3:20", durSec:200, xp:50,
    icon:"🌳", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    transcript:[
      "Good morning! Here is the news for today.",
      "A big new park has opened in the city centre.",
      "The park has beautiful gardens and a large lake.",
      "There are also swings and slides for children.",
      "Hundreds of families visited the park on its first day.",
      "The mayor of the city cut the ribbon to open it.",
      "She said the park is a gift for the people of the city.",
      "The park is open every day from seven in the morning.",
      "It closes at nine o'clock at night.",
      "Entry to the park is completely free for everyone.",
      "Many people say it is the best park in the country.",
      "We hope you enjoy your visit!",
    ],
    quiz:[
      {q:"Where is the new park?", opts:["In the countryside","In the city centre","Near the airport","By the river"], ans:1, exp:"'A big new park has opened in the city centre.'"},
      {q:"What time does the park close?", opts:["8:00 pm","9:00 pm","10:00 pm","11:00 pm"], ans:1, exp:"'It closes at nine o'clock at night.'"},
      {q:"How much does it cost to enter the park?", opts:["£1","£5","£10","It is free"], ans:3, exp:"'Entry to the park is completely free for everyone.'"},
    ]
  },

  { id:"a1n9", title:"A School Wins a Science Prize", category:"News", level:"A1", dur:"3:10", durSec:190, xp:50,
    icon:"🏆", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "Here is today's top story.",
      "A school in Dhaka has won a big science prize.",
      "The students made a small robot that can clean the floor.",
      "The robot uses solar energy. It does not need batteries.",
      "Twenty students worked together on the project for six months.",
      "Their teacher, Mr Karim, helped them every step of the way.",
      "The prize is one hundred thousand taka.",
      "The school will use the money to buy new computers.",
      "The students are very happy and proud.",
      "One student said, 'We never gave up. We kept trying.'",
      "The science minister gave them the prize at a ceremony.",
      "This is a great day for science in our country!",
    ],
    quiz:[
      {q:"What did the students make?", opts:["A solar car","A robot that cleans the floor","A weather machine","A computer"], ans:1, exp:"'The students made a small robot that can clean the floor.'"},
      {q:"How long did they work on the project?", opts:["Three months","Four months","Six months","One year"], ans:2, exp:"'Twenty students worked together on the project for six months.'"},
      {q:"What will the school buy with the prize money?", opts:["Books","New computers","A new classroom","Lab equipment"], ans:1, exp:"'The school will use the money to buy new computers.'"},
    ]
  },

  { id:"a1n10", title:"A Baby Elephant at the Zoo", category:"News", level:"A1", dur:"3:00", durSec:180, xp:50,
    icon:"🐘", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    transcript:[
      "Good news from the city zoo today!",
      "A baby elephant was born last night.",
      "The baby elephant is a girl. She weighs one hundred and ten kilograms.",
      "She has big brown eyes and soft grey skin.",
      "Her mother's name is Maya. Maya is twelve years old.",
      "The zookeepers say both mother and baby are healthy and happy.",
      "Visitors can see the baby elephant from Saturday.",
      "The zoo is asking the public to suggest a name for her.",
      "You can send your suggestions to the zoo's website.",
      "The winning name will be announced next week.",
      "Thousands of people have already visited to see them.",
      "It is a very special day at the zoo!",
    ],
    quiz:[
      {q:"How much does the baby elephant weigh?", opts:["90 kg","100 kg","110 kg","120 kg"], ans:2, exp:"'She weighs one hundred and ten kilograms.'"},
      {q:"What is the mother elephant's name?", opts:["Mia","Maya","Mala","Mona"], ans:1, exp:"'Her mother's name is Maya.'"},
      {q:"How can people suggest a name for the baby elephant?", opts:["By calling the zoo","By visiting in person","By sending to the zoo's website","By writing a letter"], ans:2, exp:"'You can send your suggestions to the zoo's website.'"},
    ]
  },

  /* ════════════════════════════════
     NEW A2 LESSONS — 10 added
  ════════════════════════════════ */

  // A2 — Conversation
  { id:"a2n1", title:"Booking a Hotel Room", category:"Conversation", level:"A2", dur:"4:15", durSec:255, xp:75,
    icon:"🏨", color:"rgba(45,212,191,.12)", border:"rgba(45,212,191,.25)",
    transcript:[
      "Good afternoon, Grand Hotel. How can I help you?",
      "Hello, I'd like to book a room for two nights, please.",
      "Of course. What dates would you like?",
      "The fifteenth and sixteenth of July.",
      "Let me check availability. Would you like a single or double room?",
      "A double room, please. Do you have one with a sea view?",
      "Yes, we have one available. It's one hundred and twenty pounds per night.",
      "That sounds good. Does the price include breakfast?",
      "Yes, breakfast is included. Check-in is at two in the afternoon.",
      "And what time is check-out?",
      "Check-out is at eleven in the morning.",
      "Perfect. Can I pay by credit card?",
      "Absolutely. May I take your name and card details, please?",
    ],
    quiz:[
      {q:"How many nights does the guest want to book?", opts:["One","Two","Three","Four"], ans:1, exp:"'I'd like to book a room for two nights.'"},
      {q:"How much does the room cost per night?", opts:["£100","£110","£120","£130"], ans:2, exp:"'It's one hundred and twenty pounds per night.'"},
      {q:"What time is check-out?", opts:["9:00 am","10:00 am","11:00 am","12:00 pm"], ans:2, exp:"'Check-out is at eleven in the morning.'"},
    ]
  },

  { id:"a2n2", title:"Talking About Hobbies", category:"Conversation", level:"A2", dur:"4:05", durSec:245, xp:75,
    icon:"🎨", color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)",
    transcript:[
      "What do you like to do in your free time?",
      "I enjoy painting and reading books. What about you?",
      "I love playing football. I play every weekend with my friends.",
      "That sounds fun! How long have you been playing?",
      "Since I was about eight years old. So around fifteen years.",
      "Wow, that's a long time! Are you good at it?",
      "I'm not professional, but I'm quite good. I score goals sometimes.",
      "Do you follow any football teams?",
      "Yes, I support Manchester City. Which books do you like to read?",
      "I enjoy mystery novels. I just finished a very exciting one.",
      "Maybe I should try reading. I don't read much.",
      "You should! It helps your English too. We can swap recommendations.",
      "Great idea! Let's do that.",
    ],
    quiz:[
      {q:"What are the first speaker's hobbies?", opts:["Football and music","Painting and reading","Cooking and dancing","Cycling and swimming"], ans:1, exp:"'I enjoy painting and reading books.'"},
      {q:"How long has the second speaker been playing football?", opts:["Ten years","Twelve years","Around fifteen years","Twenty years"], ans:2, exp:"'Since I was about eight years old. So around fifteen years.'"},
      {q:"What kind of books does the first speaker like?", opts:["Horror novels","Romance novels","Mystery novels","Science fiction"], ans:2, exp:"'I enjoy mystery novels.'"},
    ]
  },

  { id:"a2n3", title:"At the Post Office", category:"Conversation", level:"A2", dur:"3:50", durSec:230, xp:75,
    icon:"📮", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "Good morning. How can I help you today?",
      "I'd like to send this package to Australia, please.",
      "Of course. Can I weigh it for you?",
      "Sure, go ahead.",
      "It weighs two point five kilograms. How would you like to send it?",
      "What are my options?",
      "Standard delivery takes ten to fourteen days and costs twelve pounds.",
      "Express delivery takes three to five days and costs twenty-eight pounds.",
      "I'll go with express, please. It's important.",
      "No problem. Would you like to add insurance?",
      "Yes, please. What does that cost?",
      "Insurance is an extra three pounds for items up to fifty pounds in value.",
      "That's fine. Here's my card.",
      "Thank you. Your tracking number is on the receipt.",
    ],
    quiz:[
      {q:"How much does the package weigh?", opts:["1.5 kg","2 kg","2.5 kg","3 kg"], ans:2, exp:"'It weighs two point five kilograms.'"},
      {q:"How long does express delivery take?", opts:["One to two days","Three to five days","Five to seven days","Ten to fourteen days"], ans:1, exp:"'Express delivery takes three to five days.'"},
      {q:"How much does insurance cost?", opts:["£1","£2","£3","£5"], ans:2, exp:"'Insurance is an extra three pounds.'"},
    ]
  },

  { id:"a2n4", title:"Talking About Your Job", category:"Conversation", level:"A2", dur:"4:20", durSec:260, xp:75,
    icon:"💼", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    transcript:[
      "So, what do you do for work?",
      "I'm a graphic designer. I work for a small creative agency.",
      "That sounds really interesting! What exactly do you design?",
      "Mostly logos and social media content for businesses.",
      "How long have you been doing that?",
      "About three years now. I started right after university.",
      "Do you enjoy it?",
      "Yes, most of the time. Sometimes the deadlines are stressful.",
      "I can imagine. Do you work from home or in an office?",
      "I work from home three days a week and go to the office twice.",
      "That sounds like a good balance.",
      "It is. I save a lot of time on commuting.",
      "What software do you use for designing?",
      "Mainly Adobe Illustrator and Photoshop.",
    ],
    quiz:[
      {q:"What is the speaker's job?", opts:["Web developer","Photographer","Graphic designer","Marketing manager"], ans:2, exp:"'I'm a graphic designer.'"},
      {q:"How many days a week does the speaker go to the office?", opts:["Once","Twice","Three times","Every day"], ans:1, exp:"'I go to the office twice.'"},
      {q:"What does the speaker find stressful?", opts:["The clients","The software","The deadlines","The commute"], ans:2, exp:"'Sometimes the deadlines are stressful.'"},
    ]
  },

  // A2 — Story
  { id:"a2n5", title:"The Old Man's Garden", category:"Story", level:"A2", dur:"5:15", durSec:315, xp:75,
    icon:"🌻", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    transcript:[
      "Old Mr Hassan lived alone at the end of a quiet street.",
      "Every morning, he woke up early and walked to his garden.",
      "His garden was the most beautiful in the whole neighbourhood.",
      "He grew tomatoes, roses, sunflowers, and herbs of every kind.",
      "The children who passed by always stopped to look through the gate.",
      "One day, a young girl named Priya knocked on his door.",
      "'Excuse me,' she said. 'Can you teach me how to grow flowers?'",
      "Mr Hassan smiled. He had not had a visitor in a long time.",
      "'Of course,' he said. 'Come in. The garden will teach you everything.'",
      "Every Saturday after that, Priya came to learn.",
      "She learned about watering, pruning, and the importance of patience.",
      "By the end of the year, her own small balcony was full of colour.",
      "Mr Hassan was proud. He had shared something he loved.",
      "And Priya had learned that kindness, like a garden, grows when you nurture it.",
    ],
    quiz:[
      {q:"What did Priya ask Mr Hassan to teach her?", opts:["How to cook","How to grow flowers","How to paint","How to read"], ans:1, exp:"'Can you teach me how to grow flowers?' Priya asked."},
      {q:"When did Priya come to learn?", opts:["Every Sunday","Every Friday","Every Saturday","Every Wednesday"], ans:2, exp:"'Every Saturday after that, Priya came to learn.'"},
      {q:"What lesson does the story teach?", opts:["Hard work always pays off","Kindness grows when you nurture it","Old people are wiser","Gardens need lots of water"], ans:1, exp:"'Kindness, like a garden, grows when you nurture it.'"},
    ]
  },

  { id:"a2n6", title:"The Missing Bicycle", category:"Story", level:"A2", dur:"5:30", durSec:330, xp:75,
    icon:"🚲", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "Tariq loved his bicycle more than anything else he owned.",
      "It was bright red with a silver bell and a small basket in front.",
      "One Tuesday morning, he came outside to find it was gone.",
      "He looked up and down the street, but there was no sign of it.",
      "He felt a cold wave of panic. He had saved for six months to buy it.",
      "He told his mother, who said calmly, 'Let's think before we worry.'",
      "They checked the backyard, the garage, and the neighbour's gate.",
      "Nothing. His mother suggested he ask the neighbours.",
      "An elderly woman across the street said she had seen a boy with a red bike.",
      "'He went towards the park,' she said. 'About an hour ago.'",
      "Tariq ran to the park and found his little cousin riding the bicycle in circles.",
      "'I borrowed it!' his cousin said with a big smile. 'I was going to bring it back!'",
      "Tariq laughed with relief. 'Next time, please ask first!'",
      "His cousin nodded seriously. It was a lesson learned by both of them.",
    ],
    quiz:[
      {q:"How long did Tariq save money to buy the bicycle?", opts:["Three months","Four months","Six months","One year"], ans:2, exp:"'He had saved for six months to buy it.'"},
      {q:"Who had seen someone with the red bicycle?", opts:["A child","An elderly woman","His mother","A shopkeeper"], ans:1, exp:"'An elderly woman across the street said she had seen a boy with a red bike.'"},
      {q:"Who had taken the bicycle?", opts:["A stranger","A classmate","His little cousin","His neighbour"], ans:2, exp:"'Tariq ran to the park and found his little cousin riding the bicycle.'"},
    ]
  },

  // A2 — Audio Lesson
  { id:"a2n7", title:"Countable & Uncountable Nouns", category:"Audio Lesson", level:"A2", dur:"6:30", durSec:390, xp:75,
    icon:"📦", color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)",
    transcript:[
      "Today we are going to learn about countable and uncountable nouns.",
      "Countable nouns are things you can count. For example: one apple, two apples, three apples.",
      "Other examples: a book, two books. A chair, three chairs. A student, many students.",
      "Uncountable nouns are things you cannot count individually.",
      "Examples: water, rice, music, information, advice, luggage.",
      "We do not say 'one water' or 'two waters'. We say 'some water' or 'a glass of water'.",
      "With countable nouns, use 'a' or 'an' for singular: a cat, an egg.",
      "With uncountable nouns, never use 'a' or 'an'. Just use the noun alone or with 'some'.",
      "Compare: I need some sugar. Correct! I need a sugar. Wrong!",
      "Some words can be both countable and uncountable depending on meaning.",
      "For example: 'I'd like a coffee' — one cup of coffee. That is countable.",
      "'Coffee is grown in Brazil' — the general substance. That is uncountable.",
      "Practice tip: when learning a new noun, always note whether it is countable or not.",
    ],
    quiz:[
      {q:"Which of these is an uncountable noun?", opts:["Apple","Chair","Information","Student"], ans:2, exp:"'Information' cannot be counted. You cannot say 'one information' or 'two informations'."},
      {q:"Which sentence is correct?", opts:["I need a water","I need some water","I need one water","I need waters"], ans:1, exp:"Uncountable nouns use 'some', not 'a/an'. So 'some water' is correct."},
      {q:"When can 'coffee' be countable?", opts:["When it is grown in a farm","When it means one cup of coffee","When it is mixed with milk","When it is hot"], ans:1, exp:"'I'd like a coffee' means one cup of coffee — that is countable."},
    ]
  },

  { id:"a2n8", title:"Asking Questions in English", category:"Audio Lesson", level:"A2", dur:"6:00", durSec:360, xp:75,
    icon:"❓", color:"rgba(45,212,191,.12)", border:"rgba(45,212,191,.25)",
    transcript:[
      "Knowing how to ask questions is very important in English.",
      "There are two main types: yes/no questions and wh-questions.",
      "Yes or no questions expect the answer 'yes' or 'no'.",
      "For example: Are you hungry? Is she a teacher? Do they live here?",
      "Wh-questions ask for specific information. They start with: what, where, when, why, who, how.",
      "For example: What is your name? Where do you live? Why are you late?",
      "To form a question in the present simple, use do or does.",
      "'He plays football' becomes 'Does he play football?'",
      "In the past simple, use did: 'She went home' becomes 'Did she go home?'",
      "Notice that after did, we use the base form of the verb, not the past form.",
      "Incorrect: Did she went home? Correct: Did she go home?",
      "For questions with 'be', just swap the subject and verb.",
      "'You are happy' becomes 'Are you happy?' Simple!",
      "Practice making questions every day. It will become natural very quickly.",
    ],
    quiz:[
      {q:"What type of question starts with 'where' or 'why'?", opts:["Yes/No question","Tag question","Wh-question","Indirect question"], ans:2, exp:"Questions starting with what, where, when, why, who, and how are called wh-questions."},
      {q:"Which is the correct question form?", opts:["Did she went home?","Did she goes home?","Did she go home?","Does she went home?"], ans:2, exp:"After 'did', we always use the base form of the verb: 'go', not 'went'."},
      {q:"How do you form a question using 'be'?", opts:["Add do before the verb","Swap the subject and verb","Add did at the end","Use have instead"], ans:1, exp:"'You are happy' becomes 'Are you happy?' — just swap subject and verb."},
    ]
  },

  // A2 — News
  { id:"a2n9", title:"New Bus Routes for the City", category:"News", level:"A2", dur:"4:00", durSec:240, xp:75,
    icon:"🚌", color:"rgba(52,211,153,.12)", border:"rgba(52,211,153,.25)",
    transcript:[
      "The city transport authority has announced ten new bus routes starting next month.",
      "The new routes will connect outer neighbourhoods to the city centre more efficiently.",
      "At the moment, many residents have to take two or three buses to reach their workplace.",
      "With the new routes, most journeys will be possible on a single bus.",
      "The authority says the change will reduce travel time by up to forty percent.",
      "New electric buses will be used on six of the ten routes.",
      "These buses produce no direct emissions and are significantly quieter.",
      "Monthly travel passes will also be available at a reduced price for students and senior citizens.",
      "The transport minister said this is part of a broader plan to reduce traffic congestion.",
      "A mobile app will be launched to help passengers plan their journeys in real time.",
      "Public feedback on the new routes can be submitted on the authority's website until Friday.",
      "The changes are expected to benefit over half a million daily commuters.",
    ],
    quiz:[
      {q:"How much will the new routes reduce travel time?", opts:["Up to 20%","Up to 30%","Up to 40%","Up to 50%"], ans:2, exp:"'The change will reduce travel time by up to forty percent.'"},
      {q:"What type of buses will be used on six of the routes?", opts:["Hybrid buses","Electric buses","Double-decker buses","Mini-buses"], ans:1, exp:"'New electric buses will be used on six of the ten routes.'"},
      {q:"Who will get travel passes at a reduced price?", opts:["Workers","Children under 12","Students and senior citizens","Government employees"], ans:2, exp:"'Monthly travel passes will also be available at a reduced price for students and senior citizens.'"},
    ]
  },

  { id:"a2n10", title:"A Farmer Uses Technology to Grow More Food", category:"News", level:"A2", dur:"4:10", durSec:250, xp:75,
    icon:"🌾", color:"rgba(245,200,66,.12)", border:"rgba(245,200,66,.25)",
    transcript:[
      "A farmer from a small village in northern Bangladesh is making headlines.",
      "Rahim Mia has started using smartphone apps and sensors to manage his crops.",
      "The sensors measure soil moisture, temperature, and nutrients in real time.",
      "The data is sent to his phone, where an app tells him exactly when to water or fertilise.",
      "Before using the technology, Rahim lost about thirty percent of his crop every year.",
      "Last season, his losses dropped to just five percent.",
      "His rice and vegetable yields have also increased by nearly sixty percent.",
      "Rahim says he now spends less time guessing and more time planning.",
      "A local agricultural NGO helped him get the equipment at a subsidised cost.",
      "They have trained fifty other farmers in the region to use the same system.",
      "Rahim hopes that technology will help more farmers escape poverty.",
      "'Our land is the same,' he says. 'But now we know how to listen to it.'",
    ],
    quiz:[
      {q:"What do the sensors measure?", opts:["Rainfall and wind speed","Soil moisture, temperature, and nutrients","Air quality and humidity","Plant height and colour"], ans:1, exp:"'The sensors measure soil moisture, temperature, and nutrients in real time.'"},
      {q:"By how much did Rahim's losses drop after using the technology?", opts:["From 30% to 10%","From 30% to 5%","From 20% to 5%","From 40% to 10%"], ans:1, exp:"'His losses dropped to just five percent' from thirty percent."},
      {q:"How many other farmers have been trained to use the system?", opts:["Twenty","Thirty","Forty","Fifty"], ans:3, exp:"'They have trained fifty other farmers in the region.'"},
    ]
  },

];

/* ── Category list (auto-derived) ── */
export const CATEGORIES = ["All", ...new Set(LESSONS.map(l => l.category))];

/* ── Level summary ── */
export const LEVEL_COUNT = LESSONS.reduce((acc, l) => {
  acc[l.level] = (acc[l.level] || 0) + 1;
  return acc;
}, {});
