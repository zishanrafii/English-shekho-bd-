/* ══════════════════════════════════════════════════
   speaking-data.js — English Shekho
   Static data: prompts, words, twisters, topics etc.
   নতুন content যোগ করতে হলে শুধু এই file edit করুন।
══════════════════════════════════════════════════ */

export const PROMPTS = [
  {en:"Introduce yourself in English.",         bn:"নিজেকে English-এ পরিচয় করিয়ে দিন।"},
  {en:"Describe your hometown.",                bn:"আপনার শহর বা গ্রামের বর্ণনা দিন।"},
  {en:"Talk about your favourite hobby.",       bn:"আপনার প্রিয় hobby সম্পর্কে বলুন।"},
  {en:"What do you want to do in the future?", bn:"ভবিষ্যতে আপনি কী করতে চান?"},
  {en:"Describe your best friend.",             bn:"আপনার সেরা বন্ধুর সম্পর্কে বলুন।"},
  {en:"What is your daily routine?",            bn:"আপনার প্রতিদিনের রুটিন কী?"},
  {en:"Talk about a memorable experience.",     bn:"একটি স্মরণীয় অভিজ্ঞতার কথা বলুন।"},
  {en:"Why are you learning English?",          bn:"কেন আপনি English শিখছেন?"},
  {en:"Describe your favourite food.",          bn:"আপনার প্রিয় খাবারের বর্ণনা দিন।"},
  {en:"What do you think about social media?",  bn:"Social media সম্পর্কে আপনার মতামত কী?"},
  {en:"Describe a place you would love to visit.", bn:"এমন একটি জায়গার বর্ণনা দিন যেখানে আপনি যেতে চান।"},
  {en:"Talk about your favourite movie or book.", bn:"আপনার প্রিয় movie বা book সম্পর্কে বলুন।"},
];

export const DAILY_TASKS_DEF = [
  {id:"dt1", name:"Read aloud 5 sentences",      sub:"৫টি sentence জোরে পড়ুন"},
  {id:"dt2", name:"Record a 1-min introduction", sub:"১ মিনিট নিজেকে introduce করুন"},
  {id:"dt3", name:"Pronounce 10 new words",      sub:"১০টি নতুন শব্দ উচ্চারণ করুন"},
  {id:"dt4", name:"Listen & repeat 3 phrases",   sub:"৩টি phrase শুনে repeat করুন"},
  {id:"dt5", name:"Answer today's prompt",       sub:"আজকের prompt-এর উত্তর দিন"},
];

