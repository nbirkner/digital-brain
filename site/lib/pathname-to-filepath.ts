/**
 * Maps a Next.js pathname to the corresponding file path in the repo.
 * Returns null for list pages, hub pages, and any path that doesn't have an editable file.
 */
export function pathnameToFilePath(pathname: string): string | null {
  // Strip trailing slash
  const p = pathname.replace(/\/$/, "")

  // ── Notes ──────────────────────────────────────────────────────────────────
  const notes = p.match(/^\/notes\/(.+)$/)
  if (notes) return `personal/notes/${notes[1]}.md`

  // ── Goals ──────────────────────────────────────────────────────────────────
  const goals = p.match(/^\/goals\/(.+)$/)
  if (goals) return `personal/docs/growth/${goals[1]}.md`

  // ── Career External ────────────────────────────────────────────────────────
  const careerExternal = p.match(/^\/career-external\/(.+)$/)
  if (careerExternal) return `personal/docs/career/${careerExternal[1]}.md`

  // ── Meetings (personal) ────────────────────────────────────────────────────
  const meetings = p.match(/^\/meetings\/(.+)$/)
  if (meetings) return `personal/notes/${meetings[1]}.md`

  // ── Life / Health ──────────────────────────────────────────────────────────
  const lifeHealth = p.match(/^\/life\/health\/(.+)$/)
  if (lifeHealth) return `personal/site/health/${lifeHealth[1]}.md`

  // ── Niki / Health ──────────────────────────────────────────────────────────
  const nikiHealth = p.match(/^\/self\/health\/(.+)$/)
  if (nikiHealth) return `personal/docs/health/${nikiHealth[1]}.md`

  // ── Niki / Beauty ──────────────────────────────────────────────────────────
  const nikiBeauty = p.match(/^\/self\/beauty\/(.+)$/)
  if (nikiBeauty) return `personal/docs/life/beauty/${nikiBeauty[1]}.md`

  // ── Niki / Routine ─────────────────────────────────────────────────────────
  const nikiRoutine = p.match(/^\/self\/routine\/(.+)$/)
  if (nikiRoutine) return `personal/docs/life/routine/${nikiRoutine[1]}.md`

  // ── Niki / Quotes ──────────────────────────────────────────────────────────
  const nikiQuotes = p.match(/^\/self\/quotes\/(.+)$/)
  if (nikiQuotes) return `personal/docs/library/quotes/${nikiQuotes[1]}.md`

  // ── Niki / Certifications ──────────────────────────────────────────────────
  const nikiCertifications = p.match(/^\/self\/certifications\/(.+)$/)
  if (nikiCertifications) return `personal/docs/library/certifications/${nikiCertifications[1]}.md`

  // ── Niki / Strengths ───────────────────────────────────────────────────────
  const nikiStrengths = p.match(/^\/self\/strengths\/(.+)$/)
  if (nikiStrengths) return `personal/docs/growth/strengths/${nikiStrengths[1]}.md`

  // ── Niki / Social ──────────────────────────────────────────────────────────
  const nikiSocial = p.match(/^\/self\/social\/(.+)$/)
  if (nikiSocial) return `personal/docs/life/social/${nikiSocial[1]}.md`

  // ── Niki / Costa Rica ──────────────────────────────────────────────────────
  const nikiCostaRica = p.match(/^\/self\/costa-rica\/(.+)$/)
  if (nikiCostaRica) return `personal/docs/life/costa-rica/${nikiCostaRica[1]}.md`

  // ── Niki / Private / Reflections ───────────────────────────────────────────
  const nikiPrivateReflections = p.match(/^\/self\/private\/reflections\/(.+)$/)
  if (nikiPrivateReflections) return `personal/docs/growth/reflections/${nikiPrivateReflections[1]}.md`

  // ── Niki / Private (general) ───────────────────────────────────────────────
  // Must come AFTER the more-specific reflections route above
  const nikiPrivate = p.match(/^\/self\/private\/(.+)$/)
  if (nikiPrivate) return `personal/docs/growth/private/${nikiPrivate[1]}.md`

  // ── Life / Philosophy ──────────────────────────────────────────────────────
  const lifePhilosophy = p.match(/^\/life\/philosophy\/(.+)$/)
  if (lifePhilosophy) return `personal/docs/life/philosophy/${lifePhilosophy[1]}.md`

  // ── Life / Travel ──────────────────────────────────────────────────────────
  const lifeTravel = p.match(/^\/life\/travel\/(.+)$/)
  if (lifeTravel) return `personal/site/travel/${lifeTravel[1]}.md`

  // ── Life / Finances ────────────────────────────────────────────────────────
  const lifeFinances = p.match(/^\/life\/finances\/(.+)$/)
  if (lifeFinances) return `personal/site/finances/${lifeFinances[1]}.md`

  // ── Life / Housing ─────────────────────────────────────────────────────────
  const lifeHousing = p.match(/^\/life\/housing\/(.+)$/)
  if (lifeHousing) return `personal/site/housing/${lifeHousing[1]}.md`

  // ── Life / Cars ────────────────────────────────────────────────────────────
  const lifeCars = p.match(/^\/life\/cars\/(.+)$/)
  if (lifeCars) return `personal/site/cars/${lifeCars[1]}.md`

  // ── Life / Side Hustles ────────────────────────────────────────────────────
  const lifeSideHustles = p.match(/^\/life\/side-hustles\/(.+)$/)
  if (lifeSideHustles) return `personal/docs/life/side-hustles/${lifeSideHustles[1]}.md`

  // ── Life / Luci ────────────────────────────────────────────────────────────
  const lifeLuci = p.match(/^\/life\/luci\/(.+)$/)
  if (lifeLuci) return `personal/site/pet/${lifeLuci[1]}.md`

  // ── Work / PRDs ────────────────────────────────────────────────────────────
  const workPrds = p.match(/^\/work\/prds\/(.+)$/)
  if (workPrds) return `work/docs/prds/${workPrds[1]}.md`

  // ── Work / Meetings ────────────────────────────────────────────────────────
  const workMeetings = p.match(/^\/work\/meetings\/(.+)$/)
  if (workMeetings) return `work/notes/${workMeetings[1]}.md`

  // ── Work / Decisions ───────────────────────────────────────────────────────
  const workDecisions = p.match(/^\/work\/decisions\/(.+)$/)
  if (workDecisions) return `work/docs/decisions/${workDecisions[1]}.md`

  // ── Work / Comms ───────────────────────────────────────────────────────────
  const workComms = p.match(/^\/work\/comms\/(.+)$/)
  if (workComms) return `work/docs/comms/${workComms[1]}.md`

  // ── Work / Analyses ────────────────────────────────────────────────────────
  const workAnalyses = p.match(/^\/work\/analyses\/(.+)$/)
  if (workAnalyses) return `work/docs/analyses/${workAnalyses[1]}.md`

  // ── Work / Strategy ────────────────────────────────────────────────────────
  const workStrategy = p.match(/^\/work\/strategy\/(.+)$/)
  if (workStrategy) return `work/site/strategy/${workStrategy[1]}.md`

  // ── Work / Career ──────────────────────────────────────────────────────────
  const workCareer = p.match(/^\/work\/career\/(.+)$/)
  if (workCareer) return `work/docs/career/${workCareer[1]}.md`

  // ── Work / Catchup ─────────────────────────────────────────────────────────
  const workCatchup = p.match(/^\/work\/catchup\/(.+)$/)
  if (workCatchup) return `work/docs/catchup/${workCatchup[1]}.md`

  // ── Work / Guides ──────────────────────────────────────────────────────────
  const workGuides = p.match(/^\/work\/guides\/(.+)$/)
  if (workGuides) return `work/docs/guides/${workGuides[1]}.md`

  // ── Work / Superpowers ─────────────────────────────────────────────────────
  const workSuperpowers = p.match(/^\/work\/superpowers\/(.+)$/)
  if (workSuperpowers) return `work/docs/superpowers/${workSuperpowers[1]}.md`

  // ── Work / Workflow ────────────────────────────────────────────────────────
  const workWorkflow = p.match(/^\/work\/workflow\/(.+)$/)
  if (workWorkflow) return `work/docs/workflow-improvements/${workWorkflow[1]}.md`

  // ── Logs ───────────────────────────────────────────────────────────────────
  const logs = p.match(/^\/logs\/(.+)$/)
  if (logs) return `personal/docs/logs/${logs[1]}.md`

  // No mapping — list page, hub page, or unknown route
  return null
}
