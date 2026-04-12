import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import LabelPageContent from "@/components/LabelPageContent"
import ChakraTable from "./ChakraTable"

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-700",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700",
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-700",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-700",
  rose: "bg-rose-500/10 border-rose-500/20 text-rose-700",
}

const badgeMap: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-700",
  emerald: "bg-emerald-500/10 text-emerald-700",
  violet: "bg-violet-500/10 text-violet-700",
  amber: "bg-amber-500/10 text-amber-700",
  rose: "bg-rose-500/10 text-rose-700",
}

const SUBPAGES = [
  { href: "/personal/growth/spirituality/astrology", icon: "🔮", label: "Astrology" },
  { href: "/personal/growth/spirituality/the-thaw", icon: "🌊", label: "The Thaw" },
  { href: "/personal/growth/spirituality/dana-sessions", icon: "✦", label: "Dana Sessions" },
  { href: "/personal/growth/spirituality/reiki", icon: "✋", label: "Reiki" },
  { href: "/personal/growth/spirituality/manifestation", icon: "📝", label: "Manifestation" },
  { href: "/personal/growth/spirituality/grounding", icon: "🌳", label: "Grounding" },
]

const identityTrio = [
  {
    name: "Claircognizant",
    subtitle: "Knowing without explanation",
    color: "blue",
    icon: "⚡",
    meaning: "I felt the exact second Natalia's therapy session became unbearable. Different room, different building, zero contact. Not approximately. The exact second. I'd been calling that anxiety for seven years. It wasn't anxiety. It was a precision instrument that had been faithfully logging data my whole life.",
    badge: "Psychic Gift",
  },
  {
    name: "Manifestor",
    subtitle: "Energy held inside shapes reality outside",
    color: "amber",
    icon: "✦",
    meaning: "At 2:01pm, while I was sitting with Dana in Sausalito, Juan texted from 20 miles away: 'I'm kind of having an emotional time. I just broke down. I think some trauma's just surfaced out of nowhere.' Dana had been getting full-body chills tuning into him minutes before. He didn't know why he broke down. He reached for the only thing he could — a photo of him and Luci. I've also watched Brazil happen at a border crossing. Both directions work.",
    badge: "Creative Force",
  },
  {
    name: "Guardian of the Waters",
    subtitle: "Protects what is fluid",
    color: "violet",
    icon: "🌊",
    meaning: "Session 3. Dana finished the energy work, grabbed a book, and started reading my power animal aloud. She kept stopping. Kept looking up. Kept saying 'this is insane.' Every single line. Master communicator. Telepathic. Someone people seek for counsel without knowing why. She couldn't believe what she was reading. Neither could I.",
    badge: "Soul Role",
  },
]

const spiritAnimals = [
  {
    icon: "🐬",
    name: "Dolphin",
    subtitle: "Power Animal",
    color: "blue",
    description: "Dana grabbed a book mid-session and read my power animal aloud. She kept stopping. Kept looking up. Kept saying 'this is insane.' Every line. Master communicator. Telepathic. Someone people seek for counsel without fully knowing why. She couldn't believe what she was reading. I wasn't expecting to recognize myself so completely in any of it.",
  },
  {
    icon: "🦌",
    name: "White Stag",
    subtitle: "Spiritual Leveling Up",
    color: "emerald",
    description: "It appeared during energy work and Dana went quiet. Said she'd almost never seen one. Antlers as antenna — connection to the universe. A symbol of leveling up spiritually. It was white. It had many points. She said it was mine.",
  },
  {
    icon: "✦",
    name: "Pegasus",
    subtitle: "Three Locations, One Message",
    color: "violet",
    description: "First in meditation. Then mid-session over my client's table — I looked up and asked it directly: are you here for me or for her? It said both. That evening her daughter in Las Vegas felt a pull to photograph herself in front of a Pegasus fountain and sent it to her mother without knowing why. Three people. Three locations. One day. I've stopped calling these coincidences.",
  },
  {
    icon: "🦅",
    name: "Hawk",
    subtitle: "Past-Life Companion",
    color: "amber",
    description: "Dana and I went flying together in the session — hawks, soaring, the whole terrain visible. She said she saw past lives: us as mystics and alchemists, doing this work in another time. That sounds completely insane until you're sitting in that room.",
  },
]

