import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Boxes,
  Check,
  ChevronDown,
  CircleHelp,
  FileImage,
  FilePlus2,
  Gauge,
  Inbox,
  ImagePlus,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import {
  isSupabaseConfigured,
  supabase,
  type ContentItem,
  type ContentStatus,
  type ContentType,
} from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";

type Section =
  | "overview"
  | "submissions"
  | "tools"
  | "categories"
  | "articles"
  | "affiliates"
  | "media";
type SubmissionStatus = "pending" | "approved" | "rejected";
type ToolSubmission = {
  id: string;
  name: string;
  url: string;
  category: string;
  pricing_model: "Free" | "Freemium" | "Paid" | "Open Source";
  tagline: string;
  submitter_email: string | null;
  status: SubmissionStatus;
  tool_id: string | null;
  created_at: string;
  reviewed_at: string | null;
};
type Analytics = {
  activeUsers: number;
  pageViews: number;
  sessions: number;
  realtimeUsers: number;
  trend: { date: string; visitors: number; pageViews: number }[];
  sources: { label: string; value: number }[];
  countries: { label: string; value: number }[];
  pages: { label: string; value: number }[];
  campaigns: { label: string; value: number }[];
};

const sections: { id: Section; label: string; icon: typeof LayoutDashboard }[] =
  [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "submissions", label: "Submissions", icon: Inbox },
    { id: "tools", label: "AI tools", icon: Sparkles },
    { id: "categories", label: "Categories", icon: Boxes },
    { id: "articles", label: "Articles", icon: BookOpen },
    { id: "affiliates", label: "Affiliate links", icon: Link2 },
    { id: "media", label: "Media library", icon: FileImage },
  ];

const sectionTypes: Partial<Record<Section, ContentType>> = {
  tools: "tool",
  categories: "category",
  articles: "article",
  affiliates: "affiliate",
};

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);
const toTitle = (section: Section) =>
  sections.find((item) => item.id === section)?.label ?? section;
const formatAnalyticsDate = (value: string) => {
  if (!/^\d{8}$/.test(value)) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(
    new Date(
      Number(value.slice(0, 4)),
      Number(value.slice(4, 6)) - 1,
      Number(value.slice(6, 8)),
    ),
  );
};

function starterContent(
  type: ContentType,
  slug: string,
): Record<string, unknown> {
  if (type === "tool") {
    return {
      id: slug,
      name: "New AI tool",
      slug,
      tagline: "",
      description: "",
      category: "Productivity",
      pricingModel: "Freemium",
      startingPrice: "Free",
      officialUrl: "https://",
      featured: false,
      curatedRank: 99,
      addedYear: new Date().getFullYear(),
      keyFeatures: [],
      pros: [],
      cons: [],
      bestFor: "",
      platforms: [],
      pricingTiers: [],
      specs: {
        apiAvailable: false,
        selfHostable: false,
        privacyNoTraining: false,
        primaryInterface: "",
        primaryLanguageSupport: "",
      },
      iconBg: "bg-violet-100 text-violet-700",
    };
  }
  if (type === "category") {
    return { id: slug, name: "", tagline: "", description: "", count: 0 };
  }
  if (type === "article") {
    return {
      id: slug,
      slug,
      title: "",
      subtitle: "",
      category: "Productivity",
      readTime: "5 min read",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      author: { name: "", role: "" },
      excerpt: "",
      keyTakeaways: [],
      contentSections: [],
    };
  }
  if (type === "affiliate")
    return { toolSlug: "", url: "https://", label: "", network: "" };
  return { fileName: "", url: "", storagePath: "" };
}

