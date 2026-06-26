

export const heroData = {
  preheader: "Grupos Abiertos",

  slides: [
  {
    title: "Estudia con Docentes C2",
    subtitle:
      "Clases en vivo con coaches certificados y metodología clara para avanzar desde el día 1.",
    image: "https://i.ibb.co/DDwVsnjb/Whats-App-Image-2026-01-23-at-16-06-40.jpg"
  },
  {
    title: "Módulos de 18 Horas",
    subtitle:
      "Ruta directa por niveles: objetivos semanales y resultados visibles en poco tiempo.",
    image: "https://i.ibb.co/WCyKNqY/Whats-App-Image-2026-01-23-at-16-06-22.jpg"
  },
  {
    title: "Prepárate y Certifícate",
    subtitle:
      "Entrenamiento real para Cambridge, IELTS y TOEFL con práctica guiada y simulacros.",
    image: "https://i.ibb.co/vCrm62Hr/Whats-App-Image-2026-01-23-at-16-06-10-1.jpg"
  }
],


  ctas: [
    {
      label: "Ver cursos",
      href: "#cursos",
      primary: true
    },
    
  ],

  stats: [
    { value: "+2,500", label: "Estudiantes certificados" },
    { value: "95%", label: "Aprueban al primer intento" }
  ]
};

export const ribbonText =
  "Incluye simulacros Cambridge + Campus Virtual + Cursos autónomos";

export const ecosystem = {
  title: "Ecosistema ACE",
  subtitle:
    "Un sistema completo para avanzar con clases en vivo, práctica guiada y recursos disponibles todo el tiempo.",
  items: [
    {
      title: "Simulacros Cambridge",
      text: "Entrenamientos con formato oficial, tiempos reales y retroalimentación docente.",
      video: "/simulacro.mp4",
      ctaLabel: "Abrir simulacros",
      ctaHref: "https://focus-watch-flow.lovable.app/",
    },
    {
      title: "Campus Virtual 24/7",
      text: "Acceso permanente a materiales, tareas, grabaciones y seguimiento de progreso.",
      video: "/campus.mp4",
      ctaLabel: "Ir al campus",
      ctaHref: "https://platform.acelingua.com/index.php",
    },
    {
      title: "Cursos Autónomos",
      text: "Ruta de estudio flexible para reforzar grammar, vocabulary y listening.",
      video: "/plataforma.mp4",
      ctaLabel: "Ver cursos",
      ctaHref: "https://myenglishbro.com/",
    },
  ],
};

const defaultCourseImage =
  "https://i.ibb.co/ccJb84L6/Gemini-Generated-Image-iaw1wciaw1wciaw1.png";
const defaultTeacher = {
  name: "",
  photo:
    "https://i.ibb.co/rGsLHRJ9/Gemini-Generated-Image-k8t346k8t346k8t3-removebg-preview.png",
};
const defaultRibbon = "TITULO";