export const PRONUN_WORDS = [
  {word:"Comfortable",   phonetic:"/ˈkʌmftəbl/",      meaning:"আরামদায়ক",     tips:["'Comf-ta-bl' — মাঝের 'or' নীরব","৩ syllable: COMF-ta-bl","Common mistake: 'com-FOR-ta-ble'"],       diff:"medium"},
  {word:"Pronunciation", phonetic:"/prəˌnʌnsiˈeɪʃn/", meaning:"উচ্চারণ",      tips:["'pro-NUN-see-AY-shun'","৫ syllable word","'Pronounce' থেকে আলাদা!"],                               diff:"hard"},
  {word:"Regularly",     phonetic:"/ˈreɡjələrli/",     meaning:"নিয়মিত",      tips:["'REG-yuh-ler-lee'","৪ syllable","র‍্যাগ-ইউ-লার-লি"],                                               diff:"medium"},
  {word:"Wednesday",     phonetic:"/ˈwenzdeɪ/",        meaning:"বুধবার",       tips:["'WENZ-day' — মাঝের 'd' নীরব","Spelling-এ 'd' আছে কিন্তু উচ্চারণে নেই"],                           diff:"easy"},
  {word:"Clothes",       phonetic:"/kloʊðz/",           meaning:"পোশাক",        tips:["'Klohz' — 'e' নীরব","th sound: voiced /ð/","'Close' এর মতো শোনায়"],                               diff:"easy"},
  {word:"Particularly",  phonetic:"/pəˈtɪkjələrli/",   meaning:"বিশেষভাবে",   tips:["'par-TIK-yuh-ler-lee'","৫ syllable","প্রায়ই ভুল: 'par-TIC-u-lar-ly'"],                             diff:"hard"},
  {word:"Thorough",      phonetic:"/ˈθʌrə/",            meaning:"পুঙ্খানুপুঙ্খ",tips:["'THUR-oh'","gh নীরব","'though' এর মতো শেষ হয়"],                                                   diff:"hard"},
  {word:"Inevitable",    phonetic:"/ɪnˈevɪtəbl/",      meaning:"অনিবার্য",     tips:["'in-EV-i-ta-bl'","stress দ্বিতীয় syllable-এ","৫ syllable"],                                      diff:"hard"},
  {word:"Entrepreneur",  phonetic:"/ˌɒntrəprəˈnɜː/",   meaning:"উদ্যোক্তা",   tips:["'on-truh-pruh-NUR'","French origin","শেষ 't' নীরব"],                                              diff:"hard"},
  {word:"Vegetable",     phonetic:"/ˈvedʒtəbl/",        meaning:"সবজি",         tips:["'VEJ-ta-bl' — মাত্র ৩ syllable","'vege-table' না!","Common mistake: 4 syllable বলা"],             diff:"medium"},
  {word:"February",      phonetic:"/ˈfebrueri/",         meaning:"ফেব্রুয়ারি",  tips:["'FEB-roo-air-ee'","প্রথম 'r' প্রায়ই skip করা হয়","৪ syllable"],                                  diff:"medium"},
  {word:"Hierarchy",     phonetic:"/ˈhaɪərɑːki/",       meaning:"শ্রেণিবিন্যাস",tips:["'HY-uh-rar-kee'","৪ syllable","'hier' = 'higher' এর মতো"],                                       diff:"hard"},
];

export const SCORER_SENTENCES = [
  {en:"She sells seashells by the seashore.",          bn:"সে সমুদ্রতীরে শামুক বিক্রি করে।"},
  {en:"How much wood would a woodchuck chuck?",        bn:"একটি কাঠবিড়ালি কতটুকু কাঠ কাটতে পারে?"},
  {en:"The weather is quite pleasant today.",          bn:"আজকের আবহাওয়া বেশ আনন্দদায়ক।"},
  {en:"I would like to improve my pronunciation.",     bn:"আমি আমার উচ্চারণ উন্নত করতে চাই।"},
  {en:"Practice makes a man perfect.",                 bn:"অনুশীলনে মানুষ পারদর্শী হয়।"},
  {en:"English is an international language.",         bn:"ইংরেজি একটি আন্তর্জাতিক ভাষা।"},
  {en:"Reading aloud helps improve fluency.",          bn:"জোরে পড়লে fluency উন্নত হয়।"},
  {en:"Confidence is the key to success.",             bn:"আত্মবিশ্বাস সাফল্যের চাবিকাঠি।"},
  {en:"I enjoy learning new words every day.",         bn:"আমি প্রতিদিন নতুন শব্দ শিখতে ভালোবাসি।"},
  {en:"Speaking clearly is more important than speaking fast.", bn:"দ্রুত বলার চেয়ে স্পষ্টভাবে বলা বেশি গুরুত্বপূর্ণ।"},
];

export const TONGUE_TWISTERS = [
  {text:"She sells seashells by the seashore.",                                                                      tip:"'sh' sound-এ focus করুন। ধীরে শুরু করুন।",          level:"Easy",   xp:30},
  {text:"Peter Piper picked a peck of pickled peppers.",                                                             tip:"'p' sound repeat হচ্ছে। ঠোঁট একসাথে করুন।",        level:"Easy",   xp:30},
  {text:"Red lorry, yellow lorry, red lorry, yellow lorry.",                                                        tip:"'r' ও 'l' আলাদা করুন — বাংলায় দুটো প্রায় একই!", level:"Medium", xp:50},
  {text:"How much wood would a woodchuck chuck if a woodchuck could chuck wood?",                                    tip:"'w' ও 'ch' এ concentrate করুন।",                    level:"Medium", xp:50},
  {text:"Betty Botter bought some butter, but the butter was bitter.",                                               tip:"'b' ও 't' sound দ্রুত switch করুন।",                level:"Hard",   xp:75},
  {text:"Fuzzy Wuzzy was a bear, Fuzzy Wuzzy had no hair, Fuzzy Wuzzy wasn't very fuzzy, was he?",                 tip:"'f' ও 'z' কম্বিনেশন চ্যালেঞ্জিং।",                 level:"Hard",   xp:75},
  {text:"Unique New York, you know you need unique New York.",                                                       tip:"'n' ও 'y' switch করুন দ্রুত।",                      level:"Medium", xp:50},
  {text:"Lesser leather never weathered wetter weather better.",                                                     tip:"'l', 'r', 'w', 'th' — চারটা sound একসাথে!",        level:"Hard",   xp:75},
];