const chakras = [
  { emoji: "👑", position: "Crown · 7th", symbol: "Aslan", note: "Guardian of divine connection. Not safe but good." },
  { emoji: "🔮", position: "Third Eye · 6th", symbol: "Eagle", note: "Both zoom-in and wide-view. See the whole terrain." },
  { emoji: "📣", position: "Throat · 5th", symbol: "Megaphone", note: "For truth still waiting to be spoken." },
  { emoji: "🛡️", position: "Heart · 4th", symbol: "Shield", note: "Protects without closing. Sovereign love." },
  { emoji: "🐉", position: "Solar Plexus · 3rd", symbol: "Dragon", note: "Don't let her shrink. Breathes fire on behalf of your becoming." },
  { emoji: "🔱", position: "Sacral · 2nd", symbol: "Trident", note: "Your feeling is force. Tidal." },
  { emoji: "🌳", position: "Root · 1st", symbol: "Oak", note: "Ancient. Unmovable. Grounded." },
]

const practices = [
  {
    icon: "✋",
    name: "Reiki",
    cadence: "Daily",
    cadenceColor: "rose",
    description: "Certified Level 1 and 2. I went to my first session desperate, not believing. Now the warmth arrives within three minutes. Juan asks for it on hard nights — the man who used to say 'that's weird' asks me now.",
  },
  {
    icon: "🧘",
    name: "Meditation",
    cadence: "Daily · 20 min",
    cadenceColor: "violet",
    description: "20 minutes, MBSR, Insight Timer. The grounding cord changed everything — cord from my first chakra to the center of the planet, widening until I feel expansion instead of floating. My spirit needed a reason to stay in my body. This gives it one.",
  },
  {
    icon: "📝",
    name: "Manifestation",
    cadence: "As called",
    cadenceColor: "amber",
    description: "Dana's method. Write it on a Post-it. Hand over it. Say it aloud. The speaking aloud part is what makes it real — when it's only in your head it's still thought, when it leaves your mouth it's matter. I watched Brazil happen. I've stopped being surprised.",
  },
  {
    icon: "🃏",
    name: "Tarot & Oracle",
    cadence: "For major moments",
    cadenceColor: "blue",
    description: "I read my own cards. Not for fortune-telling — for pattern recognition. The Song of the Wind keeps coming up. Communication. Truth. Release what isn't authentic. Every time. It's been the right message.",
  },
  {
    icon: "⛪",
    name: "St. Dominic's",
    cadence: "Wednesdays · 7:30pm",
    cadenceColor: "emerald",
    description: "Wednesdays at 7:30. My Catholic roots sit right next to Reiki and tarot and I've stopped trying to explain that to people. They all point at the same thing.",
  },
]

const mantras = [
  { quote: "Nothing has ever been wrong with you. You were just never told what you were actually doing there.", source: "Dana Welch" },
  { quote: "Mi princesa, you're more than you think. Keep going.", source: "Abuelo" },
  { quote: "The size of your love is not the wound. It has never been the wound. It is the instrument. It is what reached Natalia through a wall. It is what cracked Juan open at 2:01.", source: "Soul work" },
  { quote: "Your soul's assignment is to protect what is fluid.", source: "Dana Welch" },
  { quote: "Just for today, I will not anger. Just for today, I will not worry.", source: "Five Reiki Precepts" },
  { quote: "Being fully yourself is the work.", source: "North Node in Leo conjunct Sun" },
]