const coursesBase = [
  // ===================== CAMBRIDGE =====================

  {
    id: "cae",
    title: "Cambridge C1 Advanced",
  shortTitle: "C1 Advanced (CAE)",
  badge: "Avanzado",
  level: "C1",
  examType: "Cambridge",
  category: "Exams",
  tags: ["C1", "Cambridge"],
  startDate: "5 de enero",

  modules: 5,
  hoursPerModule: 18,
  totalHours: 90,
  price: "S/390",

  image: "https://i.ibb.co/whKNmDDP/Whats-App-Image-2026-01-23-at-22-26-50.jpg",
  perks: [
    "Dominio avanzado de Use of English",
    "Writing con corrección técnica",
    "Simulacros C1 completos",
    "Estrategia de examen + timing",
  ],

  whatsapp: "https://wa.link/6ktnb5",
  highlight: false,

  curriculum: [
    {
      module: 1,
      title: "Precisión léxica y gramatical",
      topics: [
        "R&UE Part 1 – Multiple-choice cloze (estrategias y práctica)",
        "R&UE Part 1 – Control y precisión",
        "R&UE Part 2 – Open cloze (palabras gramaticales)",
        "R&UE Part 2 – Control y cohesión",
        "R&UE Part 3 – Word formation (familias léxicas)",
        "R&UE Part 3 – Control avanzado",
        "Advanced collocations & expressions",
        "Grammar & Vocabulary C1 (make / give, past forms)",
        "Listening Part 1 – Short extracts (opinions & attitudes)",
        "Listening Part 1 – Control",
        "Integración de habilidades + mini mock",
      ],
    },

    {
      module: 2,
      title: "Transformación y lectura profunda",
      topics: [
        "R&UE Part 4 – Key Word Transformations (introducción)",
        "R&UE Part 4 – Control por patrones",
        "R&UE Part 5 – Multiple-choice reading",
        "R&UE Part 5 – Control avanzado",
        "Writing Part 1 – Essay (estructura, análisis y coherencia)",
        "Writing Part 1 – Essay (producción guiada)",
        "Listening Part 2 – Sentence completion",
        "Listening Part 2 – Control",
        "Speaking Part 1 – Interview avanzado",
        "Integración + mock parcial",
      ],
    },

    {
      module: 3,
      title: "Cohesión, opinión y escritura formal",
      topics: [
        "R&UE Part 6 – Gapped text (cohesión textual)",
        "R&UE Part 6 – Control cronometrado",
        "Writing Part 2 – Report (estructura formal)",
        "Writing Part 2 – Report (producción)",
        "Listening Part 3 – Multiple matching",
        "Listening Part 3 – Control",
        "Writing Part 2 – Review (registro y evaluación)",
        "Writing Part 2 – Review (producción)",
        "Integración de habilidades",
        "Mock + feedback detallado",
      ],
    },

    {
      module: 4,
      title: "Lectura múltiple y argumentación",
      topics: [
        "R&UE Part 7 – Multiple matching",
        "R&UE Part 7 – Control avanzado",
        "Writing Part 2 – Proposal (estructura)",
        "Writing Part 2 – Proposal (producción)",
        "Listening Part 4 – Long interviews & talks",
        "Listening Part 4 – Control",
        "Speaking Part 3 – Collaborative task",
        "Speaking Part 3 – Control y refinamiento",
        "Integración de habilidades",
        "Mock + feedback",
      ],
    },

    {
      module: 5,
      title: "Dominio oral y simulación real",
      topics: [
        "Speaking Part 1 – Fluidez avanzada",
        "Speaking Part 2 – Long turn",
        "Speaking Part 3 – Refinamiento estratégico",
        "Speaking Part 4 – Discussion",
        "Writing review & improvement",
        "R&UE – Revisión total",
        "Listening – Revisión total",
        "Mock completo: R&UE + Writing",
        "Mock completo: Listening + Speaking",
        "Feedback final y estrategia personalizada de examen",
      ],
    },
  ],
}
,

  {
  id: "fce",
  title: "Cambridge B2 First",
  shortTitle: "B2 First (FCE)",
  badge: "Más elegido",
  level: "B2",
  examType: "Cambridge",
  category: "Exams",
  tags: ["B2", "Cambridge"],
  startDate: "5 de enero",

  modules: 5,
  hoursPerModule: 18,
  totalHours: 90,
  price: "S/300",

  perks: [
    "Estrategias por paper (R&UE, Writing, Speaking)",
    "Simulacros oficiales con rúbricas Cambridge",
    "Entrenamiento speaking 1:1 grupal",
    "Feedback personalizado por docente C2",
  ],

  whatsapp: "https://wa.link/6ktnb5",
  highlight: true,

  curriculum: [
    {
      module: 1,
      title: "Reading & Use of English (Parts 1–3) + Skills Foundations",
      topics: [
        "R&UE Part 1 – Multiple-choice cloze (Unit 1: A family affair)",
        "R&UE Part 2 – Open cloze (Units 1–2)",
        "R&UE Part 3 – Word formation (Units 2–3)",
        "Writing Part 1 – Essay: opinions & arguments",
        "Linking words: although, however, despite, that said",
        "Listening Part 1 – People talking about daily life (Units 1–2)",
        "Speaking Part 1 – Interview",
        "Grammar: present perfect simple & continuous",
        "Vocabulary: -ed / -ing adjectives, make & do, phrasal verbs (relationships)",
        "Mini mock: R&UE Parts 1–3 + Speaking Part 1",
      ],
    },

    {
      module: 2,
      title: "Transformations, Reading & Extended Speaking",
      topics: [
        "R&UE Part 4 – Key Word Transformations (Units 2 & 5)",
        "R&UE Part 5 – Multiple-choice reading (Units 2 & 6)",
        "Writing Part 2 – Article (Units 2 & 5)",
        "Listening Part 2 – Talks by vloggers & speakers (Units 2 & 7)",
        "Speaking Part 2 – Long turn (comparing photos)",
        "Grammar: comparatives & adjectives",
        "Grammar: past simple & past continuous",
        "Vocabulary: travel, sports, leisure & hobbies",
        "Mock parcial: R&UE Parts 4–5 + Listening Part 2",
      ],
    },

    {
      module: 3,
      title: "Text Cohesion, Reviews & Collaborative Speaking",
      topics: [
        "R&UE Part 6 – Gapped text (Units 4 & 7)",
        "Writing Part 2 – Review (restaurants, cafés & places)",
        "Using descriptive adjectives (Units 4 & 8)",
        "Listening Part 3 – Multiple matching (opinions & experiences)",
        "Speaking Part 3 – Collaborative task",
        "Decision-making & interaction strategies",
        "Grammar: modal verbs (certainty & possibility)",
        "Verb patterns: gerund vs infinitive",
        "Vocabulary: education & psychology",
        "Mock Writing (Essay + Review)",
        "Speaking Part 3 evaluated",
      ],
    },

    {
      module: 4,
      title: "Advanced Reading, Listening & Discussion",
      topics: [
        "R&UE Part 7 – Multiple matching (Units 5, 8 & 11)",
        "Writing Part 2 – Report & Email / Letter",
        "Giving advice & making recommendations (Units 9 & 12)",
        "Listening Part 4 – Interviews & extended talks (Units 4, 8 & 10)",
        "Speaking Part 4 – Discussion",
        "Grammar: relative clauses",
        "Grammar: conditionals (third & mixed)",
        "Wish / if only / hope",
        "Vocabulary: health & animals",
        "Mock completo: Reading & Use of English",
        "Speaking Parts 2–4",
      ],
    },

    {
      module: 5,
      title: "Full Integration & Cambridge Simulation",
      topics: [
        "Complete review: R&UE Parts 1–7",
        "Listening Parts 1–4",
        "Writing Parts 1–2",
        "Speaking Parts 1–4",
        "Balanced essays: planning & editing strategies",
        "Speaking fluency, pronunciation & intonation",
        "Full speaking mock tests",
        "Grammar: passive voice",
        "Causative: have / get",
        "Reported speech",
        "Vocabulary: festivals, technology & lifestyle",
        "Full Cambridge B2 First Mock Exam",
        "Individual feedback & personalized strategies",
      ],
    },
  ],
},


  {
  id: "pet",
  title: "Cambridge B1 Preliminary",
    shortTitle: "B1 Preliminary (PET)",
    badge: "Ideal para consolidar bases",
    level: "B1",
    examType: "Cambridge",
    category: "Exams",
    tags: ["B1", "Cambridge"],
    startDate: "5 de enero",
    img:"https://i.ibb.co/k6HpgZHd/Whats-App-Image-2026-01-23-at-16-06-22.jpg",
    modules: 4,
    hoursPerModule: 18,
    totalHours: 72,
    price: "S/270",

    image: "https://i.ibb.co/mrrBwfr2/Whats-App-Image-2026-01-23-at-16-06-10-1.jpg",
    perks: [
      "Base sólida de grammar & speaking",
      "Práctica real de reading y listening",
      "Simulacros guiados con feedback",
      "Ruta clara hacia B2",
    ],

    whatsapp: "https://wa.link/6ktnb5",

    curriculum: [
      {
        module: 1,
        title: "B1 Foundations",
        topics: [
          "Grammar B1 core",
          "Daily speaking practice",
          "Listening basics",
        ],
      },
      {
        module: 2,
        title: "Reading & Writing",
        topics: [
          "Reading comprehension",
          "Email & short text writing",
        ],
      },
      {
        module: 3,
        title: "Listening & Speaking",
        topics: [
          "Speaking interaction",
          "Listening exam tasks",
        ],
      },
      {
        module: 4,
        title: "Exam Preparation",
        topics: [
          "Mock exams",
          "Exam strategies",
          "Final feedback",
        ],
      },
    ],
  },

  // ===================== GENERAL ENGLISH =====================

 {
  id: "a2",
  title: "English A2 – Elementary / Pre-Intermediate",
  shortTitle: "A2 Pre-Intermedio",
  badge: "Base comunicativa",
  level: "A2",
  examType: "General English",
  category: "Basic",
  tags: ["A2"],
  startDate: "5 de enero",

  modules: 3,
  hoursPerModule: 18,
  totalHours: 54,
  price: "S/250",

  image: "https://i.ibb.co/k6HpgZHd/Whats-App-Image-2026-01-23-at-16-06-22.jpg",
  perks: [
    "Clases virtuales en vivo",
    "Comunicación cotidiana real",
    "Base sólida para B1",
    "Producción oral y escrita",
  ],

  whatsapp: "https://wa.link/6ktnb5",

  curriculum: [
    {
      module: 1,
      title: "Vida personal y sociedad",
      topics: [
        "Word order in questions",
        "Present simple & present continuous",
        "Adverbs of frequency",
        "Countable & uncountable nouns",
        "Some / any / much / many / a lot of",
        "Reading: people, society, food & habits",
        "Listening: descriptions of people & daily conversations",
        "Vocabulary: people & relationships",
        "Vocabulary: food & drink",
        "Vocabulary: everyday objects",
        "Speaking: talking about yourself and others",
        "Speaking: asking & answering questions",
        "Pronunciation: basic word stress & alphabet",
        "Writing: personal description",
        "Writing: short texts about food & habits",
      ],
    },

    {
      module: 2,
      title: "Cultura, música y experiencias",
      topics: [
        "Past simple (regular & irregular verbs)",
        "Used to",
        "Infinitive of purpose",
        "Future plans: going to / will",
        "Reading: cultural texts (art, music, stories)",
        "Reading: short biographies & narratives",
        "Listening: interviews about music & work",
        "Listening: opinions & personal experiences",
        "Vocabulary: art & music",
        "Vocabulary: jobs & leisure activities",
        "Adjectives to describe feelings",
        "Speaking: agreeing & disagreeing",
        "Speaking: talking about past experiences",
        "Speaking: describing pictures",
        "Writing: a scene from a short story",
        "Writing: a basic review",
      ],
    },

    {
      module: 3,
      title: "Viajes, salud y mundo moderno",
      topics: [
        "Comparatives & superlatives",
        "First & second conditional (introduction)",
        "Present perfect (basic use)",
        "Modals: can / could / should",
        "Reading: science & technology texts",
        "Reading: travel, health & lifestyle articles",
        "Listening: travel conversations",
        "Listening: medical dialogues & daily situations",
        "Vocabulary: technology & science",
        "Vocabulary: travel & transport",
        "Vocabulary: health & fitness",
        "Speaking: giving advice",
        "Speaking: talking about future plans",
        "Pronunciation: sentence stress & intonation",
        "Writing: an email",
        "Writing: a short article",
        "Writing: description of a town or place",
      ],
    },
  ],
}
,

 {
  id: "a1",
  title: "English A1 – Elementary",
  shortTitle: "A1 Inicial",
  badge: "Principiantes",
  level: "A1",
  examType: "General English",
  category: "Basic",
  tags: ["A1"],
  startDate: "5 de enero",

  modules: 2,
  hoursPerModule: 18,
  totalHours: 36,
  price: "S/250",

  perks: [
    "Fundamentos comunicativos A1",
    "Producción oral constante",
    "Material digital",
    "Grupos reducidos",
  ],

  whatsapp: "https://wa.link/6ktnb5",

  curriculum: [
    {
      module: 1,
      title: "A1 Foundation – Personal information & daily life",
      topics: [
        "Subject pronouns",
        "Possessive adjectives: my, your, his, her",
        "Personal information & asking simple questions",
        "Introducing yourself and others",
        "Family vocabulary",
        "Describing family members",
        "Numbers (review & expansion)",
        "There is / There are",
        "Singular vs plural nouns",
        "Describing places: shops, hotels, houses",
        "Prices and numbers (20–100)",
        "Jobs vocabulary",
        "Like / don’t like + nouns / verbs",
        "Talking about sports and free time",
        "Present simple (affirmative – introduction)",
        "Speaking assessment: personal information & family",
        "Grammar & vocabulary review (Units 1–4)",
      ],
    },

    {
      module: 2,
      title: "A1 Development – Routines, places & basic timelines",
      topics: [
        "Present Simple (affirmative)",
        "Daily routines",
        "Adverbs of frequency",
        "Telling the time",
        "Present Simple (questions)",
        "Question words: who, where, when, what",
        "Talking about people you know",
        "Giving basic opinions",
        "Prepositions of place",
        "Imperatives",
        "Food vocabulary & eating habits",
        "Was / were",
        "Past simple (affirmative – introduction)",
        "Be going to (future plans)",
        "Talking about life events",
        "Final speaking assessment: routines, places, past & future",
        "Grammar review: present simple, was / were, going to",
      ],
    },
  ],
}
,

  // ===================== CERTIFICATIONS =====================

  {
    id: "toefl",
    title: "Preparación TOEFL iBT",
    shortTitle: "TOEFL iBT",
    badge: "Certificación",
    level: "C1",
    examType: "TOEFL",
    category: "Exams",
    tags: ["TOEFL"],
    startDate: "5 de enero",

    modules: 4,
    hoursPerModule: 18,
    totalHours: 72,
    price: "S/500",

    perks: [
      "Simulacros cronometrados",
      "Corrección de writing",
      "Estrategias por sección",
    ],

    whatsapp: "https://wa.link/6ktnb5",

    curriculum: [
      {
        module: 1,
        title: "TOEFL Foundations",
        topics: [
          "Exam structure",
          "Reading strategies",
          "Listening skills",
        ],
      },
      {
        module: 2,
        title: "Speaking & Writing",
        topics: [
          "Integrated speaking",
          "Essay structure",
        ],
      },
      {
        module: 3,
        title: "Advanced Strategies",
        topics: [
          "Time management",
          "High-score techniques",
        ],
      },
      {
        module: 4,
        title: "Mock Exams",
        topics: [
          "Full TOEFL simulations",
          "Score analysis",
          "Final feedback",
        ],
      },
    ],
  },

  {
    id: "ielts",
    title: "Preparación IELTS",
    shortTitle: "IELTS Academic / General",
    badge: "Certificación",
    level: "C1",
    examType: "IELTS",
    category: "Exams",
    tags: ["IELTS"],
    startDate: "5 de enero",

    modules: 4,
    hoursPerModule: 18,
    totalHours: 72,
    price: "S/500",

    perks: [
      "Simulacros reales",
      "Speaking intensivo",
      "Corrección de essays",
    ],

    whatsapp: "https://wa.link/6ktnb5",

    curriculum: [
      {
        module: 1,
        title: "IELTS Structure & Reading",
        topics: [
          "Exam overview",
          "Reading techniques",
        ],
      },
      {
        module: 2,
        title: "Writing Task 1 & 2",
        topics: [
          "Graph analysis",
          "Essay writing",
        ],
      },
      {
        module: 3,
        title: "Listening & Speaking",
        topics: [
          "Speaking band descriptors",
          "Listening strategies",
        ],
      },
      {
        module: 4,
        title: "Full Simulations",
        topics: [
          "Complete mock tests",
          "Band score feedback",
        ],
      },
    ],
  },

  // ===================== LANGUAGES =====================

  {
    id: "portugues",
    title: "Portugués Básico",
    shortTitle: "A1 Portugués",
    badge: "Profesora nativa",
    level: "A1",
    examType: "Languages",
    category: "Languages",
    tags: ["Portugués"],
    startDate: "5 de enero",

    modules: 2,
    hoursPerModule: 18,
    totalHours: 36,
    price: "S/250",

    perks: [
      "Profesora brasileña",
      "Conversación práctica",
      "Material incluido",
    ],

    whatsapp: "https://wa.link/6ktnb5",

    curriculum: [
      {
        module: 1,
        title: "Portuguese Basics",
        topics: [
          "Pronunciation & alphabet",
          "Basic grammar",
          "Everyday vocabulary",
        ],
      },
      {
        module: 2,
        title: "Basic Communication",
        topics: [
          "Daily conversations",
          "Listening practice",
        ],
      },
    ],
  },
];