export const SHADOWING_PHRASES = [
  {text:"Good morning! How are you doing today?",                                                                     bn:"শুভ সকাল! আজ আপনি কেমন আছেন?",                                                                    level:"A1", topic:"Greetings",    levelColor:"rgba(45,212,191,.12)",  levelBorder:"rgba(45,212,191,.3)"},
  {text:"I'm really excited about learning English every single day.",                                               bn:"আমি প্রতিদিন English শেখা নিয়ে সত্যিই উত্তেজিত।",                                                 level:"A2", topic:"Emotions",     levelColor:"rgba(245,200,66,.12)",  levelBorder:"rgba(245,200,66,.3)"},
  {text:"Could you please repeat that more slowly? I didn't quite catch it.",                                        bn:"একটু ধীরে বলবেন কি? আমি ঠিকমতো বুঝতে পারিনি।",                                                   level:"B1", topic:"Conversation",  levelColor:"rgba(129,140,248,.12)", levelBorder:"rgba(129,140,248,.3)"},
  {text:"The rapid advancement of technology is fundamentally transforming our daily lives.",                         bn:"প্রযুক্তির দ্রুত অগ্রগতি আমাদের দৈনন্দিন জীবনকে মৌলিকভাবে পরিবর্তন করছে।",                       level:"B2", topic:"Technology",    levelColor:"rgba(251,146,60,.12)",  levelBorder:"rgba(251,146,60,.3)"},
  {text:"Despite the challenges, I remain optimistic about the future.",                                             bn:"চ্যালেঞ্জ সত্ত্বেও, আমি ভবিষ্যৎ নিয়ে আশাবাদী।",                                                 level:"B1", topic:"Mindset",       levelColor:"rgba(52,211,153,.12)",  levelBorder:"rgba(52,211,153,.3)"},
  {text:"Effective communication requires not only speaking clearly but also listening actively.",                    bn:"কার্যকর যোগাযোগের জন্য শুধু স্পষ্টভাবে বলাই নয়, সক্রিয়ভাবে শোনাও দরকার।",                     level:"C1", topic:"Communication", levelColor:"rgba(251,113,133,.12)", levelBorder:"rgba(251,113,133,.3)"},
  {text:"I usually wake up at six in the morning and have breakfast with my family.",                                bn:"আমি সাধারণত সকাল ছটায় উঠি এবং পরিবারের সাথে নাস্তা করি।",                                          level:"A2", topic:"Daily Life",    levelColor:"rgba(167,139,250,.12)", levelBorder:"rgba(167,139,250,.3)"},
  {text:"If I could travel anywhere in the world, I would choose Japan for its unique culture.",                     bn:"যদি বিশ্বের যেকোনো জায়গায় যেতে পারতাম, আমি জাপানকে বেছে নিতাম তার অনন্য সংস্কৃতির জন্য।",         level:"B2", topic:"Travel",        levelColor:"rgba(96,165,250,.12)",  levelBorder:"rgba(96,165,250,.3)"},
];