function validateContent(type: ContentType, data: Record<string, unknown>) {
  const required: Record<ContentType, string[]> = {
    tool: [
      "id",
      "name",
      "slug",
      "tagline",
      "description",
      "category",
      "pricingModel",
      "startingPrice",
      "officialUrl",
      "featured",
      "curatedRank",
      "addedYear",
      "keyFeatures",
      "pros",
      "cons",
      "bestFor",
      "platforms",
      "pricingTiers",
      "specs",
      "iconBg",
    ],
    category: ["id", "name", "tagline", "description"],
    article: [
      "id",
      "slug",
      "title",
      "subtitle",
      "category",
      "readTime",
      "date",
      "author",
      "excerpt",
      "keyTakeaways",
      "contentSections",
    ],
    affiliate: ["toolSlug", "url"],
    media: ["fileName", "url", "storagePath"],
  };
  const missing = required[type].filter(
    (key) => data[key] === undefined || data[key] === null || data[key] === "",
  );
  if (missing.length)
    throw new Error(
      `Required ${type} fields are missing: ${missing.join(", ")}.`,
    );
  if (
    type === "tool" &&
    (!data.specs || typeof data.specs !== "object" || Array.isArray(data.specs))
  ) {
    throw new Error("A tool needs a specs object.");
  }
  if (
    type === "article" &&
    (!data.author ||
      typeof data.author !== "object" ||
      Array.isArray(data.author))
  ) {
    throw new Error("An article needs an author object.");
  }
  if (type === "article") {
    const author = data.author as Record<string, unknown>;
    if (typeof author.name !== "string" || typeof author.role !== "string") {
      throw new Error("Article authors need a name and role.");
    }
  }
  if (
    type === "tool" &&
    ["keyFeatures", "pros", "cons", "platforms", "pricingTiers"].some(
      (key) => !Array.isArray(data[key]),
    )
  ) {
    throw new Error(
      "Tool features, pros, cons, platforms, and pricing tiers must be JSON arrays.",
    );
  }
  if (
    type === "tool" &&
    ["keyFeatures", "pros", "cons", "platforms"].some(
      (key) =>
        !(data[key] as unknown[]).every((value) => typeof value === "string"),
    )
  ) {
    throw new Error(
      "Tool features, pros, cons, and platforms must contain only text values.",
    );
  }
  if (
    type === "tool" &&
    !["Free", "Freemium", "Paid", "Open Source"].includes(
      String(data.pricingModel),
    )
  ) {
    throw new Error("Choose a supported tool pricing model.");
  }
  if (type === "tool" && typeof data.featured !== "boolean")
    throw new Error("Tool featured must be a boolean.");
  if (
    type === "tool" &&
    (!Array.isArray(data.pricingTiers) ||
      !(data.pricingTiers as unknown[]).every((value) => {
        if (!value || typeof value !== "object") return false;
        const tier = value as Record<string, unknown>;
        return (
          typeof tier.name === "string" &&
          typeof tier.price === "string" &&
          Array.isArray(tier.features) &&
          tier.features.every((feature) => typeof feature === "string") &&
          (tier.isPopular === undefined || typeof tier.isPopular === "boolean")
        );
      }))
  )
    throw new Error(
      "Each pricing tier needs a name, price, and list of text features.",
    );
  if (type === "tool") {
    const specs = data.specs as Record<string, unknown>;
    if (
      ["apiAvailable", "selfHostable", "privacyNoTraining"].some(
        (key) => typeof specs[key] !== "boolean",
      ) ||
      ["primaryInterface", "primaryLanguageSupport"].some(
        (key) => typeof specs[key] !== "string",
      )
    ) {
      throw new Error(
        "Tool specs need interface/language text and boolean capability values.",
      );
    }
  }
  if (
    type === "article" &&
    (!Array.isArray(data.keyTakeaways) || !Array.isArray(data.contentSections))
  ) {
    throw new Error(
      "Article takeaways and content sections must be JSON arrays.",
    );
  }
  if (
    type === "article" &&
    !(data.keyTakeaways as unknown[]).every(
      (value) => typeof value === "string",
    )
  ) {
    throw new Error("Article takeaways must contain only text values.");
  }
  if (
    type === "article" &&
    !(data.contentSections as unknown[]).every((value) => {
      if (!value || typeof value !== "object") return false;
      const section = value as Record<string, unknown>;
      return (
        typeof section.heading === "string" &&
        Array.isArray(section.body) &&
        section.body.every((paragraph) => typeof paragraph === "string")
      );
    })
  )
    throw new Error(
      "Each article section needs a heading and a list of text paragraphs.",
    );
  const urlValue =
    type === "tool"
      ? data.officialUrl
      : type === "affiliate"
        ? data.url
        : undefined;
  if (urlValue !== undefined) {
    try {
      if (new URL(String(urlValue)).protocol !== "https:") throw new Error();
    } catch {
      throw new Error("Website and affiliate URLs must be valid HTTPS links.");
    }
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  note,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-800 dark:bg-[#111115]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <span className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
        {note}
      </p>
    </div>
  );
}

function ReportList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: Analytics["sources"];
  emptyLabel: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-800 dark:bg-[#111115]">
      <h3 className="font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-5 text-sm text-neutral-500 dark:text-neutral-400">
          {emptyLabel}
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1.5 flex justify-between gap-3 text-xs">
                <span className="truncate text-neutral-600 dark:text-neutral-300">
                  {item.label}
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatNumber(item.value)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TrendChart({ data }: { data: Analytics["trend"] }) {
  const width = 800;
  const height = 220;
  const maxValue = Math.max(
    ...data.map((entry) => Math.max(entry.visitors, entry.pageViews)),
    1,
  );
  const visitorsPoints = data.map((point, index) => ({
    x: data.length === 1 ? width / 2 : (index / (data.length - 1)) * width,
    y: height - 15 - (Math.max(point.visitors, 0) / maxValue) * (height - 30),
  }));
  const pageViewsPoints = data.map((point, index) => ({
    x: data.length === 1 ? width / 2 : (index / (data.length - 1)) * width,
    y: height - 15 - (Math.max(point.pageViews, 0) / maxValue) * (height - 30),
  }));
  const pathFor = (points: typeof visitorsPoints) =>
    points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
  const visitorsPath = pathFor(visitorsPoints);
  const pageViewsPath = pathFor(pageViewsPoints);
  return (
    <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-800 dark:bg-[#111115]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Visitors & page views</h3>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Daily totals · Google Analytics 4
          </p>
        </div>
        <div className="flex gap-3 text-[10px] text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            Visitors
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Page views
          </span>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
          No activity recorded for this period.
        </div>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="mt-5 h-56 w-full overflow-visible"
            role="img"
            aria-label="Daily active visitors chart"
          >
            {[0, 1, 2, 3].map((tick) => (
              <line
                key={tick}
                x1="0"
                x2={width}
                y1={20 + tick * 58}
                y2={20 + tick * 58}
                className="stroke-neutral-100 dark:stroke-neutral-800"
              />
            ))}
            <path
              d={`${visitorsPath} L ${visitorsPoints.at(-1)!.x} ${height} L ${visitorsPoints[0].x} ${height} Z`}
              fill="url(#visitor-area)"
            />
            <path
              d={visitorsPath}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={pageViewsPath}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="visitor-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".22" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex justify-between text-[10px] text-neutral-400">
            <span>{formatAnalyticsDate(data[0].date)}</span>
            <span>
              {formatAnalyticsDate(
                data[Math.floor(data.length / 2)]?.date ?? "",
              )}
            </span>
            <span>{formatAnalyticsDate(data.at(-1)?.date ?? "")}</span>
          </div>
        </>
      )}
    </section>
  );
}

function LoginScreen({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onLogin(email, password);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-[#0A0A0C]">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-[#111115]"
      >
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white">
            <ShieldCheck size={20} />
          </span>
          <div>
            <p className="font-semibold">Nexcoma</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Administrator panel
            </p>
          </div>
        </div>
        <label className="mb-4 block text-sm font-medium">
          Email
          <input
            required
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="mb-5 block text-sm font-medium">
          Password
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </p>
        )}
        <button
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
        >
          {busy && <LoaderCircle size={16} className="animate-spin" />}Sign in
        </button>
      </form>
    </div>
  );
}