export const courses = coursesBase.map((course) => ({
  image: defaultCourseImage,
  teacher: { ...defaultTeacher, ...(course.teacher || {}) },
  ribbon: course.ribbon || defaultRibbon,
  ...course,
}));



export const programs = [
  {
    title: "Boost Profesional",
    language: "Ingles",
    duration: "3 meses",
    description:
      "Reuniones, emails y presentaciones con vocabulario de negocios y practica semanal de speaking.",
    level: "B1 a C1",
  },
  {
    title: "Culture & Viajes",
    language: "Frances",
    duration: "2 meses",
    description: "Conversacion cotidiana, pronunciacion y simulaciones para viajar con confianza.",
    level: "A2 a B2",
  },
  {
    title: "Tech & Ciencia",
    language: "Aleman",
    duration: "4 meses",
    description: "Terminologia tecnica, conversaciones guiadas y preparacion para entrevistas.",
    level: "A2 a C1",
  },
];

export const programsInfo = {
  methodology:
    "Combinamos coaching en vivo, practica asistida con IA y rutas personalizadas para que avances con metas claras cada 2 semanas.",
  teachers: [
    "Docentes certificados CPE, CELTA y TKT",
    "Experiencia entrenando para TOEFL, IELTS y Cambridge",
    "Mentores dedicados por grupo para feedback constante",
  ],
  founders: [
    {
      name: "Carlos Alberto Apolaya Sanchez",
      role: "Co-fundador· Operaciones",
      bio: "Ingeniero y Docente de idiomas, 13+ años preparando estudiantes para Cambridge y IELTS. Diseña las rutas MCER",
      image: "https://i.ibb.co/23Lrc4yx/channels4-profile.jpg",
    },
    {
      name: "Salomé Aguilar",
      role: "Co-fundadora ·Academic Lead ",
      bio: "Docente certificado CPE y Celta. Coordina coaches y asegura que cada grupo mantenga calidad y ritmo.",
      image: "https://i.ibb.co/XxrHp4kk/Whats-App-Image-2025-10-06-at-7-56-13-AM.jpg",
    },
  ],
};