export const TOPICS = [
  {icon:"🏠", title:"My Home & Family",   desc:"বাড়ি ও পরিবার নিয়ে কথা বলুন।",          level:"A1", xp:50,  color:"rgba(45,212,191,.12)",  border:"rgba(45,212,191,.25)"},
  {icon:"🎓", title:"Education & School", desc:"পড়াশোনা ও স্কুল নিয়ে আলোচনা।",         level:"A2", xp:75,  color:"rgba(245,200,66,.12)",  border:"rgba(245,200,66,.25)"},
  {icon:"💼", title:"Work & Career",      desc:"কাজ ও ক্যারিয়ার নিয়ে বলুন।",            level:"B1", xp:100, color:"rgba(129,140,248,.12)", border:"rgba(129,140,248,.25)"},
  {icon:"🌍", title:"Environment",        desc:"পরিবেশ ও climate change নিয়ে।",           level:"B1", xp:100, color:"rgba(52,211,153,.12)",  border:"rgba(52,211,153,.25)"},
  {icon:"📱", title:"Technology & Life",  desc:"Technology কীভাবে জীবন বদলাচ্ছে।",       level:"B2", xp:125, color:"rgba(251,146,60,.12)",  border:"rgba(251,146,60,.25)"},
  {icon:"🏛️", title:"Culture & Society",  desc:"সংস্কৃতি ও সমাজ নিয়ে opinion দিন।",    level:"B2", xp:125, color:"rgba(251,113,133,.12)", border:"rgba(251,113,133,.25)"},
  {icon:"🧠", title:"Critical Thinking",  desc:"কোনো বিষয়ে argue করতে শিখুন।",           level:"C1", xp:150, color:"rgba(167,139,250,.12)", border:"rgba(167,139,250,.25)"},
  {icon:"🎤", title:"Public Speaking",    desc:"বড় audience-এর সামনে speak করুন।",        level:"C1", xp:150, color:"rgba(96,165,250,.12)",  border:"rgba(96,165,250,.25)"},
  {icon:"🤝", title:"Negotiations",       desc:"কোনো বিষয়ে negotiate করতে শিখুন।",       level:"C1", xp:150, color:"rgba(52,211,153,.12)",  border:"rgba(52,211,153,.25)"},
  {icon:"📰", title:"News & Current Events",desc:"সংবাদ ও বর্তমান ঘটনা নিয়ে কথা বলুন।",level:"B2", xp:125, color:"rgba(245,200,66,.12)",  border:"rgba(245,200,66,.25)"},
];

export const CHALLENGES_DEF = [
  {id:"ch_7day",    icon:"🔥", title:"7-Day Streak",        desc:"টানা ৭ দিন speaking practice করুন।",      xpReward:200, target:7,  unit:"days",      color:"rgba(251,146,60,.08)",  border:"rgba(251,146,60,.25)"},
  {id:"ch_2min",    icon:"🎤", title:"2-Min Speech",         desc:"যেকোনো topic-এ ২ মিনিট কথা বলুন।",      xpReward:100, target:1,  unit:"sessions",  color:"rgba(129,140,248,.08)", border:"rgba(129,140,248,.25)"},
  {id:"ch_10words", icon:"🗣️", title:"Pronunciation Master", desc:"Scorer-এ ১০টি sentence সঠিকভাবে বলুন।", xpReward:75,  target:10, unit:"sentences", color:"rgba(45,212,191,.08)",  border:"rgba(45,212,191,.25)"},
  {id:"ch_shadow5", icon:"🎧", title:"Shadowing Champion",   desc:"৫টি shadowing phrase complete করুন।",    xpReward:80,  target:5,  unit:"phrases",   color:"rgba(251,113,133,.08)", border:"rgba(251,113,133,.25)"},
  {id:"ch_twister", icon:"👅", title:"Twister Expert",       desc:"সব Tongue Twisters practice করুন।",      xpReward:60,  target:6,  unit:"twisters",  color:"rgba(52,211,153,.08)",  border:"rgba(52,211,153,.25)"},
  {id:"ch_30sess",  icon:"🏆", title:"30 Sessions",          desc:"মোট ৩০টি speaking session complete করুন।",xpReward:300, target:30, unit:"sessions",  color:"rgba(245,200,66,.08)",  border:"rgba(245,200,66,.25)"},
];