export default function SpiritualityPage() {
  return (
    <div>
      <PagePathStatic path="personal/growth/spirituality" />
      <PageHeader
        icon="✨"
        title="Spirituality"
        description="Reiki, astrology, Dana, and figuring out what I've always known."
      />

      <div className="space-y-8">

        {/* Subpage Navigation */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {SUBPAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="flex flex-col items-center gap-1.5 bg-notion-surface border border-notion-border rounded-xl p-3 hover:bg-notion-hover transition-colors text-center group"
            >
              <span className="text-xl">{page.icon}</span>
              <span className="text-xs font-medium text-notion-muted group-hover:text-notion-text transition-colors leading-tight">{page.label}</span>
            </Link>
          ))}
        </div>

        {/* Identity Trio */}
        <div>
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">Identity Trio</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {identityTrio.map((item) => (
              <div
                key={item.name}
                className={`rounded-xl border p-5 ${colorMap[item.color]}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${badgeMap[item.color]}`}>
                    {item.badge}
                  </span>
                </div>
                <p className="font-bold text-base leading-tight mb-1">{item.name}</p>
                <p className="text-xs opacity-60 font-medium mb-3 italic">{item.subtitle}</p>
                <p className="text-xs opacity-75 leading-snug">{item.meaning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* North Star Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/15 via-amber-500/10 to-rose-500/15 border border-violet-500/20 p-7">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-700/60 mb-4">North Star · Q2 2026</p>
          <div className="flex flex-wrap gap-4 mb-4">
            <span className="text-3xl font-bold text-violet-700">Whimsy.</span>
            <span className="text-3xl font-bold text-amber-700">Fulfilled.</span>
            <span className="text-3xl font-bold text-rose-700">Light.</span>
          </div>
          <p className="text-sm text-notion-muted leading-relaxed max-w-lg italic">
            Not productivity. Not performance. Just — here. Alive. Following whatever hums.
          </p>
        </div>

        {/* Soul's Assignment */}
        <div className="border-l-4 border-violet-500/40 pl-5 py-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-700/60 mb-3">The assignment</p>
          <p className="text-xs text-notion-muted italic mb-3">Session 3. She said this like she was reading a weather report.</p>
          <blockquote className="text-base text-notion-text leading-relaxed italic mb-3">
            &ldquo;You feel the currents between people before they know to look. You reach across rooms and buildings and cities and apparently time itself to find the people who are struggling in their own waters and you say — I&rsquo;m here. I felt it. Are you okay. You have been doing your soul&rsquo;s work your whole life. Without the title. Without the tools. Without anyone telling you it was real.&rdquo;
          </blockquote>
          <p className="text-xs text-notion-muted font-medium">— Dana Welch</p>
        </div>

        {/* Grandfather */}
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">🌹</span>
            <div>
              <p className="font-semibold text-rose-700 text-sm">Abuelo · Valentine&rsquo;s Day 2023</p>
              <p className="text-xs text-notion-muted">Still present</p>
            </div>
          </div>
          <p className="text-sm text-notion-text leading-relaxed italic mb-3">
            He had roses in his Costa Rican garden. Every morning he went out to tend them, he thought of me. He sent a rose to my college graduation when he was too sick to fly. My apartment roses died overnight when he passed — one day to the next. Dana mentioned roses in our session without knowing anything. I fell apart.
          </p>
          <p className="text-base text-rose-700 font-medium italic leading-relaxed mb-4">
            &ldquo;Mi princesa, you&rsquo;re more than you think. Keep going.&rdquo;
          </p>
          <div className="bg-rose-500/10 rounded-lg px-4 py-3">
            <p className="text-xs text-rose-700 font-medium">To connect: tap your heart and say hello.</p>
          </div>
        </div>

        {/* Spirit Animals */}
        <div>
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">Spirit Animals</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {spiritAnimals.map((animal) => (
              <div
                key={animal.name}
                className={`rounded-xl border p-4 ${colorMap[animal.color]}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{animal.icon}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${badgeMap[animal.color]}`}>
                    {animal.subtitle}
                  </span>
                </div>
                <p className="font-bold text-sm leading-tight mb-2">{animal.name}</p>
                <p className="text-xs opacity-75 leading-snug">{animal.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chakra Symbols */}
        <div>
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">Chakra Symbols</p>
          <p className="text-xs text-notion-muted mb-3">Dana placed these in our second session. I could feel each one land. The dragon was last. One instruction: don&rsquo;t let her shrink.</p>
          <ChakraTable data={chakras} />
        </div>

        {/* Practices */}
        <div>
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">Practices</p>
          <div className="space-y-2">
            {practices.map((practice) => (
              <div
                key={practice.name}
                className="bg-notion-surface border border-notion-border rounded-xl px-4 py-4 flex items-start gap-3"
              >
                <span className="text-xl mt-0.5">{practice.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-notion-text text-sm">{practice.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${badgeMap[practice.cadenceColor]}`}>
                      {practice.cadence}
                    </span>
                  </div>
                  <p className="text-xs text-notion-muted leading-relaxed">{practice.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Words That Live Here */}
        <div>
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">Words That Live Here</p>
          <div className="space-y-3">
            {mantras.map((mantra, i) => (
              <div
                key={i}
                className="border-l-4 border-amber-500/30 pl-4 py-1"
              >
                <p className="text-sm text-notion-text italic leading-relaxed mb-1">&ldquo;{mantra.quote}&rdquo;</p>
                <p className="text-xs text-notion-muted">— {mantra.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">Explore</p>
          <div className="space-y-2">
            <Link
              href="/personal/growth/spirituality/astrology"
              className="flex items-start gap-3 bg-notion-surface hover:bg-notion-hover border border-notion-border rounded-xl p-4 transition-colors"
            >
              <span className="text-2xl">🔮</span>
              <div>
                <h3 className="font-semibold text-notion-text">Astrology</h3>
                <p className="text-notion-muted text-sm mt-0.5">Birth chart, Big 3, placements, and astrological explorations</p>
              </div>
              <span className="text-notion-muted/40 text-sm ml-auto self-center">→</span>
            </Link>
            <Link
              href="/personal/growth/spirituality/dana-sessions"
              className="flex items-start gap-3 bg-notion-surface hover:bg-notion-hover border border-notion-border rounded-xl p-4 transition-colors"
            >
              <span className="text-2xl">🌿</span>
              <div>
                <h3 className="font-semibold text-notion-text">Dana Sessions</h3>
                <p className="text-notion-muted text-sm mt-0.5">Energy healing, past-life connections, and what Dana saw</p>
              </div>
              <span className="text-notion-muted/40 text-sm ml-auto self-center">→</span>
            </Link>
            <Link
              href="/personal/growth/spirituality/the-thaw"
              className="flex items-start gap-3 bg-notion-surface hover:bg-notion-hover border border-notion-border rounded-xl p-4 transition-colors"
            >
              <span className="text-2xl">🌊</span>
              <div>
                <h3 className="font-semibold text-notion-text">The Thaw and the Garden</h3>
                <p className="text-notion-muted text-sm mt-0.5">On being a receiver, the ice melting, and what the garden was always yours</p>
              </div>
              <span className="text-notion-muted/40 text-sm ml-auto self-center">→</span>
            </Link>
            <Link
              href="/personal/growth/spirituality/reiki"
              className="flex items-start gap-3 bg-notion-surface hover:bg-notion-hover border border-notion-border rounded-xl p-4 transition-colors"
            >
              <span className="text-2xl">✋</span>
              <div>
                <h3 className="font-semibold text-notion-text">Reiki</h3>
                <p className="text-notion-muted text-sm mt-0.5">Level 2 practice, the lineage, and what happens when my spirit is in my body</p>
              </div>
              <span className="text-notion-muted/40 text-sm ml-auto self-center">→</span>
            </Link>
            <Link
              href="/personal/growth/spirituality/manifestation"
              className="flex items-start gap-3 bg-notion-surface hover:bg-notion-hover border border-notion-border rounded-xl p-4 transition-colors"
            >
              <span className="text-2xl">✦</span>
              <div>
                <h3 className="font-semibold text-notion-text">Manifestation</h3>
                <p className="text-notion-muted text-sm mt-0.5">Dana&apos;s Post-it method and the responsibility of pointing creative force in the right direction</p>
              </div>
              <span className="text-notion-muted/40 text-sm ml-auto self-center">→</span>
            </Link>
            <Link
              href="/personal/growth/spirituality/grounding"
              className="flex items-start gap-3 bg-notion-surface hover:bg-notion-hover border border-notion-border rounded-xl p-4 transition-colors"
            >
              <span className="text-2xl">🌳</span>
              <div>
                <h3 className="font-semibold text-notion-text">Grounding Practice</h3>
                <p className="text-notion-muted text-sm mt-0.5">Grounding cord, aura boundary, gold sun — giving my spirit enough safety to stay</p>
              </div>
              <span className="text-notion-muted/40 text-sm ml-auto self-center">→</span>
            </Link>
          </div>
        </div>

      </div>
      <LabelPageContent tagId="spiritual" />
    </div>
  )
}