export const metodo = {
  title: "Metodologia eclectica guiada por principios",
  intro:
    "Combinamos Principled Eclecticism y Dogme ELT: usamos la tecnica que mejor encaja con tus metas, con clases centradas en conversacion real, poca carga de materiales y feedback personalizado.",
  bullets: [
    "Uso flexible de metodos segun tu nivel, objetivos y ritmo",
    "Conversaciones reales y lenguaje emergente como eje de la clase",
    "Docente facilitador que adapta tecnicas al contexto y estilo de aprendizaje",
    "Variedad de actividades: coaching, practica guiada y tareas cortas",
    "Feedback inmediato y personalizado (humano + IA)",
    "Guiado por principios, no mezcla aleatoria de tecnicas",
  ],
  tiles: [
    { title: "Principled Eclecticism", text: "Elegimos la tecnica mas efectiva para cada momento y objetivo" },
    { title: "Dogme ELT", text: "Dialogos autenticos, materiales ligeros y enfasis en comunicacion real" },
    { title: "Coaching en vivo", text: "Facilitadores certificados, grupos reducidos y acompanamiento" },
  ],
  imageUrl:
    "https://i.ibb.co/k2YmRN68/unnamed-1.jpg",
  certifications: [
    "Cambridge CPE (C2)",
    "CELTA",
    "Teaching Knowledge Test (TKT)",
  ],
};

