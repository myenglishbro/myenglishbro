const STAFF = [
  {
    name: "Carlos Apolaya",
    role: "Academic Lead · Teacher Trainer",
    image: "https://i.ibb.co/FbPtsfSx/123qaseasd123asdasdasd.png",
    tags: ["C2", "Engineer", "Trainer"],
    featured: true,
  },
  {
    name: "Salomé Aguilar",
    role: "Academic Lead · Cambridge Teacher",
    image: "https://i.ibb.co/Swm3fGbJ/asd3we12312.png",
    tags: ["CELTA", "CPE", "B1/B2"],
    featured: true,
  },
  {
    name: "Karen Zuta",
    role: "Cambridge Teacher",
    image: "https://i.ibb.co/dFRXbhP/e1eqweqwe.png",
    tags: ["C2", "TKT", "TEFL"],
  },
  {
    name: "Simon",
    role: "Cambridge Teacher",
    image: "https://i.ibb.co/whpB5hQd/asdasdasdasdas.png",
    tags: ["CAE", "FCE", "PET"],
  },
  {
    name: "Luz",
    role: "IELTS · Academic English",
    image: "https://i.ibb.co/RTh0jD5B/asd2221.png",
    tags: ["IELTS", "Writing", "Speaking"],
  },
  {
    name: "Nathan",
    role: "IELTS · Academic English",
    image:
      "https://i.ibb.co/k2B5JVZJ/30ac81c7-e47d-47a9-89a5-1b9673a231c5.jpg",
    tags: ["IELTS", "Writing", "Speaking"],
  },
  {
    name: "Nicole Gastelo",
    role: "B1 · B2 Cambridge Teacher",
    image: "https://i.ibb.co/0ZNzn4C/123213sdasdasdasdasd.png",
    tags: ["IELTS", "Writing", "Speaking"],
  },
  {
    name: "Santiago",
    role: "Speaking Coach",
    image: "https://i.ibb.co/mrt8w7Cd/ssssss.png",
    tags: ["Fluency", "B1/B2", "Exam Prep"],
  },
  {
    name: "Paola",
    role: "Speaking Coach",
    image: "https://i.ibb.co/qY3pW4Pp/qd2312.png",
    tags: ["Fluency", "B1/B2", "Exam Prep"],
  },
];

const MaybeYouCard = () => (
  <article className="group min-w-[250px] md:min-w-[280px]">
    <div className="flex h-[300px] items-center justify-center overflow-hidden rounded-[1.5rem] bg-[#DCE8F8] shadow-[0_16px_42px_rgba(5,74,145,.08)] transition duration-500 group-hover:-translate-y-1">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl font-black text-[#054A91] shadow-sm">
          +
        </div>

        <h3 className="mt-5 text-2xl font-black tracking-[-0.04em] text-[#07111F]">
          Maybe you?
        </h3>

        <p className="mx-auto mt-2 max-w-[210px] text-sm font-semibold leading-5 text-[#07111F]/58">
          ¿Quieres formar parte del equipo?
        </p>
      </div>
    </div>

    <div className="pt-4">
      <h3 className="text-xl font-black tracking-[-0.04em] text-[#07111F]">
        Join our team
      </h3>

      <p className="mt-2 text-sm font-semibold leading-6 text-[#07111F]/65">
        Buscamos teachers para Cambridge, IELTS y speaking.
      </p>

      <a
        href="https://wa.link/6ktnb5"
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex rounded-xl bg-[#F59E0B] px-4 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#FFAA2A]"
      >
        Postular →
      </a>
    </div>
  </article>
);

export function Teachers() {
  const items = [...STAFF, "maybe-you"];
  const loopItems = [...items, ...items];

  return (
    <section
      id="docentes"
      className="relative overflow-hidden bg-white py-14 text-[#07111F] md:py-20"
    >
      <style>{`
        @keyframes teachersMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .teachers-marquee {
          animation: teachersMarquee 42s linear infinite;
        }

        .teachers-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0A72C9]">
              Equipo docente
            </p>

            <h2 className="mt-3 text-[clamp(1.9rem,3.6vw,3.2rem)] font-black leading-[0.98] tracking-[-0.055em] text-[#07111F]">
              The team behind everything
            </h2>

            <p className="mt-3 max-w-xl text-base leading-7 text-[#07111F]/62">
              Teachers especializados en Cambridge, IELTS, speaking y exámenes
              internacionales.
            </p>
          </div>

         
        </div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-white to-transparent" />

          <div className="teachers-marquee flex w-max gap-6 pb-4">
            {loopItems.map((item, index) => {
              if (item === "maybe-you") {
                return <MaybeYouCard key={`maybe-you-${index}`} />;
              }

              return (
                <article
                  key={`${item.name}-${index}`}
                  className="group min-w-[250px] md:min-w-[280px]"
                >
                  <div className="relative h-[300px] overflow-hidden rounded-[1.5rem] bg-[#DCE8F8] shadow-[0_16px_42px_rgba(5,74,145,.08)] transition duration-500 group-hover:-translate-y-1">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.04]"
                    />

                    {item.featured && (
                      <div className="absolute left-3 top-3 rounded-full bg-[#F59E0B] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white shadow-[0_10px_25px_rgba(245,158,11,.35)]">
                        Lead
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <h3 className="text-xl font-black tracking-[-0.04em] text-[#07111F]">
                      {item.name}
                    </h3>

                    <p className="mt-2 text-sm font-semibold leading-6 text-[#07111F]/65">
                      {item.role}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-[#E9EEF5] px-2.5 py-1.5 text-[11px] font-bold text-[#07111F]/72"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}