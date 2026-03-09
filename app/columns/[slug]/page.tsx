import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaLinkButton } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { getColumnArticle, getColumnDisplayContent, listColumnArticles } from "@/lib/columns";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type CalloutType = "fact" | "insight" | "next";
type RichBlock =
  | { type: "heading"; content: string }
  | { type: "subheading"; content: string }
  | { type: "quote"; content: string }
  | { type: "paragraph"; content: string };

const CALLOUT_LABELS: Record<CalloutType, string> = {
  fact: "\u4e8b\u5b9f",
  insight: "\u89e3\u91c8",
  next: "\u6b21\u306e\u4e00\u624b",
};

function getCalloutType(paragraph: string): CalloutType | null {
  if (paragraph.includes("\u4e8b\u5b9f") || paragraph.includes("\u838a\u53e5\uff7d\uff6e")) return "fact";
  if (paragraph.includes("\u89e3\u91c8") || paragraph.includes("\u96d7\uff63\u9a65")) return "insight";
  if (paragraph.includes("\u6b21\u306e\u4e00\u624b") || paragraph.includes("\u8c3a\uff61\u7e3a\uff6e\u8340")) return "next";
  return null;
}

function estimateReadMinutes(paragraphs: string[]): number {
  const charCount = paragraphs.join("").replace(/\s+/g, "").length;
  return Math.max(1, Math.ceil(charCount / 420));
}

function normalizeText(input: string): string {
  return input.replace(/\s+/g, "").trim();
}

function normalizeComparableText(input: string): string {
  return normalizeText(input).replace(/^>+/, "");
}

function shouldShowConsultationButton(slug: string, paragraph: string): boolean {
  if (slug !== "for-your-heartbreak") return false;

  const normalized = normalizeText(paragraph);
  return normalized.includes("心の準備ができたら、ルミナの占いで") && normalized.includes("あなたに訪れる次の縁");
}

function shouldShowAffirmationConsultationButton(slug: string, paragraph: string): boolean {
  if (
    slug !== "work-failure-night" &&
    slug !== "when-anxiety-wont-stop" &&
    slug !== "when-wishes-dont-come-true" &&
    slug !== "why-fortune-telling-feels-accurate" &&
    slug !== "for-you-who-wants-to-manifest"
  ) {
    return false;
  }

  const normalized = normalizeText(paragraph);
  return (
    (normalized.includes("心が少し落ち着いたら、ルミナの占いで") && normalized.includes("これからの流れ")) ||
    (normalized.includes("心が少し落ち着いたとき、ルミナの占いで") &&
      normalized.includes("今のあなたへのメッセージ")) ||
    (normalized.includes("今のあなたの願いと、これからの流れをルミナの占いで読み解いてみませんか") &&
      normalized.includes("次の一歩に向かうあなたを、星と言葉でそっと照らします")) ||
    (normalized.includes("ルミナでは、あなたの「今この瞬間」に寄り添う鑑定をご提供しています") &&
      normalized.includes("オープンな心で、ぜひお越しください")) ||
    (normalized.includes("今のあなたのエネルギーの状態と、これからの引き寄せの流れをルミナの占いで読み解いてみませんか") &&
      normalized.includes("あなたの願いが現実に近づくための道筋を、星と言葉でそっと照らします"))
  );
}

function isTodayPhraseLabel(paragraph: string): boolean {
  const normalized = normalizeText(paragraph).replace(/^🌿/, "");
  return normalized === "今日のひとこと";
}

function toRichBlock(paragraph: string): RichBlock {
  if (paragraph.startsWith("## ")) {
    return { type: "heading", content: paragraph.slice(3).trim() };
  }
  if (paragraph.startsWith("### ")) {
    return { type: "subheading", content: paragraph.slice(4).trim() };
  }
  if (paragraph.startsWith("> ")) {
    return { type: "quote", content: paragraph.slice(2).trim() };
  }
  return { type: "paragraph", content: paragraph };
}

