const MOCK_FEATURES = [
  "Mock Test completo Cambridge",
  "Reading & Use of English",
  "Listening",
  "Writing con corrección docente",
  "Speaking con feedback personalizado",
  "Reporte de desempeño por skill",
];

function CheckIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F59E0B] text-xs font-black text-white">
      ✓
    </span>
  );
}

export function ExamPrices() {
  return (
    <section
      id="mock-tests"
      className="relative overflow-hidden bg-[#054A91] py-16 text-white md:py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:px-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-5 py-2 text-xs font-black uppercase tracking-[0.16em]">
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
            ACELINGUA Mock Tests
          </div>

          <h2 className="mt-6 max-w-2xl text-[clamp(2.1rem,4.7vw,4.8rem)] font-black leading-[0.95] tracking-[-0.065em]">
            Simula tu examen antes del examen real.
          </h2>

          <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-white/72 md:text-lg">
            Practica con un mock test completo, recibe feedback docente y conoce
            tu desempeño real antes de rendir Cambridge, IELTS o un examen
            internacional.
          </p>

          <div className="mt-8 space-y-4">
            {MOCK_FEATURES.map((item) => (
              <div key={item} className="flex items-center gap-4">
                <CheckIcon />
                <p className="text-base font-bold text-white/86">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a
              href="https://wa.link/6ktnb5"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-[#F59E0B] px-8 py-4 text-sm font-black text-white shadow-[0_20px_50px_rgba(245,158,11,.28)] transition hover:-translate-y-0.5 hover:bg-[#FFAA2A]"
            >
              Comprar mock test →
            </a>

            <p className="max-w-xs text-sm font-bold leading-6 text-white/55">
              Ideal para medir tu nivel antes de invertir en el examen oficial.
            </p>
          </div>
        </div>

        <div className="relative flex min-h-[560px] items-center justify-center">
          <div className="absolute h-[430px] w-[430px] rounded-full bg-white/10" />
          <div className="absolute -right-8 top-20 h-72 w-72 rounded-full bg-[#26B7C7]/20 blur-[90px]" />
          <div className="absolute -left-8 bottom-16 h-72 w-72 rounded-full bg-[#F59E0B]/18 blur-[90px]" />

          <div className="relative z-20 w-full max-w-[500px] rounded-[2rem] bg-white p-6 text-[#07111F] shadow-[0_35px_90px_rgba(0,0,0,.25)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#054A91]/55">
                  Mock Test Report
                </p>

                <h3 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#054A91]">
                  Cambridge B2 First
                </h3>
              </div>

              <div className="rounded-2xl bg-[#F59E0B] px-4 py-2 text-sm font-black text-white">
                Full Mock
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              {[
                ["Reading & Use", "78%"],
                ["Listening", "84%"],
                ["Writing", "72%"],
                ["Speaking", "80%"],
              ].map(([skill, score]) => (
                <div key={skill}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-[#07111F]/65">
                      {skill}
                    </span>
                    <span className="font-black text-[#054A91]">{score}</span>
                  </div>

                  <div className="h-2 rounded-full bg-[#EEF2F7]">
                    <div
                      className="h-2 rounded-full bg-[#0A72C9]"
                      style={{ width: score }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                ["Score", "168"],
                ["Level", "B2"],
                ["Feedback", "24h"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-[#F1F3F5] p-4 text-center"
                >
                  <p className="text-2xl font-black text-[#054A91]">{value}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#07111F]/45">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-[#054A91] p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/50">
                Precio lanzamiento
              </p>

              <div className="mt-2 flex items-end gap-3">
                <span className="text-5xl font-black tracking-[-0.08em]">
                  S/35
                </span>
                <span className="pb-2 text-base font-bold text-white/45 line-through">
                  S/50
                </span>
              </div>

              <p className="mt-2 text-sm font-bold text-white/65">
                Incluye corrección y reporte de desempeño.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}