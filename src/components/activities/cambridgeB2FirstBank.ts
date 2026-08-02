// Ready-made Cambridge B2 First (FCE) style exercises a teacher can drop straight
// into a salon activity instead of writing content from scratch or via AI.
// Original compositions written in the authentic B2 First exam style — not copied
// from any Cambridge paper.
import type { UseOfEnglishContent, OpenClozeContent, ReadingContent } from "./practiceActivity.types";

export type BankTipo = "use_of_english" | "open_cloze" | "reading";

export type BankEntry = {
  id: string;
  tipo: BankTipo;
  titulo: string;
  instrucciones: string;
  puntaje_maximo: number;
  contenido: UseOfEnglishContent | OpenClozeContent | ReadingContent;
};

export const CAMBRIDGE_B2_FIRST_BANK: BankEntry[] = [
  // --- Key Word Transformation (Use of English Part 4) ---
  {
    id: "kwt-1",
    tipo: "use_of_english",
    titulo: "Key Word Transformation — Set 1",
    instrucciones: "Completa la segunda oración para que signifique lo mismo que la primera, usando la palabra clave dada. No cambies la forma de la palabra clave. Usa entre 2 y 6 palabras.",
    puntaje_maximo: 12,
    contenido: {
      items: [
        { id: "1", sentence: "It isn't necessary for you to finish the report today.", keyword: "NEED", gapPrefix: "You ", gapSuffix: " the report today.", answer: "don't need to finish" },
        { id: "2", sentence: "The film was so boring that half the audience left early.", keyword: "SUCH", gapPrefix: "It was ", gapSuffix: " that half the audience left early.", answer: "such a boring film" },
        { id: "3", sentence: "I'm sorry I didn't bring an umbrella.", keyword: "WISH", gapPrefix: "I ", gapSuffix: " an umbrella.", answer: "wish I had brought" },
        { id: "4", sentence: "She started working here five years ago.", keyword: "SINCE", gapPrefix: "It ", gapSuffix: " she started working here.", answer: "is five years since" },
        { id: "5", sentence: "The coffee was too hot to drink.", keyword: "ENOUGH", gapPrefix: "The coffee wasn't ", gapSuffix: " drink.", answer: "cool enough to" },
        { id: "6", sentence: "I'd prefer to stay at home tonight instead of going to the party.", keyword: "RATHER", gapPrefix: "I would ", gapSuffix: " than go to the party.", answer: "rather stay at home" },
      ],
    } as UseOfEnglishContent,
  },
  {
    id: "kwt-2",
    tipo: "use_of_english",
    titulo: "Key Word Transformation — Set 2",
    instrucciones: "Completa la segunda oración para que signifique lo mismo que la primera, usando la palabra clave dada. No cambies la forma de la palabra clave. Usa entre 2 y 6 palabras.",
    puntaje_maximo: 12,
    contenido: {
      items: [
        { id: "1", sentence: "She hasn't eaten sushi before this evening.", keyword: "TIME", gapPrefix: "This is the ", gapSuffix: " she has eaten sushi.", answer: "first time" },
        { id: "2", sentence: "Despite feeling tired, Maria finished the marathon.", keyword: "ALTHOUGH", gapPrefix: "", gapSuffix: ", Maria finished the marathon.", answer: "Although she felt tired" },
        { id: "3", sentence: "Tom speaks French and he also speaks Italian.", keyword: "BOTH", gapPrefix: "Tom speaks ", gapSuffix: " Italian.", answer: "both French and" },
        { id: "4", sentence: "David played football every weekend when he was younger, but he doesn't anymore.", keyword: "USED", gapPrefix: "David ", gapSuffix: " football every weekend.", answer: "used to play" },
        { id: "5", sentence: "The teacher forced the students to redo their homework.", keyword: "MADE", gapPrefix: "The teacher ", gapSuffix: " redo their homework.", answer: "made the students" },
        { id: "6", sentence: "Although it was raining heavily, they decided to go for a walk.", keyword: "SPITE", gapPrefix: "They decided to go for a walk ", gapSuffix: " the heavy rain.", answer: "in spite of" },
      ],
    } as UseOfEnglishContent,
  },

  {
    id: "kwt-3",
    tipo: "use_of_english",
    titulo: "Key Word Transformation — Reported Speech Verb Patterns",
    instrucciones: "Completa la segunda oración para que signifique lo mismo que la primera, usando la palabra clave dada. No cambies la forma de la palabra clave. Usa entre 2 y 5 palabras, incluyendo la palabra clave.",
    puntaje_maximo: 15,
    contenido: {
      items: [
        { id: "1", sentence: "\"You put that frog on my chair, didn't you, Charlie?\" said Sally.", keyword: "OF", gapPrefix: "Sally accused Charlie ", gapSuffix: " a frog on her chair.", answer: "of putting" },
        { id: "2", sentence: "\"Stop misbehaving or you will be sent to the head teacher,\" the teacher said to Johnny.", keyword: "WARNED", gapPrefix: "The teacher ", gapSuffix: " or he would be sent to the head teacher.", answer: "warned Johnny to stop misbehaving" },
        { id: "3", sentence: "\"Please try to stay awake during the lesson,\" the teacher told the students.", keyword: "URGED", gapPrefix: "The teacher ", gapSuffix: " asleep during the lesson.", answer: "urged the students not to fall" },
        { id: "4", sentence: "Susan denied wasting her time at school when she was younger.", keyword: "NOT", gapPrefix: "Susan said ", gapSuffix: " her time at school when she was younger.", answer: "she had not wasted" },
        { id: "5", sentence: "\"Have you tidied up in the science lab?\" the chemistry teacher asked the students.", keyword: "TIDIED", gapPrefix: "The chemistry teacher wanted to know ", gapSuffix: " in the science lab.", answer: "whether the students had tidied up" },
        { id: "6", sentence: "\"I'm sorry, I've forgotten my homework,\" Nicholas said.", keyword: "APOLOGISED", gapPrefix: "Nicholas ", gapSuffix: " his homework.", answer: "apologised for forgetting" },
        { id: "7", sentence: "\"You should speak to your manager about the problem,\" Jane told me.", keyword: "ADVISED", gapPrefix: "Jane ", gapSuffix: " to my manager about the problem.", answer: "advised me to speak" },
        { id: "8", sentence: "\"I will help you prepare for the interview,\" Daniel told Lucy.", keyword: "OFFERED", gapPrefix: "Daniel ", gapSuffix: " for the interview.", answer: "offered to help Lucy prepare" },
        { id: "9", sentence: "\"Yes, I took the money from the desk,\" Paul said.", keyword: "ADMITTED", gapPrefix: "Paul ", gapSuffix: " the money from the desk.", answer: "admitted taking" },
        { id: "10", sentence: "\"I won't tell anyone your secret,\" Emily told me.", keyword: "PROMISED", gapPrefix: "Emily ", gapSuffix: " anyone my secret.", answer: "promised not to tell" },
        { id: "11", sentence: "\"Why don't we take a taxi to the airport?\" George said.", keyword: "SUGGESTED", gapPrefix: "George ", gapSuffix: " a taxi to the airport.", answer: "suggested taking" },
        { id: "12", sentence: "\"Please don't forget to send the application,\" my tutor said.", keyword: "REMINDED", gapPrefix: "My tutor ", gapSuffix: " the application.", answer: "reminded me to send" },
        { id: "13", sentence: "\"Could you carry this bag for me?\" Anna asked Tom.", keyword: "TO", gapPrefix: "Anna asked Tom ", gapSuffix: " the bag for her.", answer: "to carry" },
        { id: "14", sentence: "\"No, I won't clean the kitchen,\" Martin said.", keyword: "REFUSED", gapPrefix: "Martin ", gapSuffix: " the kitchen.", answer: "refused to clean" },
        { id: "15", sentence: "\"You must let me pay for dinner,\" Helen told her friends.", keyword: "INSISTED", gapPrefix: "Helen ", gapSuffix: " for dinner.", answer: "insisted on paying" },
      ],
    } as UseOfEnglishContent,
  },

  // --- Open Cloze (Use of English Part 2) ---
  {
    id: "oc-1",
    tipo: "open_cloze",
    titulo: "Open Cloze — The Benefits of Reading",
    instrucciones: "Lee el texto y completa cada espacio con UNA sola palabra.",
    puntaje_maximo: 12,
    contenido: {
      text: "Reading is one of ___ most enjoyable ways to spend free time, yet fewer people seem to be doing ___ nowadays. Many prefer to watch videos or scroll ___ social media instead, even ___ reading has been shown to improve concentration and reduce stress. According to a recent study, people ___ read regularly tend to have a wider vocabulary and a better understanding ___ other cultures. Some experts believe this is ___ books allow readers to imagine situations in ways that films cannot. ___ addition, reading before bed can help you fall asleep faster than looking at a screen. ___ you haven't picked up a book in a while, it might be worth ___ it a chance. You could start ___ just ten minutes a day and gradually increase the amount ___ time you spend reading.",
      gaps: [
        { id: "1", answer: "the", acceptableAnswers: "" },
        { id: "2", answer: "it", acceptableAnswers: "so" },
        { id: "3", answer: "through", acceptableAnswers: "" },
        { id: "4", answer: "though", acceptableAnswers: "" },
        { id: "5", answer: "who", acceptableAnswers: "that" },
        { id: "6", answer: "of", acceptableAnswers: "" },
        { id: "7", answer: "because", acceptableAnswers: "as, since" },
        { id: "8", answer: "In", acceptableAnswers: "" },
        { id: "9", answer: "If", acceptableAnswers: "" },
        { id: "10", answer: "giving", acceptableAnswers: "" },
        { id: "11", answer: "with", acceptableAnswers: "" },
        { id: "12", answer: "of", acceptableAnswers: "" },
      ],
    } as OpenClozeContent,
  },
  {
    id: "oc-2",
    tipo: "open_cloze",
    titulo: "Open Cloze — Working From Home",
    instrucciones: "Lee el texto y completa cada espacio con UNA sola palabra.",
    puntaje_maximo: 12,
    contenido: {
      text: "Working from home has become far more common ___ recent years, especially since many companies started allowing staff to choose ___ they work. ___ this arrangement clearly has advantages, such as saving time on travel, it also brings new challenges. ___ example, some employees find it hard to concentrate ___ there are constant distractions at home. Others miss the social side of office life and feel ___ if they were losing touch with their colleagues. ___ order to work successfully from home, experts recommend setting up a quiet space and sticking ___ a regular routine. It is ___ important to take short breaks throughout the day, ___ this helps maintain focus and energy levels. ___ course, working from home is not suitable for everyone, ___ it can be an excellent option for those who manage their time well.",
      gaps: [
        { id: "1", answer: "in", acceptableAnswers: "" },
        { id: "2", answer: "where", acceptableAnswers: "" },
        { id: "3", answer: "Although", acceptableAnswers: "While" },
        { id: "4", answer: "For", acceptableAnswers: "" },
        { id: "5", answer: "because", acceptableAnswers: "as, since, when" },
        { id: "6", answer: "as", acceptableAnswers: "" },
        { id: "7", answer: "In", acceptableAnswers: "" },
        { id: "8", answer: "to", acceptableAnswers: "" },
        { id: "9", answer: "also", acceptableAnswers: "" },
        { id: "10", answer: "as", acceptableAnswers: "since, because" },
        { id: "11", answer: "Of", acceptableAnswers: "" },
        { id: "12", answer: "but", acceptableAnswers: "yet" },
      ],
    } as OpenClozeContent,
  },

  // --- Reading (Reading & Use of English Part 5 style) ---
  {
    id: "rd-1",
    tipo: "reading",
    titulo: "Reading — My First Job Abroad",
    instrucciones: "Lee el texto y responde las preguntas de opción múltiple eligiendo la mejor respuesta.",
    puntaje_maximo: 12,
    contenido: {
      passage: `When I finished university, I had no idea what I wanted to do next. Most of my friends had already found graduate jobs in offices, but the idea of sitting at a desk from nine to five didn't appeal to me at all. I wanted an adventure, so when a friend told me about a teaching position in South Korea, I applied without really thinking it through.

Looking back, I probably should have done more research. I had never taught before, I couldn't speak a word of Korean, and I had only ever left my home country twice, both times on short family holidays. Still, three months after applying, I found myself stepping off a plane in Seoul with two suitcases and a folder full of documents I barely understood.

The first few weeks were overwhelming. Everything, from ordering food to using public transport, required a level of concentration I wasn't used to. My school gave me a short training course, but nothing could have fully prepared me for standing in front of thirty curious ten-year-olds who spoke almost no English. I made countless mistakes in those early lessons — I once spent an entire class trying to explain a grammar point that, in hindsight, was far too advanced for their level.

What surprised me most, though, was how quickly I adapted. Within a month, I had learned enough Korean to get by in shops and restaurants, and my lessons started to feel less like a daily struggle and more like something I actually enjoyed. My students, who had seemed so intimidating at first, turned out to be endlessly patient with my mistakes, and some of them are still in touch with me today, years later.

If I'm honest, the hardest part wasn't the teaching itself but the loneliness. I missed my family more than I expected, especially during the first few months, and there were evenings when I seriously considered booking a flight home. What kept me going was the friendship of the other foreign teachers at my school, who understood exactly what I was going through because they were going through it too.

Would I recommend the experience to someone else? Without hesitation. It wasn't easy, and I certainly wasn't prepared for how difficult it would be, but it taught me more about independence and resilience than any classroom back home ever could.`,
      questions: [
        { id: "1", question: "Why did the writer decide to apply for the job in South Korea?", options: ["A friend had recommended the same job to them before.", "They had always dreamed of living in Korea.", "They didn't want to start a typical office job.", "They had already learned some Korean at university."], correctIndex: 2 },
        { id: "2", question: "What does the writer suggest about their decision to apply?", options: ["It was based on careful planning.", "It was made without much thought.", "It was influenced by their family.", "It took several months to decide."], correctIndex: 1 },
        { id: "3", question: "What does \"in hindsight\" mean, as used in the third paragraph?", options: ["looking back at something after it happened", "a sudden feeling of confusion", "advice given by an experienced teacher", "a plan made before starting something"], correctIndex: 0 },
        { id: "4", question: "According to the fourth paragraph, the writer's students", options: ["struggled to accept a foreign teacher.", "were more forgiving than expected.", "preferred not to speak English at all.", "had studied English for many years."], correctIndex: 1 },
        { id: "5", question: "What was the most difficult aspect of the experience for the writer?", options: ["learning to teach a new subject", "understanding the local language", "being away from their family", "adjusting to Korean food"], correctIndex: 2 },
        { id: "6", question: "What is the writer's overall attitude towards the experience by the end of the text?", options: ["They regret having taken the job.", "They believe it was worthwhile despite the difficulties.", "They think it was too difficult to recommend to others.", "They feel it didn't really change them."], correctIndex: 1 },
      ],
    } as ReadingContent,
  },
  {
    id: "rd-2",
    tipo: "reading",
    titulo: "Reading — The Rise of Urban Beekeeping",
    instrucciones: "Lee el texto y responde las preguntas de opción múltiple eligiendo la mejor respuesta.",
    puntaje_maximo: 12,
    contenido: {
      passage: `Over the past decade, an unusual hobby has been quietly spreading across cities around the world: beekeeping. What was once considered an activity limited to the countryside has found a new home on rooftops, balconies and even school playgrounds in busy urban areas.

One reason for this trend is growing concern about the declining number of bees worldwide. Bees play a crucial role in pollinating the plants that produce much of our food, and their numbers have fallen sharply due to disease, pesticides and the loss of natural habitats. By keeping hives in cities, urban beekeepers hope to give local bee populations a better chance of survival, since cities often contain a wider variety of flowering plants than intensively farmed countryside.

Surprisingly, several studies have found that city bees can actually be healthier than their rural relatives. This is partly because urban areas tend to use fewer pesticides than farmland, and partly because the mix of plants found in parks and gardens provides bees with a more varied diet throughout the year.

Of course, keeping bees in a crowded city is not without its challenges. Beekeepers must follow strict rules about where hives can be placed, largely to avoid frightening neighbours who are unfamiliar with the hobby. Many beekeeping groups now run workshops to teach beginners how to handle bees safely and to reassure the public that, when properly managed, urban hives pose very little danger.

For those who take it up, the rewards go beyond a jar of homemade honey. Many beekeepers describe the hobby as deeply relaxing, offering a rare chance to slow down and observe nature closely, even in the middle of a busy city.`,
      questions: [
        { id: "1", question: "Where has beekeeping traditionally taken place, according to the text?", options: ["in city parks", "in rural areas", "on school playgrounds", "in shopping centres"], correctIndex: 1 },
        { id: "2", question: "Why are urban beekeepers trying to keep bees in cities?", options: ["to sell honey at a higher price", "to help protect bee numbers that are falling", "because farmland no longer allows beehives", "because cities need more flowering plants"], correctIndex: 1 },
        { id: "3", question: "What does the text say about the health of city bees?", options: ["They are usually less healthy than rural bees.", "They face more pesticides than rural bees.", "They can be healthier than bees in the countryside.", "Their diet is less varied than rural bees' diet."], correctIndex: 2 },
        { id: "4", question: "What is one of the main challenges of urban beekeeping mentioned in the text?", options: ["finding enough flowers for the bees", "following rules about hive placement", "the high cost of equipment", "a lack of interest from beginners"], correctIndex: 1 },
        { id: "5", question: "What is the purpose of the beekeeping workshops mentioned in the text?", options: ["to sell beekeeping equipment", "to help beginners handle bees safely", "to train professional farmers", "to reduce the price of honey"], correctIndex: 1 },
        { id: "6", question: "How do many beekeepers describe the hobby?", options: ["stressful but profitable", "relaxing and a way to connect with nature", "difficult to learn but exciting", "mainly useful for making money"], correctIndex: 1 },
      ],
    } as ReadingContent,
  },
];

export function getBankEntriesForTipo(tipo: BankTipo): BankEntry[] {
  return CAMBRIDGE_B2_FIRST_BANK.filter((e) => e.tipo === tipo);
}
