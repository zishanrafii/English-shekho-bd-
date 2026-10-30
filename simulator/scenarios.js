/* ═══════════════════════════════════════════════════════════
   Real-life scenarios — pure data (+ tiny helpers).
   level      [min,max] CEFR index (A1=0 … C2=5) the scenario suits best
   objectives what the learner is trying to achieve. DETERMINISTIC: a regex on the learner's own words decides.
   phrases    useful phrases to borrow
   guided     partner lines for the offline "Guided" mode (the AI mode generates its own lines)
   The AI route (functions/index.js) keeps its OWN copy of role/setting/goal, so the client can never supply the persona.
   ═══════════════════════════════════════════════════════════ */
export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const S = (id, icon, title, titleBn, level, setting, settingBn, learner, partner, objectives, phrases, opening, guided) =>
  ({ id, icon, title, titleBn, level, setting, settingBn, learner, partner, objectives, phrases, opening, guided });
const O = (id, bn, rx, example) => ({ id, bn, rx, example });
const G = (say, hintBn, sample) => ({ say, hintBn, sample });

export const SCENARIOS = [
  S("interview", "💼", "Job Interview", "চাকরির ইন্টারভিউ", [2, 4], "A job interview for an office assistant position.", "একটি অফিস-সহকারী পদের ইন্টারভিউ।", "the candidate", "the interviewer",
    [O("intro", "নিজের পরিচয় দিন", "\\b(my name is|i am|i'm|this is)\\b", "My name is Rahim."), O("experience", "অভিজ্ঞতা বা দক্ষতার কথা বলুন", "\\b(experience|worked|work as|skills?|good at|studied|degree)\\b", "I have two years of experience."), O("why", "কেন এই চাকরি চান তা বলুন", "\\b(because|i want|i would like|interested in|motivated|opportunity)\\b", "I want this job because I enjoy teamwork."), O("close", "ধন্যবাদ জানিয়ে শেষ করুন", "\\b(thank you|thanks|appreciate)\\b", "Thank you for your time.")],
    ["I have experience in…", "I am good at…", "I am interested in this position because…", "My strengths are…", "Thank you for the opportunity."],
    "Good morning. Please have a seat. Could you tell me a little about yourself?",
    [G("Thank you. What experience do you have for this position?", "অভিজ্ঞতার কথা বলুন", "I have two years of experience in an office."), G("Interesting. Why do you want to work for our company?", "কেন চান তা বলুন", "I want this job because I like teamwork."), G("What would you say are your greatest strengths?", "আপনার শক্তির দিক", "My strengths are honesty and hard work."), G("Do you have any questions for us?", "একটি প্রশ্ন করুন বা ধন্যবাদ দিন", "Thank you. When will I hear from you?"), G("We will contact you next week. It was nice meeting you.", "ধন্যবাদ জানিয়ে শেষ করুন", "Thank you very much for your time.")]),
  S("airport", "✈️", "At the Airport", "বিমানবন্দরে", [1, 3], "Checking in for an international flight.", "আন্তর্জাতিক ফ্লাইটের চেক-ইন।", "the passenger", "the check-in agent",
    [O("flight", "কোন ফ্লাইটে যাচ্ছেন বলুন", "\\b(flight|going to|travel(l)?ing to|fly(ing)? to|destination)\\b", "I am flying to Dubai."), O("bag", "ব্যাগ নিয়ে কথা বলুন", "\\b(bag|bags|luggage|suitcase|baggage|carry)\\b", "I have one suitcase."), O("seat", "আসনের পছন্দ জানান", "\\b(window|aisle|seat)\\b", "I would like a window seat."), O("thanks", "ধন্যবাদ দিন", "\\b(thank you|thanks)\\b", "Thank you.")],
    ["I have a flight to…", "I have one bag to check in.", "Could I have a window seat, please?", "What time does boarding start?", "Which gate is it?"],
    "Hello. May I see your passport and ticket, please?",
    [G("Thank you. Where are you flying to today?", "গন্তব্য বলুন", "I am flying to Dubai."), G("Do you have any bags to check in?", "ব্যাগের কথা বলুন", "Yes, I have one suitcase."), G("Would you prefer a window or an aisle seat?", "আসন বাছুন", "A window seat, please."), G("Here is your boarding pass. Boarding starts at 6:30 at gate 12.", "গেট বা সময় নিশ্চিত করুন", "Which gate did you say?"), G("Have a pleasant flight!", "ধন্যবাদ জানান", "Thank you very much.")]),
  S("hotel", "🏨", "Hotel Check-in", "হোটেলে চেক-ইন", [1, 3], "Arriving at a hotel with a reservation.", "রিজার্ভেশন নিয়ে হোটেলে পৌঁছানো।", "the guest", "the receptionist",
    [O("booking", "বুকিং-এর কথা বলুন", "\\b(reservation|booking|booked|reserved)\\b", "I have a reservation under Rahim."), O("nights", "কত রাত থাকবেন বলুন", "\\b(night|nights|days?|week|stay(ing)?)\\b", "I am staying for three nights."), O("ask", "একটি সুবিধা সম্পর্কে জিজ্ঞাসা করুন", "\\b(wi-?fi|breakfast|pool|parking|gym|checkout|check-out|check out)\\b", "Is breakfast included?"), O("thanks", "ধন্যবাদ দিন", "\\b(thank you|thanks)\\b", "Thank you.")],
    ["I have a reservation under the name…", "I will stay for … nights.", "Is breakfast included?", "What time is check-out?", "Could you help me with my bags?"],
    "Good evening, welcome to the Grand Hotel. How can I help you?",
    [G("Certainly. Could I have your name, please?", "নাম ও বুকিং বলুন", "My name is Rahim. I have a reservation."), G("Thank you. How many nights will you be staying?", "কত রাত থাকবেন", "I will stay for three nights."), G("Your room is on the fourth floor. Is there anything else you need?", "একটি প্রশ্ন করুন", "Is breakfast included?"), G("Breakfast is served from seven to ten. Here is your key.", "ধন্যবাদ জানান", "Thank you very much.")]),
  S("restaurant", "🍽️", "At a Restaurant", "রেস্তোরাঁয়", [0, 2], "Ordering a meal at a restaurant.", "রেস্তোরাঁয় খাবার অর্ডার করা।", "the customer", "the waiter",
    [O("order", "খাবার অর্ডার করুন", "\\b(i('| wi)?ll have|i would like|i'd like|can i (have|get)|could i have|order)\\b", "I would like the chicken curry."), O("drink", "পানীয়ের কথা বলুন", "\\b(water|tea|coffee|juice|drink|cola|lemonade)\\b", "A glass of water, please."), O("please", "ভদ্রভাবে 'please' বলুন", "\\bplease\\b", "Please bring the bill."), O("bill", "বিল চান", "\\b(bill|check|pay)\\b", "Could I have the bill, please?")],
    ["I would like…", "Can I have…, please?", "What do you recommend?", "Is it spicy?", "Could we have the bill, please?"],
    "Good afternoon! Here is the menu. Are you ready to order?",
    [G("What would you like to eat?", "খাবার অর্ডার করুন", "I would like the chicken curry, please."), G("Would you like something to drink?", "পানীয় বলুন", "A glass of water, please."), G("Your food will be ready soon. Is everything all right?", "খাবার নিয়ে মন্তব্য করুন", "Yes, it is delicious."), G("Would you like anything else?", "বিল চান", "No, thank you. Could I have the bill, please?")]),
  S("doctor", "🩺", "At the Doctor", "ডাক্তারের কাছে", [1, 3], "Describing symptoms to a doctor.", "ডাক্তারকে উপসর্গ বলা।", "the patient", "the doctor",
    [O("symptom", "কী সমস্যা তা বলুন", "\\b(pain|hurt|hurts|fever|cough|headache|sore|ache|dizzy|sick|cold)\\b", "I have a headache."), O("duration", "কতদিন ধরে বলুন", "\\b(since|for (a|an|two|three|\\d+)|days?|weeks?|yesterday|last (night|week))\\b", "I have had it for two days."), O("medicine", "ওষুধ সম্পর্কে জিজ্ঞাসা করুন", "\\b(medicine|tablet|pills?|take|prescription|medication)\\b", "Should I take any medicine?"), O("thanks", "ধন্যবাদ দিন", "\\b(thank you|thanks)\\b", "Thank you, doctor.")],
    ["I have a pain in my…", "I have had a fever for … days.", "It hurts when I…", "Should I take any medicine?", "How often should I take it?"],
    "Hello, please sit down. What seems to be the problem?",
    [G("I see. How long have you had these symptoms?", "কতদিন ধরে", "I have had it for two days."), G("Do you have any other symptoms, like a fever or a cough?", "অন্য উপসর্গ বলুন", "Yes, I also have a cough."), G("I will give you a prescription. You should rest and drink plenty of water.", "ওষুধ নিয়ে প্রশ্ন", "How often should I take the medicine?"), G("Take it twice a day after meals. Come back if you don't feel better.", "ধন্যবাদ জানান", "Thank you, doctor.")]),
  S("office", "🏢", "At the Office", "অফিসে", [2, 4], "Talking to a colleague about a task and a deadline.", "সহকর্মীর সাথে কাজ ও সময়সীমা নিয়ে কথা।", "a team member", "a colleague",
    [O("status", "কাজের অবস্থা জানান", "\\b(finished|completed|working on|done|started|progress|almost)\\b", "I have almost finished the report."), O("deadline", "সময়সীমা নিয়ে কথা বলুন", "\\b(deadline|due|by (monday|tuesday|wednesday|thursday|friday|tomorrow|today|the end)|tomorrow|friday)\\b", "I can send it by Friday."), O("help", "সাহায্য চান বা দিন", "\\b(help|support|assist|could you|can you|need)\\b", "Could you help me with the figures?"), O("polite", "ভদ্রভাবে শেষ করুন", "\\b(thank you|thanks|appreciate)\\b", "Thanks for your help.")],
    ["I am working on…", "I will send it by…", "Could you help me with…?", "I will keep you updated.", "Thanks for your support."],
    "Hi! Do you have a minute? I wanted to ask about the monthly report.",
    [G("Great. How is the report going?", "কাজের অবস্থা জানান", "I have almost finished it."), G("When can you send it to the manager?", "সময়সীমা বলুন", "I can send it by Friday."), G("Is there anything you need from me?", "সাহায্য চান", "Could you check the figures?"), G("Sure, no problem. Let me know if anything changes.", "ধন্যবাদ জানান", "Thanks, I will keep you updated.")]),
  S("presentation", "📊", "Giving a Presentation", "প্রেজেন্টেশন", [2, 5], "Starting a short presentation to your team.", "দলের সামনে ছোট প্রেজেন্টেশন শুরু করা।", "the presenter", "a team member",
    [O("greet", "শ্রোতাদের স্বাগত জানান", "\\b(good (morning|afternoon)|welcome|hello|thank you for (coming|joining))\\b", "Good morning everyone, thank you for joining."), O("topic", "বিষয়টি পরিচয় করান", "\\b(today|talk about|present|topic|about|going to)\\b", "Today I am going to talk about our sales."), O("point", "একটি মূল পয়েন্ট বলুন", "\\b(first|firstly|second|also|important|main|key|result|increase|decrease)\\b", "The main result is a ten percent increase."), O("end", "প্রশ্ন আমন্ত্রণ জানিয়ে শেষ করুন", "\\b(questions?|thank you|thanks)\\b", "Thank you. Are there any questions?")],
    ["Today I am going to talk about…", "Firstly… Secondly…", "The key point is…", "As you can see…", "Are there any questions?"],
    "Everyone is ready. Whenever you are, please begin your presentation.",
    [G("That sounds interesting. What is the main topic?", "বিষয় বলুন", "Today I am going to talk about our sales."), G("Could you share one important result?", "একটি মূল ফলাফল বলুন", "The main result is a ten percent increase."), G("Thank you. That is very clear.", "প্রশ্ন আমন্ত্রণ জানান", "Thank you. Are there any questions?"), G("Yes, one question: what is the next step?", "উত্তর দিন", "The next step is to start the new plan.")]),
  S("phone", "📞", "A Phone Call", "ফোনে কথা", [1, 3], "Calling a company to ask for a person.", "কোনো কোম্পানিতে ফোন করে একজনকে চাওয়া।", "the caller", "the receptionist",
    [O("intro", "নিজের পরিচয় দিন", "\\b(this is|my name is|i am|i'm)\\b", "This is Rahim speaking."), O("ask", "কারও সাথে কথা বলতে চান", "\\b(speak to|talk to|may i speak|could i speak|is .* there|looking for)\\b", "Could I speak to Mr. Khan, please?"), O("message", "বার্তা রেখে যান", "\\b(message|call (me )?back|leave|tell him|tell her)\\b", "Could you ask him to call me back?"), O("thanks", "ধন্যবাদ দিন", "\\b(thank you|thanks)\\b", "Thank you for your help.")],
    ["This is … speaking.", "Could I speak to…, please?", "Could you ask him to call me back?", "Could you repeat that, please?", "Thank you for your help."],
    "Hello, Sunrise Company. How can I help you?",
    [G("I am sorry, Mr. Khan is in a meeting right now.", "বার্তা রাখুন", "Could you ask him to call me back?"), G("Of course. May I have your name and number?", "নাম ও নম্বর দিন", "My name is Rahim and my number is 0171."), G("Could you spell your name, please?", "নাম বানান করুন", "R-A-H-I-M."), G("Thank you. I will pass on your message.", "ধন্যবাদ জানান", "Thank you for your help.")]),
  S("university", "🎓", "University Admission", "বিশ্ববিদ্যালয়ে ভর্তি", [2, 4], "Talking to an admissions officer about a course.", "ভর্তি-কর্মকর্তার সাথে কোর্স নিয়ে কথা।", "the applicant", "the admissions officer",
    [O("course", "কোন কোর্সে আগ্রহী বলুন", "\\b(course|program(me)?|degree|major|study|bachelor|master|subject)\\b", "I would like to study computer science."), O("background", "আপনার পড়াশোনার পটভূমি বলুন", "\\b(graduated|completed|studied|high school|college|result|grade|gpa)\\b", "I completed high school last year."), O("ask", "ফি বা ভর্তির সময় জিজ্ঞাসা করুন", "\\b(fee|fees|cost|scholarship|deadline|apply|application|when)\\b", "What is the application deadline?"), O("thanks", "ধন্যবাদ দিন", "\\b(thank you|thanks)\\b", "Thank you for the information.")],
    ["I am interested in the … programme.", "I have completed…", "What are the admission requirements?", "Is there a scholarship?", "Thank you for the information."],
    "Welcome to the admissions office. How can I help you today?",
    [G("Which course are you interested in?", "কোর্সের নাম বলুন", "I would like to study computer science."), G("Could you tell me about your education so far?", "পড়াশোনা বলুন", "I completed high school last year."), G("The application closes on the thirtieth of June. Do you have any questions?", "একটি প্রশ্ন করুন", "Is there a scholarship?"), G("Yes, there are scholarships based on your results.", "ধন্যবাদ জানান", "Thank you for the information.")]),
  S("shopping", "🛍️", "Shopping", "কেনাকাটা", [0, 2], "Buying a shirt in a clothes shop.", "কাপড়ের দোকানে শার্ট কেনা।", "the customer", "the shop assistant",
    [O("want", "কী কিনতে চান বলুন", "\\b(looking for|i('d| would) like|i want|do you have|need)\\b", "I am looking for a blue shirt."), O("size", "মাপ বা রঙ নিয়ে কথা বলুন", "\\b(size|small|medium|large|colou?r|blue|black|white|red|green)\\b", "Do you have it in medium?"), O("price", "দাম জিজ্ঞাসা করুন", "\\b(how much|price|cost|cheaper|discount)\\b", "How much is it?"), O("buy", "কেনার সিদ্ধান্ত জানান", "\\b(i('ll| will) take|i'll buy|i will buy|buy it|take it)\\b", "I will take it.")],
    ["I am looking for…", "Do you have this in a larger size?", "How much is it?", "Can I try it on?", "I will take it."],
    "Hello! Welcome to our shop. Can I help you find something?",
    [G("Of course. What size are you?", "মাপ বলুন", "Medium, please."), G("This one is nice. It is twelve hundred taka.", "দাম নিয়ে কথা বলুন", "How much is it? Is there a discount?"), G("Would you like to try it on?", "সিদ্ধান্ত জানান", "Yes, please. I think I will take it."), G("Great choice! Will that be cash or card?", "ধন্যবাদ জানান", "Cash, please. Thank you.")]),
  S("meeting", "🗓️", "A Team Meeting", "টিম মিটিং", [3, 5], "Sharing an opinion in a project meeting.", "প্রকল্পের মিটিংয়ে মত জানানো।", "a team member", "the meeting chair",
    [O("opinion", "নিজের মত জানান", "\\b(i think|in my opinion|i believe|i feel|from my point of view|it seems)\\b", "In my opinion, we should start earlier."), O("reason", "মতের পক্ষে যুক্তি দিন", "\\b(because|since|as|therefore|so that|due to)\\b", "Because we have limited time."), O("agree", "অন্যের সাথে একমত বা ভিন্নমত হোন", "\\b(i agree|i disagree|good point|i see your point|however|on the other hand)\\b", "I see your point, however…"), O("action", "পরের পদক্ষেপ প্রস্তাব করুন", "\\b(should|let's|we could|we need to|next step|propose|suggest)\\b", "I suggest that we meet again on Monday.")],
    ["In my opinion…", "I see your point, however…", "I would suggest that we…", "Could you clarify…?", "Let's summarise the next steps."],
    "Thanks for joining. Let's start with the new schedule. What are your thoughts?",
    [G("Interesting. Why do you think so?", "যুক্তি দিন", "Because we have limited time."), G("Some of us disagree. How would you respond?", "ভিন্নমতের জবাব দিন", "I see your point, however the deadline is close."), G("What should be the next step?", "পরের পদক্ষেপ প্রস্তাব করুন", "I suggest that we meet again on Monday."), G("Good. Let's do that.", "সমাপ্তি", "Thank you everyone.")]),
  S("travel", "🧳", "Asking for Directions", "পথ জিজ্ঞাসা", [0, 2], "You are lost in a new city and ask for help.", "নতুন শহরে পথ হারিয়ে সাহায্য চাওয়া।", "the tourist", "a local person",
    [O("excuse", "ভদ্রভাবে মনোযোগ আকর্ষণ করুন", "\\b(excuse me|sorry|pardon)\\b", "Excuse me, can you help me?"), O("where", "কোথায় যেতে চান বলুন", "\\b(where is|how (do|can) i get|looking for|way to|go to|get to|find)\\b", "How do I get to the train station?"), O("repeat", "দরকারে আবার বলতে বলুন", "\\b(repeat|slowly|again|understand|say that)\\b", "Could you speak more slowly, please?"), O("thanks", "ধন্যবাদ দিন", "\\b(thank you|thanks)\\b", "Thank you very much.")],
    ["Excuse me, where is…?", "How do I get to…?", "Is it far from here?", "Could you say that again, please?", "Thank you very much."],
    "Hi there! You look a little lost. Can I help you?",
    [G("Sure. Where do you want to go?", "গন্তব্য বলুন", "How do I get to the train station?"), G("Go straight for two blocks, then turn left at the bank.", "আবার বলতে বলুন", "Could you say that again, more slowly?"), G("Go straight, then turn left at the bank. It is about five minutes on foot.", "দূরত্ব জিজ্ঞাসা করুন", "Is it far from here?"), G("Not far at all. Have a nice day!", "ধন্যবাদ জানান", "Thank you very much.")]),
];

export const byId = (id) => SCENARIOS.find((s) => s.id === id) || null;
export const levelIdx = (l) => Math.max(0, LEVELS.indexOf(l));

/** How well a scenario suits a level: "fit" | "easier" | "harder". */
export function fitFor(s, level) {
  const i = levelIdx(level);
  return i < s.level[0] ? "harder" : i > s.level[1] ? "easier" : "fit";
}
/** Scenarios sorted so the ones that fit the learner come first. */
export function ordered(level) {
  const r = { fit: 0, easier: 1, harder: 2 };
  return [...SCENARIOS].sort((a, b) => r[fitFor(a, level)] - r[fitFor(b, level)]);
}