function Editor({
  item,
  type,
  onClose,
  onSave,
}: {
  item: ContentItem | null;
  type: ContentType;
  onClose: () => void;
  onSave: (
    value: Omit<ContentItem, "id" | "created_at" | "updated_at"> & {
      id?: string;
    },
  ) => Promise<void>;
}) {
  const initialData = item?.data ?? starterContent(type, "");
  const [title, setTitle] = useState(item?.title ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [status, setStatus] = useState<ContentStatus>(item?.status ?? "draft");
  const [seoTitle, setSeoTitle] = useState(item?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    item?.seo_description ?? "",
  );
  const [json, setJson] = useState(JSON.stringify(initialData, null, 2));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    let data: Record<string, unknown>;
    try {
      const parsed = JSON.parse(json) as Record<string, unknown>;
      if (Array.isArray(parsed) || !parsed || typeof parsed !== "object")
        throw new Error("Content must be a JSON object.");
      data = parsed;
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Invalid content.");
      return;
    }
    if (!title.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError(
        "Enter a title and a lowercase URL slug using only letters, numbers, and hyphens.",
      );
      return;
    }
    data = {
      ...data,
      ...(type === "tool" || type === "article" ? { slug } : {}),
      ...(type === "tool" ? { name: title.trim() } : {}),
      ...(type === "category" ? { name: title.trim() } : {}),
      ...(type === "article" ? { title: title.trim() } : {}),
      ...(type === "category" && !item ? { id: slug } : {}),
      ...(type === "tool" && !item ? { id: slug } : {}),
      ...(type === "article" && !item ? { id: slug } : {}),
    };
    try {
      validateContent(type, data);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Invalid content.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...(item ? { id: item.id } : {}),
        content_type: type,
        slug,
        title: title.trim(),
        status,
        data,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
      });
      onClose();
    } catch (issue) {
      setError(
        issue instanceof Error ? issue.message : "Could not save content.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={submit}
        className="flex max-h-[94vh] w-full max-w-3xl flex-col rounded-t-3xl bg-white shadow-2xl dark:bg-[#131317] sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <div>
            <h2 className="font-semibold">
              {item ? `Edit ${type}` : `New ${type}`}
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              Changes are stored in Supabase and published to the website.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 overflow-auto p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              Display title
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-purple-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </label>
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              URL slug
              <input
                required
                value={slug}
                onChange={(event) =>
                  setSlug(
                    event.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-"),
                  )
                }
                className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-sm text-neutral-900 outline-none focus:border-purple-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              Search engine title
              <input
                value={seoTitle}
                onChange={(event) => setSeoTitle(event.target.value)}
                maxLength={70}
                className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-purple-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </label>
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              Search description
              <textarea
                value={seoDescription}
                onChange={(event) => setSeoDescription(event.target.value)}
                maxLength={170}
                rows={2}
                className="mt-1.5 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-purple-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </label>
          </div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300">
            Structured content <span className="font-normal">(JSON)</span>
            <textarea
              spellCheck={false}
              value={json}
              onChange={(event) => setJson(event.target.value)}
              rows={15}
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-neutral-100 outline-none focus:border-purple-500"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={status === "published"}
              onChange={(event) =>
                setStatus(event.target.checked ? "published" : "draft")
              }
              className="accent-purple-600"
            />
            Publish immediately
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
          >
            {saving && <LoaderCircle size={15} className="animate-spin" />}Save
            changes
          </button>
        </div>
      </form>
    </div>
  );
}