export const why = [
  "Mentor dedicado por grupo",
  "Plataforma 24/7",
    "Tutores con nivel C2 , TKT y CELTA",
"Grabaciones de clases",
"No pagos de Matriculas ni libros",
  "Reportes cada 2 semanas",
  "Preparacion a examenes oficiales",
];

export const pricing = [
  

  // -----------------------------
  //    CERTIFICACIONES CAMBRIDGE
  // -----------------------------

  {
    name: "PET B1 Cambridge",
    price: "S/ 270 / mes",
    description: "Preparación internacional B1 (PET) con simulaciones reales.",
    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
    perks: [
      "Curso intensivo 4 meses",
      "Simulaciones Cambridge PET",
      "Correcciones por criterios oficiales",
      "Entrenamiento speaking 1:1",
      "Modelo de writing + feedback técnico"
    ],
    cta: "Prepararme para PET",
    highlight: false,
    tag: "Certificación"
  },
  {
    name: "FCE B2 Cambridge",
    price: "S/ 300 / mes",
    description: "Preparación completa al B2 First con estrategia por papers.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    perks: [
      "Curso intensivo 4 meses",
      "Simulacros de Reading & Use",
      "Entrenamiento de Speaking Part 1-4",
      "Correcciones Writing task 1 y 2",
      "Acceso a banco de prácticas B2"
    ],
    cta: "Prepararme para FCE",
    highlight: true,
    tag: "Cambridge FCE"
  },
  {
    name: "CAE C1 Cambridge",
    price: "S/ 390 / mes",
    description: "Entrenamiento premium para aprobar el CAE con confianza.",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    perks: [
      "Curso intensivo 4 meses",
      "Técnicas avanzadas de Use of English",
      "Feedback especializado de writing",
      "Práctica de speaking con rúbricas C1",
      "Acceso a exámenes modelo reales"
    ],
    cta: "Prepararme para CAE",
    highlight: false,
    tag: "Cambridge CAE"
  }
];
export const testimonials = [
 
  {
    quote:
      "Vivo en Ica y trabajo tiempo completo. Las clases grabadas y el acompañamiento me permitieron organizarme.",
    name: "Jose Ochoa",
    role: "Contabilidad · Ica",
    photo: "https://i.ibb.co/Vc7sgBBC/Gemini-Generated-Image-p1v8a7p1v8a7p1v8.png",
  },
  {
    quote:
      "El simulador Cambridge fue clave. Sentí que ya había dado el examen antes de hacerlo.",
    name: "Antony Felix",
    role: "Estudiante de Derecho · Lima",
    photo: "https://i.ibb.co/jPmsgDV6/Gemini-Generated-Image-s2i9acs2i9acs2i9.png",
  },
  {
    quote:
      "Soy docente y necesitaba mejorar mi nivel para ascender. El feedback personalizado fue determinante.",
    name: "Antonela Saravia",
    role: "Profesor de Inglés · Arequipa",
    photo: "https://i.ibb.co/QFxcqp4d/Gemini-Generated-Image-k9l7fek9l7fek9l7.png",
  },
  {
    quote:
      "Vivo en Iquitos y nunca encontré preparación Cambridge tan completa. Realmente vale la pena.",
    name: "Angelo Elias",
    role: "Administración · Iquitos",
    photo: "https://i.ibb.co/5XJ41psc/Gemini-Generated-Image-y77w0zy77w0zy77w.png",
  },
  {
    quote:
      "Me preparé para el B2 y aprobé con confianza. Las simulaciones me ayudaron a controlar los tiempos.",
    name: "Jose Matta",
    role: "Contabilidad · Trujillo",
    photo: "https://i.ibb.co/xt55hnKv/Gemini-Generated-Image-abamlsabamlsabam.png",
  },
  {
    quote:
      "Necesitaba certificarme para un ascenso. La práctica de speaking y el feedback marcaron la diferencia.",
    name: "Ana Catalina",
    role: "Recursos Humanos · Arequipa",
    photo: "https://i.ibb.co/sdZ1Dznj/Gemini-Generated-Image-5yxptk5yxptk5yxp.png",
  },
];


