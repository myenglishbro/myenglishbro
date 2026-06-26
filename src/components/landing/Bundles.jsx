const BOX_ITEMS = [
  "Key Word Transformation",
  "Banco de Preguntas Cambridge",
  "Compendio de 120 temas",
  "200 errores comunes en Writing",
  "Reading Gaps y más",
];

function CheckIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F59E0B] text-xs font-black text-white">
      ✓
    </span>
  );
}

export function Bundles() {
  return (
    <section
      id="book-boxes"
      className="relative overflow-hidden bg-white py-16 text-[#07111F] md:py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:px-8 lg:grid-cols-[0.95fr_1.05fr]">
        {/* LEFT COPY */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F1F3F5] px-5 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#054A91]">
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
            ACELINGUA BOX
          </div>

          <h2 className="mt-6 max-w-2xl text-[clamp(2.1rem,4.7vw,4.8rem)] font-black leading-[0.95] tracking-[-0.065em]">
            Todo lo que necesitas para aprobar Cambridge.
          </h2>

          <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-[#07111F]/68 md:text-lg">
            5 recursos premium creados para atacar las partes más difíciles del
            examen: grammar, reading, use of English, writing y speaking.
          </p>

          <div className="mt-8 space-y-4">
            {BOX_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-4">
                <CheckIcon />
                <p className="text-base font-bold text-[#07111F]/78">{item}</p>
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
              Quiero mi box →
            </a>

            <p className="max-w-xs text-sm font-bold leading-6 text-[#07111F]/52">
              Early Bird disponible solo para los primeros 100 estudiantes.
            </p>
          </div>
        </div>

        {/* RIGHT VISUAL */}
       {/* RIGHT VISUAL */}
<div className="relative flex min-h-[620px] items-center justify-center">
  <div className="absolute h-[460px] w-[460px] rounded-full bg-[#EEF2F7]" />
  <div className="absolute -right-8 top-20 h-72 w-72 rounded-full bg-[#26B7C7]/15 blur-[90px]" />
  <div className="absolute -left-8 bottom-16 h-72 w-72 rounded-full bg-[#F59E0B]/15 blur-[90px]" />

  <div className="relative z-20 flex w-full max-w-[520px] flex-col items-center">
    <div className="relative flex h-[470px] w-full items-center justify-center">
      <img
        src="/book-box.png"
        alt="ACELINGUA Cambridge Box"
        className="h-full w-full object-contain drop-shadow-[0_50px_90px_rgba(7,17,31,.28)]"
      />

      <div className="absolute left-2 top-6 z-50 rotate-[-8deg] rounded-2xl bg-[#054A91] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white shadow-xl">
        🔥 Bestseller
      </div>

      <div className="absolute right-2 top-16 z-50 rotate-[8deg] rounded-2xl bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#054A91] shadow-xl">
        🎁 Bonus
      </div>
    </div>

    <div className="-mt-4 w-full rounded-[2rem] bg-white p-5 shadow-[0_25px_70px_rgba(7,17,31,.16)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#054A91]">
            Early Bird
          </p>

          <div className="mt-1 flex items-end gap-2">
            <span className="text-6xl font-black tracking-[-0.08em] text-[#F59E0B]">
              S/90
            </span>

            <span className="pb-2 text-lg font-bold text-[#07111F]/35 line-through">
              S/150
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#F1F3F5] px-4 py-3 text-right">
          <p className="text-xs font-black text-[#054A91]">100</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#07111F]/45">
            primeros
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm font-bold text-[#07111F]/58">
        Después: S/150 · Incluye todos los recursos de la box.
      </p>
    </div>
  </div>
</div>
      </div>

      {/* WHAT'S INSIDE */}
      <div className="mx-auto mt-6 max-w-7xl px-6 md:px-8">
        <div className="rounded-[2rem] bg-[#054A91] p-6 text-white md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/55">
                Incluye
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                5 recursos para entrenar con enfoque Cambridge
              </h3>
            </div>

            <div className="flex flex-wrap gap-3">
              {BOX_ITEMS.map((item) => (
                <span
                  key={item}
                  className="rounded-xl bg-white/12 px-4 py-2 text-xs font-black text-white backdrop-blur"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}