export function AdminDashboard() {
  const { isDark, toggleTheme } = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [section, setSection] = useState<Section>("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [submissions, setSubmissions] = useState<ToolSubmission[]>([]);
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<
    "all" | SubmissionStatus
  >("pending");
  const [submissionBusyId, setSubmissionBusyId] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [contentError, setContentError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ContentStatus>(
    "all",
  );
  const [editor, setEditor] = useState<{
    item: ContentItem | null;
    type: ContentType;
  } | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [analyticsBusy, setAnalyticsBusy] = useState(false);
  const [days, setDays] = useState(30);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [copiedId, setCopiedId] = useState("");

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      const current =
        data.session?.user.app_metadata?.role === "admin" ? data.session : null;
      setSession(current);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, next) => {
        setSession(next?.user.app_metadata?.role === "admin" ? next : null);
        setAuthReady(true);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.user.app_metadata?.role !== "admin") {
      await supabase.auth.signOut();
      throw new Error("This account does not have administrator access.");
    }
  };

  const loadItems = useCallback(async () => {
    if (!supabase || !session) return;
    setContentError("");
    const { data, error } = await supabase
      .from("content_items")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      setContentError(`Could not load the CMS: ${error.message}`);
      return;
    }
    setItems((data ?? []) as ContentItem[]);
  }, [session]);

  const loadSubmissions = useCallback(async () => {
    if (!supabase || !session) return;
    const { data, error } = await supabase
      .from("tool_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setSubmissionError(`Could not load tool submissions: ${error.message}`);
      return;
    }
    setSubmissionError("");
    setSubmissions((data ?? []) as ToolSubmission[]);
  }, [session]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);
  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  useEffect(() => {
    if (!session || !supabase) return;
    const channel = supabase
      .channel("admin-tool-submissions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tool_submissions" },
        () => {
          void loadSubmissions();
        },
      )
      .subscribe();
    return () => {
      void supabase?.removeChannel(channel);
    };
  }, [loadSubmissions, session]);

  const loadAnalytics = useCallback(async () => {
    if (!session) return;
    setAnalyticsBusy(true);
    setAnalyticsError("");
    try {
      const response = await fetch(`/api/analytics?days=${days}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const payload = (await response.json()) as Analytics | { error: string };
      if (!response.ok)
        throw new Error(
          "error" in payload
            ? payload.error
            : `Analytics request failed (${response.status}).`,
        );
      setAnalytics(payload as Analytics);
    } catch (issue) {
      setAnalytics(null);
      setAnalyticsError(
        issue instanceof Error
          ? issue.message
          : "Unable to load real analytics.",
      );
    } finally {
      setAnalyticsBusy(false);
    }
  }, [days, session]);

  useEffect(() => {
    if (!session) return;
    void loadAnalytics();
    const timer = window.setInterval(() => {
      void loadAnalytics();
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [loadAnalytics, session]);

  const visibleItems = useMemo(() => {
    const type = sectionTypes[section];
    return items.filter(
      (item) =>
        (!type || item.content_type === type) &&
        (section !== "media" || item.content_type === "media") &&
        (statusFilter === "all" || item.status === statusFilter) &&
        `${item.title} ${item.slug} ${item.content_type}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
  }, [items, section, statusFilter, query]);

  const saveContent = async (
    value: Omit<ContentItem, "id" | "created_at" | "updated_at"> & {
      id?: string;
    },
  ) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { id, ...record } = value;
    const currentItem = id ? items.find((item) => item.id === id) : undefined;
    if (record.content_type === "tool" && currentItem) {
      const affiliateLinks = items.filter(
        (item) =>
          item.content_type === "affiliate" &&
          item.data.toolSlug === currentItem.slug,
      );
      if (currentItem.slug !== record.slug && affiliateLinks.length) {
        throw new Error(
          "Delete or update this tool’s affiliate links before changing its URL slug.",
        );
      }
      if (
        record.status === "draft" &&
        affiliateLinks.some((item) => item.status === "published")
      ) {
        throw new Error(
          "Unpublish this tool’s affiliate links before saving the tool as a draft.",
        );
      }
    }
    if (
      record.content_type === "category" &&
      currentItem &&
      currentItem.data.id !== record.data.id
    ) {
      const isInUse = items.some(
        (item) =>
          item.content_type === "tool" &&
          item.data.category === currentItem.data.id,
      );
      if (isInUse)
        throw new Error(
          "Reassign tools to another category before changing this category ID.",
        );
    }
    if (record.content_type === "affiliate" && record.status === "published") {
      const toolSlug = record.data.toolSlug;
      const linkedToolExists = items.some(
        (item) =>
          item.content_type === "tool" &&
          item.status === "published" &&
          item.slug === toolSlug,
      );
      if (!linkedToolExists)
        throw new Error(
          "Publish this affiliate link only after its matching AI tool is published. Use the tool URL slug as toolSlug.",
        );
    }
    const result = id
      ? await supabase
          .from("content_items")
          .update(record)
          .eq("id", id)
          .select()
          .single()
      : await supabase.from("content_items").insert(record).select().single();
    if (result.error)
      throw new Error(`Could not save content: ${result.error.message}`);
    setItems((current) => [
      result.data as ContentItem,
      ...current.filter((item) => item.id !== result.data.id),
    ]);
  };

  const reviewSubmission = async (
    submission: ToolSubmission,
    decision: "approved" | "rejected",
  ) => {
    if (!supabase || submission.status !== "pending") return;
    setSubmissionBusyId(submission.id);
    setSubmissionError("");
    try {
      if (decision === "approved") {
        const { data: toolId, error } = await supabase.rpc(
          "approve_tool_submission",
          {
            p_submission_id: submission.id,
          },
        );
        if (error)
          throw new Error(`Could not approve submission: ${error.message}`);
        const { data: draft, error: draftError } = await supabase
          .from("content_items")
          .select("*")
          .eq("id", toolId)
          .single();
        if (draftError)
          throw new Error(
            `Submission was approved, but its tool draft could not be loaded: ${draftError.message}`,
          );
        setItems((current) => [
          draft as ContentItem,
          ...current.filter((item) => item.id !== draft.id),
        ]);
        setSection("tools");
        setStatusFilter("draft");
        setQuery(draft.title);
        setEditor({ item: draft as ContentItem, type: "tool" });
      } else {
        const { error } = await supabase
          .from("tool_submissions")
          .update({ status: "rejected", reviewed_at: new Date().toISOString() })
          .eq("id", submission.id)
          .eq("status", "pending");
        if (error)
          throw new Error(`Could not reject submission: ${error.message}`);
        setSubmissions((current) =>
          current.map((entry) =>
            entry.id === submission.id
              ? {
                  ...entry,
                  status: "rejected",
                  reviewed_at: new Date().toISOString(),
                }
              : entry,
          ),
        );
      }
      await loadSubmissions();
    } catch (issue) {
      setSubmissionError(
        issue instanceof Error
          ? issue.message
          : `Could not ${decision === "approved" ? "approve" : "reject"} submission.`,
      );
      await loadSubmissions();
    } finally {
      setSubmissionBusyId("");
    }
  };

  const deleteItem = async (item: ContentItem) => {
    if (!supabase) return;
    if (item.content_type === "category") {
      const assignedTools = items.filter(
        (entry) =>
          entry.content_type === "tool" && entry.data.category === item.data.id,
      );
      if (assignedTools.length) {
        setContentError(
          `Cannot delete this category while ${assignedTools.length} tool(s) still use it. Reassign or delete those tools first.`,
        );
        return;
      }
    }
    if (item.content_type === "tool") {
      const linkedAffiliates = items.filter(
        (entry) =>
          entry.content_type === "affiliate" &&
          entry.data.toolSlug === item.slug,
      );
      if (linkedAffiliates.length) {
        setContentError(
          `Cannot delete this tool while ${linkedAffiliates.length} affiliate link(s) still reference it. Delete those links first.`,
        );
        return;
      }
    }
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`))
      return;
    if (
      item.content_type === "media" &&
      typeof item.data.storagePath === "string"
    ) {
      const { error: storageError } = await supabase.storage
        .from("nexcoma-media")
        .remove([item.data.storagePath]);
      if (storageError) {
        setContentError(
          `Could not delete the stored file: ${storageError.message}`,
        );
        return;
      }
    }
    const { error } = await supabase
      .from("content_items")
      .delete()
      .eq("id", item.id);
    if (error) {
      setContentError(`Could not delete content: ${error.message}`);
      return;
    }
    setItems((current) => current.filter((entry) => entry.id !== item.id));
  };

  const uploadMedia = async (file?: File) => {
    if (!file || !supabase) return;
    setUploadMessage("");
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      ) ||
      file.size > 10 * 1024 * 1024
    ) {
      setUploadMessage(
        "Choose a JPEG, PNG, WebP, or GIF image smaller than 10 MB.",
      );
      return;
    }
    setUploadBusy(true);
    const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    try {
      const { error: storageError } = await supabase.storage
        .from("nexcoma-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (storageError)
        throw new Error(`Upload failed: ${storageError.message}`);
      const { data: publicUrl } = supabase.storage
        .from("nexcoma-media")
        .getPublicUrl(path);
      try {
        await saveContent({
          content_type: "media",
          slug: `media-${crypto.randomUUID()}`,
          title: file.name,
          status: "published",
          data: {
            fileName: file.name,
            url: publicUrl.publicUrl,
            storagePath: path,
            mimeType: file.type,
            size: file.size,
          },
          seo_title: null,
          seo_description: null,
        });
      } catch (saveError) {
        const { error: cleanupError } = await supabase.storage
          .from("nexcoma-media")
          .remove([path]);
        if (cleanupError)
          throw new Error(
            `${saveError instanceof Error ? saveError.message : "Could not save image metadata."} The uploaded object also could not be cleaned up: ${cleanupError.message}`,
          );
        throw saveError;
      }
      setUploadMessage(
        "Image uploaded. Copy its public URL into an article or tool record to publish it.",
      );
    } catch (issue) {
      setUploadMessage(
        issue instanceof Error ? issue.message : "Image upload failed.",
      );
    } finally {
      setUploadBusy(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setContentError(`Could not sign out: ${error.message}`);
  };

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-5 dark:bg-[#0A0A0C]">
        <div className="max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-[#111115]">
          <ShieldCheck className="mb-4 text-purple-600" size={28} />
          <h1 className="text-xl font-semibold">Admin setup required</h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            Configure <code>VITE_SUPABASE_URL</code> and{" "}
            <code>VITE_SUPABASE_ANON_KEY</code>, apply the Supabase migration,
            and restart the app. The dashboard will not show simulated analytics
            or unsaved sample content.
          </p>
        </div>
      </div>
    );
  }
  if (!authReady)
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-[#0A0A0C]">
        <LoaderCircle className="animate-spin text-purple-600" />
      </div>
    );
  if (!session) return <LoginScreen onLogin={login} />;

  const sectionType = sectionTypes[section];
  const mediaItems = items.filter((item) => item.content_type === "media");
  const visibleMediaItems = mediaItems.filter(
    (item) =>
      (statusFilter === "all" || item.status === statusFilter) &&
      `${item.title} ${item.slug}`.toLowerCase().includes(query.toLowerCase()),
  );
  const publishedCount = items.filter(
    (item) => item.status === "published" && item.content_type !== "media",
  ).length;
  const draftCount = items.filter((item) => item.status === "draft").length;
  const pendingSubmissionCount = submissions.filter(
    (submission) => submission.status === "pending",
  ).length;
  const visibleSubmissions = submissions.filter(
    (submission) =>
      (submissionStatusFilter === "all" ||
        submission.status === submissionStatusFilter) &&
      `${submission.name} ${submission.url} ${submission.category} ${submission.tagline} ${submission.submitter_email ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-[#0A0A0C] dark:text-neutral-100">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-200 bg-white px-4 py-5 transition-transform dark:border-neutral-800 dark:bg-[#101014] md:translate-x-0 ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}
      >
        <a href="/" className="mb-8 flex items-center gap-3 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white">
            <Sparkles size={18} />
          </span>
          <div>
            <span className="font-semibold tracking-tight">Nexcoma</span>
            <span className="ml-2 rounded-md bg-purple-50 px-1.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
              Admin
            </span>
          </div>
        </a>
        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.14em] text-neutral-400">
          Workspace
        </div>
        <nav className="space-y-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setSection(id);
                setMobileMenu(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${section === id ? "bg-purple-50 font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-300" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/70"}`}
            >
              <Icon size={17} />
              {label}
              {id === "submissions" && pendingSubmissionCount > 0 && (
                <span className="ml-auto rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {pendingSubmissionCount}
                </span>
              )}
              {id === "media" && (
                <span className="ml-auto text-xs text-neutral-400">
                  {mediaItems.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-[#151519]">
          <div className="flex items-center gap-2 text-xs font-medium">
            <ShieldCheck
              size={15}
              className="text-emerald-600 dark:text-emerald-400"
            />
            Secure session
          </div>
          <p className="mt-2 truncate text-[11px] text-neutral-500 dark:text-neutral-400">
            {session.user.email}
          </p>
          <button
            onClick={signOut}
            className="mt-3 flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <button
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200/80 bg-white/85 px-4 backdrop-blur-xl dark:border-neutral-800 dark:bg-[#0A0A0C]/85 sm:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(true)}
              aria-label="Open navigation"
              className="rounded-lg p-2 text-neutral-500 md:hidden"
            >
              <Menu size={19} />
            </button>
            <div>
              <p className="text-sm font-semibold">{toTitle(section)}</p>
              <p className="hidden text-[11px] text-neutral-400 sm:block">
                Nexcoma content & insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 sm:flex"
            >
              View website <ArrowUpRight size={14} />
            </a>
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
              className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Settings2 size={17} />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
              {session.user.email?.[0]?.toUpperCase()}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-7">
          {section === "overview" ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Good to see you.
                  </h1>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Live website performance and publishing activity.
                  </p>
                </div>
                <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs dark:border-neutral-800 dark:bg-[#111115]">
                  <span className="text-neutral-500">Period</span>
                  <select
                    value={days}
                    onChange={(event) => setDays(Number(event.target.value))}
                    className="bg-transparent font-medium outline-none"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                  <ChevronDown size={13} className="text-neutral-400" />
                </label>
              </div>
              {analyticsError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-200"
                >
                  <CircleHelp size={17} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Analytics unavailable</p>
                    <p className="mt-1 text-xs leading-relaxed">
                      {analyticsError}
                    </p>
                    <button
                      onClick={() => void loadAnalytics()}
                      className="mt-2 text-xs font-semibold underline"
                    >
                      Retry connection
                    </button>
                  </div>
                </div>
              )}
              {analyticsBusy && !analytics && (
                <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-[#111115]">
                  <LoaderCircle size={16} className="animate-spin" />
                  Connecting to Google Analytics 4…
                </div>
              )}
              {analytics && (
                <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live connection · {analytics.realtimeUsers} active now{" "}
                  <button
                    onClick={() => void loadAnalytics()}
                    aria-label="Refresh analytics"
                    className="ml-1 rounded-md p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <Activity size={13} />
                  </button>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Visitors"
                  value={analytics ? formatNumber(analytics.activeUsers) : "—"}
                  icon={Users}
                  note="Active users in selected period"
                />
                <StatCard
                  label="Page views"
                  value={analytics ? formatNumber(analytics.pageViews) : "—"}
                  icon={BarChart3}
                  note="Views across your website"
                />
                <StatCard
                  label="Sessions"
                  value={analytics ? formatNumber(analytics.sessions) : "—"}
                  icon={Gauge}
                  note="Sessions in selected period"
                />
                <StatCard
                  label="Published content"
                  value={formatNumber(publishedCount)}
                  icon={Check}
                  note={`${draftCount} saved drafts · Supabase`}
                />
              </div>
              {analytics && (
                <>
                  <TrendChart data={analytics.trend} />
                  <div className="grid gap-4 lg:grid-cols-2">
                    <ReportList
                      title="Traffic sources"
                      items={analytics.sources}
                      emptyLabel="No source data recorded."
                    />
                    <ReportList
                      title="Top countries"
                      items={analytics.countries}
                      emptyLabel="No country data recorded."
                    />
                    <ReportList
                      title="Popular pages"
                      items={analytics.pages}
                      emptyLabel="No page data recorded."
                    />
                    <ReportList
                      title="UTM campaigns"
                      items={analytics.campaigns}
                      emptyLabel="No campaign data recorded."
                    />
                  </div>
                </>
              )}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-800 dark:bg-[#111115]">
                <div className="flex items-center gap-2">
                  <ArrowDownToLine size={17} className="text-purple-600" />
                  <h3 className="font-semibold">Publishing status</h3>
                </div>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Changes published here are read by the public website directly
                  from Supabase.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(
                    [
                      "tool",
                      "category",
                      "article",
                      "affiliate",
                    ] as ContentType[]
                  ).map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setSection(
                          type === "tool"
                            ? "tools"
                            : type === "category"
                              ? "categories"
                              : type === "article"
                                ? "articles"
                                : "affiliates",
                        )
                      }
                      className="rounded-xl bg-neutral-100 px-3 py-2 text-xs text-neutral-600 hover:bg-purple-50 hover:text-purple-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
                    >
                      {
                        items.filter((item) => item.content_type === type)
                          .length
                      }{" "}
                      {type}
                      {items.filter((item) => item.content_type === type)
                        .length === 1
                        ? ""
                        : "s"}{" "}
                      <span className="ml-1">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : section === "submissions" ? (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Tool submissions
                </h1>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Review community suggestions. Approval creates a CMS draft for
                  editorial completion; it does not publish an unverified
                  listing.
                </p>
              </div>
              {submissionError && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
                >
                  {submissionError}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <label className="relative min-w-48 flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search suggestions..."
                    className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-purple-400 dark:border-neutral-800 dark:bg-[#111115]"
                  />
                </label>
                <select
                  value={submissionStatusFilter}
                  onChange={(event) =>
                    setSubmissionStatusFilter(
                      event.target.value as "all" | SubmissionStatus,
                    )
                  }
                  className="rounded-xl border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-[#111115]"
                >
                  <option value="pending">Pending review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="all">All submissions</option>
                </select>
              </div>
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#111115]">
                {visibleSubmissions.map((submission) => (
                  <article
                    key={submission.id}
                    className="border-b border-neutral-100 p-4 last:border-0 dark:border-neutral-800/70 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold">{submission.name}</h2>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-medium ${submission.status === "pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" : submission.status === "approved" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"}`}
                          >
                            {submission.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                          {submission.tagline}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                          <a
                            href={submission.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-purple-700 hover:underline dark:text-purple-300"
                          >
                            {submission.url}
                            <ExternalLink size={12} />
                          </a>
                          <span>{submission.category}</span>
                          <span>{submission.pricing_model}</span>
                          {submission.submitter_email && (
                            <a
                              href={`mailto:${encodeURIComponent(submission.submitter_email)}`}
                              className="hover:underline"
                            >
                              {submission.submitter_email}
                            </a>
                          )}
                          <span>
                            {new Date(submission.created_at).toLocaleString()}
                          </span>
                        </div>
                        {submission.status === "approved" &&
                          submission.tool_id && (
                            <button
                              onClick={() => {
                                const draft = items.find(
                                  (item) => item.id === submission.tool_id,
                                );
                                if (draft) {
                                  setSection("tools");
                                  setStatusFilter("all");
                                  setEditor({ item: draft, type: "tool" });
                                } else {
                                  setContentError(
                                    "The approved tool draft was not found in the content list. Refresh the page and try again.",
                                  );
                                }
                              }}
                              className="mt-3 text-xs font-medium text-purple-700 hover:underline dark:text-purple-300"
                            >
                              Open created tool draft →
                            </button>
                          )}
                        {submission.status !== "pending" &&
                          submission.reviewed_at && (
                            <p className="mt-2 text-[10px] text-neutral-400">
                              Reviewed{" "}
                              {new Date(
                                submission.reviewed_at,
                              ).toLocaleString()}
                            </p>
                          )}
                      </div>
                      {submission.status === "pending" && (
                        <div className="flex shrink-0 gap-2">
                          <button
                            disabled={submissionBusyId === submission.id}
                            onClick={() =>
                              void reviewSubmission(submission, "rejected")
                            }
                            className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                          >
                            Reject
                          </button>
                          <button
                            disabled={submissionBusyId === submission.id}
                            onClick={() =>
                              void reviewSubmission(submission, "approved")
                            }
                            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
                          >
                            {submissionBusyId === submission.id && (
                              <LoaderCircle
                                size={13}
                                className="animate-spin"
                              />
                            )}
                            Approve & create draft
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
                {visibleSubmissions.length === 0 && (
                  <div className="p-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    <Inbox size={23} className="mx-auto mb-3 opacity-50" />
                    No submissions match this filter.
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                {visibleSubmissions.length}{" "}
                {visibleSubmissions.length === 1 ? "submission" : "submissions"}{" "}
                shown · New submissions appear in real time.
              </p>
            </div>
          ) : section === "media" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Media library
                  </h1>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Images stored in your Supabase bucket and ready to use in
                    published content.
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500">
                  {uploadBusy ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <ImagePlus size={16} />
                  )}
                  Upload image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploadBusy}
                    onChange={(event) => {
                      void uploadMedia(event.target.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
              {uploadMessage && (
                <p
                  role="status"
                  className="rounded-xl border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-[#111115]"
                >
                  {uploadMessage}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <label className="relative min-w-48 flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search media..."
                    className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-purple-400 dark:border-neutral-800 dark:bg-[#111115]"
                  />
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as "all" | ContentStatus)
                  }
                  className="rounded-xl border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-[#111115]"
                >
                  <option value="all">All statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleMediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#111115]"
                  >
                    <img
                      src={String(item.data.url)}
                      alt={String(item.data.fileName)}
                      className="h-40 w-full bg-neutral-100 object-cover dark:bg-neutral-900"
                    />
                    <div className="p-3">
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => {
                            void navigator.clipboard
                              .writeText(String(item.data.url))
                              .then(() => {
                                setCopiedId(item.id);
                                window.setTimeout(() => setCopiedId(""), 1800);
                              })
                              .catch(() =>
                                setUploadMessage(
                                  "Could not copy URL. Check browser clipboard permissions.",
                                ),
                              );
                          }}
                          className="flex-1 rounded-lg bg-neutral-100 px-2 py-2 text-xs hover:bg-purple-50 hover:text-purple-700 dark:bg-neutral-800 dark:hover:bg-purple-500/10"
                        >
                          {copiedId === item.id ? "Copied" : "Copy URL"}
                        </button>
                        <button
                          onClick={() => setEditor({ item, type: "media" })}
                          aria-label={`Edit ${item.title}`}
                          className="rounded-lg px-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => void deleteItem(item)}
                          aria-label={`Delete ${item.title}`}
                          className="rounded-lg px-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {visibleMediaItems.length === 0 && (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                  <ImagePlus size={25} className="mx-auto mb-3 opacity-50" />
                  No matching media.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {toTitle(section)}
                  </h1>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Create, edit, save drafts, and publish live website content.
                  </p>
                </div>
                {sectionType && (
                  <button
                    onClick={() => setEditor({ item: null, type: sectionType })}
                    className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500"
                  >
                    <Plus size={16} />
                    New {sectionType}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="relative min-w-48 flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search content..."
                    className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-purple-400 dark:border-neutral-800 dark:bg-[#111115]"
                  />
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as "all" | ContentStatus)
                  }
                  className="rounded-xl border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-[#111115]"
                >
                  <option value="all">All statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>
              {contentError && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
                >
                  {contentError}
                </p>
              )}
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#111115]">
                <div className="grid grid-cols-[1fr_100px_100px] gap-3 border-b border-neutral-200 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:border-neutral-800 sm:grid-cols-[1fr_120px_120px_100px]">
                  <span>Content</span>
                  <span className="hidden sm:block">Updated</span>
                  <span>Status</span>
                  <span className="text-right">Actions</span>
                </div>
                {visibleItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_100px_100px] items-center gap-3 border-b border-neutral-100 px-4 py-3.5 last:border-0 dark:border-neutral-800/70 sm:grid-cols-[1fr_120px_120px_100px]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-neutral-400">
                        {item.slug}
                      </p>
                    </div>
                    <span className="hidden text-xs text-neutral-500 sm:block">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                    <span
                      className={`w-fit rounded-full px-2 py-1 text-[10px] font-medium ${item.status === "published" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}
                    >
                      {item.status}
                    </span>
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() =>
                          setEditor({ item, type: item.content_type })
                        }
                        aria-label={`Edit ${item.title}`}
                        className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => void deleteItem(item)}
                        aria-label={`Delete ${item.title}`}
                        className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
                {visibleItems.length === 0 && (
                  <div className="p-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    <FilePlus2 size={22} className="mx-auto mb-2 opacity-50" />
                    No matching records.
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                {visibleItems.length}{" "}
                {visibleItems.length === 1 ? "record" : "records"} shown ·
                Search and status filters apply to this content type.
              </p>
            </div>
          )}
          <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
            <Activity size={12} />
            Real-time data from Supabase and Google Analytics 4
          </div>
        </main>
      </div>

      {editor && (
        <Editor
          key={editor.item?.id ?? `new-${editor.type}`}
          item={editor.item}
          type={editor.type}
          onClose={() => setEditor(null)}
          onSave={saveContent}
        />
      )}
    </div>
  );
}