export const faq = [
  {
    q: "Como funciona la sesion diagnostica?",
    a: "Toma una prueba de nivel",
  },
  {
    q: "Puedo cambiar de horario o nivel?",
    a: "Si, puedes mover horario y subir de nivel al completar los hitos de speaking y comprension.",
  },
  {
    q: "Incluye certificacion?",
    a: "Incluimos simulacros y guias para TOEFL, IELTS, DELF y Goethe. La inscripcion oficial se paga aparte.",
  },
  {
    q: "Hay clases 1 a 1?",
    a: "Consulta con el Asesor Ace",
  },
];

export const contacto = {
  horarios: ["Lunes a Viernes · 8:00 - 21:00", "Sabados · 9:00 - 13:00"],
  email: "carlosapolayasanchez@gmail.com",
  whatsapp: "https://wa.link/6ktnb5",
};

export const certInfo = [
  {
    title: "¿Necesitas terminar el instituto para prepararte a un examen internacional?",
    emphasis: "No. Puedes empezar ya con el nivel que tengas.",
    image: "https://i.ibb.co/wN75K2RK/Gemini-Generated-Image-akay5xakay5xakay.png",
    bullets: [
      "Rutas de preparacion desde A1 en adelante",
      "Practica enfocada en formatos TOEFL / IELTS / Cambridge",
      "Acompanamiento docente certificado",
    ],
  },
  {
    title: "Certificados Cambridge",
    emphasis: "No caducan y son preferidos por universidades y centros de idiomas.",
    image: "https://i.ibb.co/RTsbXS8g/Gemini-Generated-Image-d5xyz5d5xyz5d5xy.png",
    bullets: ["CPE, CAE, FCE, PET", "Validez internacional y sin fecha de vencimiento"],
  },
  {
    title: "Quien puede otorgar certificados internacionales",
    emphasis: "Solo Cambridge, Michigan y Oxford emiten certificaciones oficiales de ingles.",
    image: "https://i.ibb.co/27yyqdFt/Gemini-Generated-Image-297s8b297s8b297s.png",
    bullets: ["Preparacion alineada a estas instituciones", "Simulacros con formatos oficiales"],
  },
  {
    title: "Equivalencias reales vs institutos locales",
    emphasis: "En 1 año de instituto local usualmente alcanzas A1-A2, no B2.",
    image: "https://i.ibb.co/NgTHjTvc/Gemini-Generated-Image-ik8avoik8avoik8a.png",
    bullets: ["Basico (1 año) ~ A1", "Intermedio (1 año) ~ A2", "Avanzado (1 año) ~ B1"],
  },
  {
    title: "MCER: 6 niveles internacionales",
    emphasis: "A1 A2 B1 B2 C1 C2",
    image: "https://i.ibb.co/0pRRLg20/niveles-MCER-lenguas-COE.jpg",
    bullets: [
      "Estandar mundial para medir competencia linguistica",
      "Usado para ingles, frances, aleman y otros idiomas",
      "Estructuramos las rutas segun MCER",
    ],
  },
];
