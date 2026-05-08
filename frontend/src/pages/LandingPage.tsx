import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import {
  Users, Building2, HandHeart, ClipboardList, Landmark, Search,
  ArrowRight, CheckCircle, Network, BarChart3, Star, ChevronRight,
  Briefcase, MapPin, MessageSquare,
} from 'lucide-react'
import ancchorMark from '../assets/ancchor-brand.svg'
import ancchorLogoFull from '../assets/ancchor-logo-w-text.svg'
import heroImage from '../assets/hero.png'

/* ── Persona cards ─────────────────────────────────────────────────────── */

const PERSONAS = [
  {
    icon: Search,
    label: 'Individuals & Families',
    color: 'bg-blue-50 text-blue-600',
    description: 'Complete a brief intake and get matched to programs that fit your specific needs — housing, food, job training, healthcare, and more.',
    cta: 'Find services',
    to: '/programs',
  },
  {
    icon: Building2,
    label: 'Nonprofits & Orgs',
    color: 'bg-indigo-50 text-indigo-600',
    description: 'List your programs, manage applications, build participant cohorts, track milestones, and connect with partner organizations.',
    cta: 'Register your org',
    to: '/register',
  },
  {
    icon: ClipboardList,
    label: 'Advocates',
    color: 'bg-violet-50 text-violet-600',
    description: 'Maintain a client roster, track each person\'s needs and goals, and apply to programs on their behalf — all from one dashboard.',
    cta: 'Manage clients',
    to: '/register',
  },
  {
    icon: HandHeart,
    label: 'Resource Navigators',
    color: 'bg-emerald-50 text-emerald-600',
    description: 'Coordinate referrals across your full caseload. Send targeted program referrals and message clients directly in the platform.',
    cta: 'Manage caseload',
    to: '/register',
  },
  {
    icon: Briefcase,
    label: 'Volunteers & Professionals',
    color: 'bg-amber-50 text-amber-600',
    description: 'Discover volunteer opportunities that match your skills and availability. Log hours and track your community impact over time.',
    cta: 'Browse opportunities',
    to: '/opportunities',
  },
  {
    icon: Landmark,
    label: 'Funders & Foundations',
    color: 'bg-rose-50 text-rose-600',
    description: 'Review grant applications, track award disbursements, and get visibility into the programs your funding supports.',
    cta: 'Learn more',
    to: '/register',
  },
]

/* ── Feature highlights ────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Search,
    title: 'Need-based matching',
    description: 'A short intake questionnaire maps each person\'s situation to the programs most likely to help. No more searching through directories — the right services surface automatically.',
  },
  {
    icon: Network,
    title: 'Partner network',
    description: 'Organizations discover each other, request partnerships, co-own programs, and share opportunities. Build the coalition your community needs — not just individual org silos.',
  },
  {
    icon: BarChart3,
    title: 'Milestone & outcome tracking',
    description: 'Program administrators set milestones; participants check off progress as they move through the program. Outcomes roll up into impact reports automatically.',
  },
  {
    icon: MessageSquare,
    title: 'Built-in messaging',
    description: 'Advocates, navigators, org staff, and clients communicate through the platform — no email back-and-forth, no lost threads. Everything attached to the people it\'s about.',
  },
  {
    icon: ClipboardList,
    title: 'Advocate caseload tools',
    description: 'Advocates maintain full client profiles — housing status, employment, needs, goals, and barriers — and apply to programs on behalf of clients with a single click.',
  },
  {
    icon: Star,
    title: 'Activity feed',
    description: 'A real-time feed surfaces new programs, partnership updates, application status changes, and referrals — keeping every stakeholder in the loop without notification overload.',
  },
]

/* ── How it works steps ────────────────────────────────────────────────── */

const STEPS = [
  {
    n: '01',
    title: 'Create your profile',
    body: 'Sign up as an individual, organization, advocate, or volunteer. Individuals complete a short intake form so we understand their situation.',
  },
  {
    n: '02',
    title: 'Get matched or listed',
    body: 'Individuals see personalized program recommendations. Organizations publish their programs and immediately reach the people who need them.',
  },
  {
    n: '03',
    title: 'Apply, connect, and track',
    body: 'Apply to programs in seconds. Org staff review applications, build cohorts, assign milestones, and message participants — all in one place.',
  },
]

/* ── Stat strip ────────────────────────────────────────────────────────── */

