const COURSES = [
  {
    category: "General English",
    name: "A1 Beginner",
    desc: "Empieza desde cero y construye una base sólida en inglés con grupos reducidos y acompañamiento constante.",
    oldPrice: 300,
    price: 250,
    image: "/a1.png",
    level: "A1",
    students: "Grupos reducidos",
    teachers: "Acelingua Team",
    color: "#DCE8F8",
    popular: false,
  },
  {
    category: "General English",
    name: "A2 Elementary",
    desc: "Desarrolla tu comunicación diaria en inglés y gana confianza en conversaciones básicas.",
    oldPrice: 300,
    price: 250,
    image: "/a2.png",
    level: "A2",
    students: "Grupos reducidos",
    teachers: "Acelingua Team",
    color: "#DDD1FF",
    popular: false,
  },
  {
    category: "General English",
    name: "B1 Intermediate",
    desc: "Mejora tu fluidez y amplía tu vocabulario para desenvolverte en contextos académicos y laborales.",
    oldPrice: 320,
    price: 270,
    image: "/B1.png",
    level: "B1",
    students: "Grupos reducidos",
    teachers: "Acelingua Team",
    color: "#DCE8F8",
    popular: true,
  },
  {
    category: "General English",
    name: "B2 First",
    desc: "Perfecciona tus habilidades comunicativas y prepárate para alcanzar un nivel avanzado de inglés.",
    oldPrice: 350,
    price: 300,
    image: "/b2.png",
    level: "B2",
    students: "Grupos reducidos",
    teachers: "Acelingua Team",
    color: "#CDECF1",
    popular: true,
  },
  {
    category: "Advanced English",
    name: "C1 Advanced",
    desc: "Domina el inglés académico y profesional con un programa diseñado para alcanzar un nivel avanzado.",
    oldPrice: 420,
    price: 380,
    image: "/c1.png",
    level: "C1",
    students: "Grupos reducidos",
    teachers: "Acelingua Team",
    color: "#DDD1FF",
    popular: true,
  },
  
];
export function LiveCourses() {
  return (
    <section
      id="cursos"
      className="relative overflow-hidden bg-white py-16 text-[#07111F] md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
        <h2 className="text-3xl font-black tracking-[-0.05em]">Cursos</h2>

        <div className="mt-7 grid gap-7 md:grid-cols-3">
          {COURSES.map((course) => (
            <article
              key={course.name}
              className="group rounded-[2rem] bg-white p-6 shadow-[0_22px_65px_rgba(7,17,31,.12)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_85px_rgba(7,17,31,.16)]"
            >
              <div
                className="relative h-[240px] overflow-hidden rounded-[1.3rem]"
                style={{ backgroundColor: course.color }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,.55),transparent_28%)]" />

                <img
                  src={course.image}
                  alt={course.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain object-bottom p-2 transition duration-700 group-hover:scale-[1.04]"
                />

                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#054A91] shadow-sm">
                  {course.category}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {course.popular && (
                  <span className="rounded-md bg-[#F34CB5] px-3 py-1.5 text-xs font-black uppercase text-white">
                    💣 Sale
                  </span>
                )}

                <span className="rounded-md bg-[#F1F3F5] px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em] text-[#07111F]/75">
                  🎓 {course.category}
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-black tracking-[-0.04em]">
                {course.name}
              </h3>

              <p className="mt-4 min-h-[56px] text-base font-semibold leading-7 text-[#07111F]/72">
                {course.desc}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-lg bg-[#F1F3F5] px-3 py-2 text-sm font-bold text-[#07111F]/65">
                  ☆ Nivel {course.level}
                </span>

                <span className="rounded-lg bg-[#F1F3F5] px-3 py-2 text-sm font-bold text-[#07111F]/65">
                  ◉ {course.students}
                </span>

                <span className="rounded-lg bg-[#26B7C7] px-3 py-2 text-sm font-black text-white">
                  🔥 20% OFF
                </span>

                <span className="rounded-lg bg-[#F1F3F5] px-3 py-2 text-sm font-bold text-[#07111F]/65">
                  👥 {course.teachers}
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-end gap-3">
                  <span className="text-lg font-bold text-[#07111F]/55 line-through">
                    S/{course.oldPrice}
                  </span>
                  <span className="text-2xl font-black text-[#F59E0B]">
                    S/{course.price}
                  </span>
                </div>

                <a
                  href="https://wa.link/6ktnb5"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-[#054A91] px-6 py-3 text-sm font-black text-white shadow-[0_16px_36px_rgba(5,74,145,.22)] transition hover:-translate-y-0.5 hover:bg-[#0A72C9]"
                >
                  ¡Me apunto! ›
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}