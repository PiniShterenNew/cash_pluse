// Server Component — no interactivity needed

export function AuthHeroPanel() {
  return (
    <div
      className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, var(--color-mint-500) 0%, var(--color-mint-700) 60%, #0f6630 100%)",
        minHeight: "100dvh",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-[-80px] end-[-80px] w-[320px] h-[320px] rounded-full opacity-20"
        style={{ background: "rgba(255,255,255,0.3)", filter: "blur(60px)" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-60px] start-[-60px] w-[240px] h-[240px] rounded-full opacity-15"
        style={{ background: "rgba(255,255,255,0.25)", filter: "blur(48px)" }}
        aria-hidden="true"
      />

      {/* Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <span className="text-white text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
              C
            </span>
          </div>
          <span
            className="text-white text-xl font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            CashPulse
          </span>
        </div>
      </div>

      {/* Center illustration & copy */}
      <div className="relative z-10 flex flex-col gap-6">
        {/* Abstract financial illustration */}
        <div className="flex flex-col gap-3">
          {/* Mock KPI cards */}
          {[
            { label: "יתרה נוכחית", value: "₪48,200", up: true },
            { label: "חובות פתוחים", value: "₪12,500", up: false },
            { label: "צפי לחודש", value: "₪61,000", up: true },
          ].map((item, i) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-[var(--radius-md)] px-5 py-4"
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                animationDelay: `${i * 80}ms`,
              }}
            >
              <span className="text-white/80 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                {item.label}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="text-white font-medium"
                  style={{ fontFamily: "var(--font-mono)" }}
                  dir="ltr"
                >
                  {item.value}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: item.up
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,100,100,0.3)",
                    color: "white",
                  }}
                >
                  {item.up ? "▲" : "▼"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="relative z-10">
        <h2
          className="text-white text-2xl font-semibold leading-snug mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          קוקפיט פיננסי לעסקים קטנים
        </h2>
        <p className="text-white/70 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
          ניהול חובות, גביה חכמה, ותחזית תזרים —
          <br />
          הכל במקום אחד, בעברית.
        </p>
      </div>
    </div>
  );
}