const STATS = [
  { value: '500+', label: 'Organizations' },
  { value: '12,000+', label: 'Community members served' },
  { value: '95', label: 'Cities and counties' },
  { value: '6', label: 'Persona types supported' },
]

/* ── Page ──────────────────────────────────────────────────────────────── */

export function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#1B1D2E]">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-blue-400/10 blur-2xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-36">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Now serving 500+ community organizations
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                Community care,{' '}
                <span className="bg-gradient-to-r from-primary to-blue-300 bg-clip-text text-transparent">
                  coordinated.
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-white/60">
                Ancchor connects individuals seeking services with the programs, organizations,
                advocates, and navigators who can help — on one platform built for the full
                ecosystem of community care.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                {user ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30">
                      Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg" className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30">
                        Get started free <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/programs">
                      <Button size="lg" variant="ghost"
                        className="border border-white/20 text-white/80 hover:bg-white/10 hover:text-white">
                        Browse programs
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/40">
                {['Free to join', 'No credit card required', 'All persona types supported'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden justify-center md:flex">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-blue-400/10 blur-2xl" />
                <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <img src={heroImage} alt="Ancchor platform" className="h-64 w-auto object-contain opacity-90" />
                  {/* Floating stat card */}
                  <div className="absolute -bottom-4 -left-6 rounded-xl border border-white/10 bg-[#1B1D2E]/90 p-3 shadow-xl backdrop-blur-sm">
                    <p className="text-xs text-white/50">Programs matched this week</p>
                    <p className="mt-0.5 text-2xl font-bold text-white">1,248</p>
                    <p className="text-xs text-emerald-400">↑ 12% from last week</p>
                  </div>
                  <div className="absolute -right-6 -top-4 rounded-xl border border-white/10 bg-[#1B1D2E]/90 p-3 shadow-xl backdrop-blur-sm">
                    <p className="text-xs text-white/50">New partnerships</p>
                    <p className="mt-0.5 text-2xl font-bold text-white">34</p>
                    <p className="text-xs text-white/40">this month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-[#1B1D2E]">{value}</p>
                <p className="mt-1 text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Personas ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#1B1D2E] md:text-4xl">
            Built for every role in your community
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-500">
            Whether you're seeking help, providing programs, coordinating referrals, or funding
            impact — Ancchor has a tailored experience built for your role.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map(({ icon: Icon, label, color, description, cta, to }) => (
            <Link key={label} to={to}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-[#1B1D2E]">{label}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                {cta} <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[#1B1D2E] md:text-4xl">
              Simple from day one
            </h2>
            <p className="mt-4 text-gray-500">
              Get set up in minutes. No implementation project required.
            </p>
          </div>
          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent md:block" />
            {STEPS.map(({ n, title, body }) => (
              <div key={n} className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                  {n}
                </div>
                <h3 className="mb-2 font-semibold text-[#1B1D2E]">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#1B1D2E] md:text-4xl">
            Everything your network needs
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            From intake to outcome reporting — the full coordination stack, purpose-built for
            community services.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-[#1B1D2E]">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Org logos strip (placeholder) ────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-gray-400">
            Trusted by organizations doing real work
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50 grayscale">
            {['City Food Bank', 'Metro Youth Center', 'Community Navigation Hub',
              'Healthy Futures Foundation', 'BizCorp Services'].map((name) => (
              <span key={name}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#1B1D2E]">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <img src={ancchorMark} alt="" className="mx-auto mb-6 h-12 w-12 opacity-80" />
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to connect your community?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
            Join the organizations, advocates, and individuals already using Ancchor to
            coordinate care and amplify impact.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30">
                  Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30">
                    Create your free account <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/organizations">
                  <Button size="lg" variant="ghost"
                    className="border border-white/20 text-white/80 hover:bg-white/10 hover:text-white">
                    Explore organizations
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#1B1D2E] border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <img src={ancchorLogoFull} alt="Ancchor" className="h-7 w-auto opacity-70" />
            <div className="flex gap-6 text-sm text-white/30">
              <Link to="/programs" className="hover:text-white/60 transition-colors">Programs</Link>
              <Link to="/organizations" className="hover:text-white/60 transition-colors">Organizations</Link>
              <Link to="/opportunities" className="hover:text-white/60 transition-colors">Opportunities</Link>
              <Link to="/professionals" className="hover:text-white/60 transition-colors">People</Link>
            </div>
            <p className="text-xs text-white/20">© {new Date().getFullYear()} Ancchor. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