export default async function ColumnDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = getColumnArticle(slug);
  if (!article) {
    notFound();
  }

  const isMember = true;
  const content = getColumnDisplayContent(article, isMember);
  const rawParagraphs = [...content.preview, ...(content.showFull ? content.full : [])];
  const leadNormalized = normalizeText(article.lead);
  const paragraphs = rawParagraphs.reduce<string[]>((acc, paragraph) => {
    const normalized = normalizeText(paragraph);
    if (!normalized) return acc;
    if (normalized === leadNormalized) return acc;
    const prev = acc[acc.length - 1];
    if (prev && normalizeText(prev) === normalized) return acc;
    acc.push(paragraph);
    return acc;
  }, []);
  const quote = paragraphs[0] ?? article.lead;
  const baseBodyParagraphs = paragraphs.length > 0 ? paragraphs.slice(1) : [];
  let affirmation = baseBodyParagraphs[baseBodyParagraphs.length - 1] ?? quote;
  let bodyParagraphs = baseBodyParagraphs;

  const todayLabelIndex = baseBodyParagraphs.findIndex(
    (paragraph) => isTodayPhraseLabel(paragraph) || paragraph.includes("今日のひとこと")
  );
  if (todayLabelIndex >= 0) {
    const next = baseBodyParagraphs[todayLabelIndex + 1];
    if (next && normalizeText(next)) {
      affirmation = next;
    }
    bodyParagraphs = baseBodyParagraphs.filter((_, index) => index !== todayLabelIndex && index !== todayLabelIndex + 1);
  }

  const affirmationNormalized = normalizeComparableText(affirmation);
  if (affirmationNormalized) {
    bodyParagraphs = bodyParagraphs.filter((paragraph, index) => {
      if (
        slug !== "when-anxiety-wont-stop" &&
        slug !== "when-wishes-dont-come-true" &&
        slug !== "why-fortune-telling-feels-accurate" &&
        slug !== "for-you-who-wants-to-manifest"
      ) {
        return true;
      }
      const normalized = normalizeComparableText(paragraph);
      const isTrailingDuplicate = index === bodyParagraphs.length - 1 && normalized === affirmationNormalized;
      const isBrokenTodayLabel = slug === "for-you-who-wants-to-manifest" && normalized.includes("莉頑律縺ｮ縺ｲ縺ｨ縺薙→");
      return !(isTrailingDuplicate || isBrokenTodayLabel);
    });
  }

  const readMinutes = article.readMinutes ?? estimateReadMinutes(paragraphs.length > 0 ? paragraphs : rawParagraphs);
  const related = listColumnArticles(article.category)
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  return (
    <PageShell maxWidth="narrow">
      <div className="mx-auto max-w-[720px] space-y-5">
        <section className="rounded-2xl border border-[#e1d5bf]/74 bg-white/70 p-5 shadow-[0_14px_30px_-24px_rgba(82,69,53,0.24)] backdrop-blur sm:p-6">
          <Link
            href="/columns"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6f6556] underline decoration-[#b9a78b] underline-offset-4 hover:text-[#544c42]"
          >
            <span aria-hidden>{"<-"}</span>
            <span>{"\u9928\u306e\u66f8\u68da\u3078\u623b\u308b"}</span>
          </Link>

          <div className="mt-4">
            <span className="inline-flex rounded-full border border-[#d8c8ab]/82 bg-[#fff8ed]/86 px-3 py-1 text-xs font-medium tracking-wide text-[#7f725f]">
              {article.category}
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-medium leading-tight tracking-tight text-[#2e2a26] sm:text-3xl">
            {article.title}
          </h1>
          <p className="mt-2 text-sm font-medium text-[#7a6f60]">
            {"\u8aad\u4e86\u76ee\u5b89: \u7d04"}
            {readMinutes}
            {"\u5206"}
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#544c42]">{article.lead}</p>
          <div className="mt-5 h-px bg-gradient-to-r from-[#deccb1]/80 via-[#e8dbc7]/85 to-transparent" />
        </section>

        <GlassCard className="border border-[#e1d5bf]/74 bg-white/68 shadow-[0_14px_30px_-24px_rgba(82,69,53,0.24)]">
          <blockquote className="rounded-xl border-l-4 border-[#bfa476] bg-[#fdf7ea]/90 px-4 py-3 text-base leading-relaxed text-[#4e453a]">
            {quote}
          </blockquote>

          <article className="mt-6 max-w-none space-y-5 text-[#3f392f]">
            {bodyParagraphs.map((paragraph, index) => {
              const calloutType = getCalloutType(paragraph);
              const block = toRichBlock(paragraph);

              if (calloutType) {
                return (
                  <GlassCard
                    key={`${article.slug}-callout-${index + 1}`}
                    className="my-7 border border-[#d8c8ab]/82 bg-white/75 shadow-[0_12px_22px_-22px_rgba(82,69,53,0.26)]"
                  >
                    <p className="text-xs font-semibold tracking-[0.16em] text-[#8a7c67]">
                      {CALLOUT_LABELS[calloutType]}
                    </p>
                    <p className="mt-2 text-[1rem] leading-relaxed text-[#4e453a]">{paragraph}</p>
                  </GlassCard>
                );
              }

              if (block.type === "heading") {
                return (
                  <section key={`${article.slug}-heading-${index + 1}`} className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-[#dbcbb0]" />
                      <span className="text-[0.65rem] font-semibold tracking-[0.28em] text-[#9a8a72]">
                        SECTION
                      </span>
                    </div>
                    <h2 className="mt-4 text-[1.35rem] font-medium leading-snug text-[#2f2924] sm:text-[1.55rem]">
                      {block.content}
                    </h2>
                  </section>
                );
              }

              if (block.type === "subheading") {
                return (
                  <h3
                    key={`${article.slug}-subheading-${index + 1}`}
                    className="rounded-xl bg-[#fbf3e5]/88 px-4 py-3 text-[1.02rem] font-medium leading-relaxed text-[#4d4032]"
                  >
                    {block.content}
                  </h3>
                );
              }

              if (block.type === "quote") {
                return (
                  <blockquote
                    key={`${article.slug}-quote-${index + 1}`}
                    className="rounded-2xl border border-[#dccaa9]/76 bg-[#fff7ea]/90 px-5 py-4 text-[1.02rem] leading-[2] text-[#4d4337] shadow-[0_10px_24px_-24px_rgba(82,69,53,0.35)]"
                  >
                    {block.content.split("\n").map((line, lineIndex) => (
                      <p key={`${article.slug}-quote-line-${index + 1}-${lineIndex + 1}`}>{line}</p>
                    ))}
                  </blockquote>
                );
              }

              return (
                <div key={`${article.slug}-paragraph-${index + 1}`} className="space-y-3">
                  <p className="text-[1.02rem] leading-[2.1] text-[#4e453a]">{block.content}</p>
                  {shouldShowConsultationButton(article.slug, block.content) ? (
                    <div className="pt-1">
                      <LuminaLinkButton href="/consultation" tone="secondary" className="px-5">
                        個人鑑定を依頼する
                      </LuminaLinkButton>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </article>
        </GlassCard>

        <GlassCard className="border border-[#e1d5bf]/74 bg-white/72 shadow-[0_14px_30px_-24px_rgba(82,69,53,0.24)]">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#8a7c67]">
            {"\u4eca\u65e5\u306e\u3072\u3068\u3053\u3068"}
          </p>
          <p className="mt-2 text-base leading-relaxed text-[#4e453a]">{affirmation}</p>
          {shouldShowAffirmationConsultationButton(article.slug, affirmation) ? (
            <div className="mt-4">
              <LuminaLinkButton href="/consultation" tone="secondary" className="px-5">
                個人鑑定を依頼する
              </LuminaLinkButton>
            </div>
          ) : null}
        </GlassCard>

        {related.length > 0 ? (
          <section className="rounded-2xl border border-[#e1d5bf]/74 bg-white/66 p-5 shadow-[0_14px_30px_-24px_rgba(82,69,53,0.24)] backdrop-blur sm:p-6">
            <h2 className="text-lg font-medium text-[#2e2a26]">{"\u6b21\u306b\u8aad\u3080"}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/columns/${item.slug}`}
                  className="rounded-xl border border-[#ddd0bb]/82 bg-[#fff9ef]/85 p-4 transition hover:bg-[#fff4e4]"
                >
                  <p className="text-xs font-medium tracking-wide text-[#847967]">{item.category}</p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-[#3f392f]">{item.title}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}
