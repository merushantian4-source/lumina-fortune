import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LuminaLinkButton } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { TableOfContents } from "@/components/columns/table-of-contents";
import { getColumnArticle, getColumnDisplayContent, listColumnArticles } from "@/lib/columns";

const RELATED_COLUMNS: Record<string, { slug: string; title: string }[]> = {
  "wakare-danjo-shinri": [
    { slug: "motokare-kimochi", title: "元彼の気持ち——別れた後も気になるあの人は、今なにを想っているのか" },
    { slug: "kidoku-yoru", title: "既読がつかない夜に読んでほしい話" },
    { slug: "kidokumushi-dansei", title: "既読無視する男性の心の中で、本当は何が起きているのか" },
    { slug: "renraku-matsu", title: "連絡を待つ時間は、無駄じゃない" },
    { slug: "sukinanoni-renraku-shinai", title: "好きなのに連絡してこない男性は、何を考えているのか" },
  ],
  "motokare-kimochi": [
    { slug: "kidoku-yoru", title: "既読がつかない夜に読んでほしい話" },
    { slug: "kidokumushi-dansei", title: "既読無視する男性の心の中で、本当は何が起きているのか" },
    { slug: "renraku-matsu", title: "連絡を待つ時間は、無駄じゃない" },
    { slug: "sukinanoni-renraku-shinai", title: "好きなのに連絡してこない男性は、何を考えているのか" },
  ],
  "sukinanoni-renraku-shinai": [
    { slug: "kidoku-yoru", title: "既読がつかない夜に読んでほしい話" },
    { slug: "kidokumushi-dansei", title: "既読無視する男性の心の中で、本当は何が起きているのか" },
    { slug: "renraku-matsu", title: "連絡を待つ時間は、無駄じゃない" },
  ],
  "unmei-sign": [
    { slug: "kidoku-yoru", title: "既読がつかない夜に読んでほしい話" },
    { slug: "renraku-matsu", title: "連絡を待つ時間は、無駄じゃない" },
    { slug: "wakare-danjo-shinri", title: "別れた後の気持ちの変化——男女ですれ違う「悲しみのタイミング」と、復縁の可能性" },
    { slug: "motokare-kimochi", title: "元彼の気持ち——別れた後も気になるあの人は、今なにを想っているのか" },
    { slug: "kidokumushi-dansei", title: "既読無視する男性の心の中で、本当は何が起きているのか" },
    { slug: "sukinanoni-renraku-shinai", title: "好きなのに連絡してこない男性は、何を考えているのか" },
  ],
  "honki-koudou": [
    { slug: "sukinanoni-renraku-shinai", title: "好きなのに連絡してこない男性は、何を考えているのか" },
    { slug: "kidokumushi-dansei", title: "既読無視する男性の心の中で、本当は何が起きているのか" },
    { slug: "kidoku-yoru", title: "既読がつかない夜に読んでほしい話" },
    { slug: "renraku-matsu", title: "連絡を待つ時間は、無駄じゃない" },
    { slug: "unmei-sign", title: "運命の人に出会う前に現れる7つのサイン——今のつらさは、始まりの合図かもしれない" },
    { slug: "motokare-kimochi", title: "元彼の気持ち——別れた後も気になるあの人は、今なにを想っているのか" },
    { slug: "wakare-danjo-shinri", title: "別れた後の気持ちの変化——男女ですれ違う「悲しみのタイミング」と、復縁の可能性" },
  ],
  "renai-tenki": [
    { slug: "unmei-sign", title: "運命の人に出会う前に現れる7つのサイン——今のつらさは、始まりの合図かもしれない" },
    { slug: "renraku-matsu", title: "連絡を待つ時間は、無駄じゃない" },
    { slug: "kidoku-yoru", title: "既読がつかない夜に読んでほしい話" },
    { slug: "honki-koudou", title: "男性が本気で好きな女性にだけ見せる8つの行動——言葉にしない愛情の見つけ方" },
    { slug: "sukinanoni-renraku-shinai", title: "好きなのに連絡してこない男性は、何を考えているのか" },
    { slug: "wakare-danjo-shinri", title: "別れた後の気持ちの変化——男女ですれ違う「悲しみのタイミング」と、復縁の可能性" },
    { slug: "motokare-kimochi", title: "元彼の気持ち——別れた後も気になるあの人は、今なにを想っているのか" },
    { slug: "kidokumushi-dansei", title: "既読無視する男性の心の中で、本当は何が起きているのか" },
  ],
};

const ARTICLE_METADATA: Record<string, Metadata> = {
  "wakare-danjo-shinri": {
    title: "別れた後の気持ちの変化——男女ですれ違う「悲しみのタイミング」と、復縁の可能性 - ルミナ",
    description:
      "別れた後の男女の心理変化の違いと、復縁の可能性が生まれるタイミングを解説。あの人がまだ気になる夜に読んでほしい話。",
    openGraph: {
      title: "別れた後の気持ちの変化——男女ですれ違う「悲しみのタイミング」と、復縁の可能性",
      description:
        "別れた後の男女の心理変化の違いと、復縁の可能性が生まれるタイミングを解説。あの人がまだ気になる夜に読んでほしい話。",
      type: "article",
    },
  },
  "motokare-kimochi": {
    title: "元彼の気持ち——別れた後も気になるあの人は、今なにを想っているのか - ルミナ",
    description:
      "別れた後の元彼の気持ちと男性心理を解説。元カノを思い出す瞬間、連絡してこない理由、復縁の可能性まで。あの人がまだ気になる夜に読んでほしい話。",
    openGraph: {
      title: "元彼の気持ち——別れた後も気になるあの人は、今なにを想っているのか",
      description:
        "別れた後の元彼の気持ちと男性心理を解説。元カノを思い出す瞬間、連絡してこない理由、復縁の可能性まで。あの人がまだ気になる夜に読んでほしい話。",
      type: "article",
    },
  },
  "sukinanoni-renraku-shinai": {
    title: "好きなのに連絡してこない男性は、何を考えているのか｜男性心理をやさしく解説 - ルミナ",
    description:
      "好きなのに連絡しない男性心理を解説。連絡こない理由、脈なしとの見分け方、自分から連絡していいかの判断基準まで。不安な夜に、少しだけ心が軽くなる話。",
    openGraph: {
      title: "好きなのに連絡してこない男性は、何を考えているのか",
      description:
        "好きなのに連絡しない男性心理を解説。連絡こない理由、脈なしとの見分け方、自分から連絡していいかの判断基準まで。不安な夜に、少しだけ心が軽くなる話。",
      type: "article",
    },
  },
  "kidokumushi-dansei": {
    title: "既読無視する男性の心の中で、本当は何が起きているのか｜男性心理をやさしく解説 - ルミナ",
    description:
      "既読無視する男性心理を解説。既読スルーの理由、わざと返信しない場合の本音、脈なしとの違いまで。返信がこない夜に、少しだけ心が軽くなる話。",
    openGraph: {
      title: "既読無視する男性の心の中で、本当は何が起きているのか",
      description:
        "既読無視する男性心理を解説。既読スルーの理由、わざと返信しない場合の本音、脈なしとの違いまで。返信がこない夜に、少しだけ心が軽くなる話。",
      type: "article",
    },
  },
  "renraku-matsu": {
    title: "連絡を待つ時間は、無駄じゃない｜好きな人から連絡こない夜に - ルミナ",
    description:
      "好きな人から連絡こない日が続いてつらいあなたへ。連絡が減った理由、待つことの意味、自分から連絡すべきか迷ったときの考え方を、やさしい言葉でお伝えします。",
    openGraph: {
      title: "連絡を待つ時間は、無駄じゃない",
      description:
        "好きな人から連絡こない日が続いてつらいあなたへ。連絡が減った理由、待つことの意味、自分から連絡すべきか迷ったときの考え方を、やさしい言葉でお伝えします。",
      type: "article",
    },
  },
  "renai-tenki": {
    title: "恋愛が動く5つのタイミング｜止まっている恋にも転機は来る - ルミナ",
    description:
      "恋愛が動くタイミングを5つ紹介。手放しかけたとき、環境が変わるとき、自分のために動き始めたとき——止まっているように見える恋にも転機がある理由と、その見つけ方。",
    openGraph: {
      title: "恋愛が動く5つのタイミング——止まっているように見える恋にも、転機は来る",
      description:
        "恋愛が動くタイミングを5つ紹介。手放しかけたとき、環境が変わるとき、自分のために動き始めたとき——止まっているように見える恋にも転機がある理由と、その見つけ方。",
      type: "article",
    },
  },
  "honki-koudou": {
    title: "男性が本気で好きな女性にだけ見せる8つの行動｜言葉にしない愛情の見つけ方 - ルミナ",
    description:
      "男性が本気で好きな女性にだけ見せる行動を8つ紹介。小さな変化に気づく、用事がないのに連絡してくる、弱さを見せる——言葉にしない男性の愛情表現の見つけ方。",
    openGraph: {
      title: "男性が本気で好きな女性にだけ見せる8つの行動——言葉にしない愛情の見つけ方",
      description:
        "男性が本気で好きな女性にだけ見せる行動を8つ紹介。小さな変化に気づく、用事がないのに連絡してくる、弱さを見せる——言葉にしない男性の愛情表現の見つけ方。",
      type: "article",
    },
  },
  "unmei-sign": {
    title: "運命の人に出会う前に現れる7つのサイン｜今のつらさは始まりの合図かもしれない - ルミナ",
    description:
      "運命の人に出会う前に現れるサインを7つ紹介。つらい時期が続くのは、大切な出会いの前兆かもしれません。恋愛に疲れた夜に読んでほしい話。",
    openGraph: {
      title: "運命の人に出会う前に現れる7つのサイン｜今のつらさは始まりの合図かもしれない",
      description:
        "運命の人に出会う前に現れるサインを7つ紹介。つらい時期が続くのは、大切な出会いの前兆かもしれません。恋愛に疲れた夜に読んでほしい話。",
      type: "article",
    },
  },
  "kidoku-yoru": {
    title: "既読がつかない夜に読んでほしい話｜既読無視は終わりじゃない - ルミナ",
    description:
      "既読無視や既読スルーが続いて不安な夜に。返信こない時間の意味と、脈なしだと決めつけてしまう前に知ってほしいことを、やさしい言葉でお伝えします。",
    openGraph: {
      title: "既読がつかない夜に読んでほしい話",
      description:
        "既読無視や既読スルーが続いて不安な夜に。返信こない時間の意味と、脈なしだと決めつけてしまう前に知ってほしいことを、やさしい言葉でお伝えします。",
      type: "article",
    },
  },
};

const ARTICLE_JSONLD: Record<string, object> = {
  "wakare-danjo-shinri": {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "別れた後の気持ちの変化——男女ですれ違う「悲しみのタイミング」と、復縁の可能性",
    description:
      "別れた後の男女の心理変化の違いと、復縁の可能性が生まれるタイミングを解説。あの人がまだ気になる夜に読んでほしい話。",
    author: { "@type": "Person", name: "ルミナ" },
    publisher: { "@type": "Organization", name: "ルミナ" },
  },
  "motokare-kimochi": {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "元彼の気持ち——別れた後も気になるあの人は、今なにを想っているのか",
    description:
      "別れた後の元彼の気持ちと男性心理を解説。元カノを思い出す瞬間、連絡してこない理由、復縁の可能性まで。あの人がまだ気になる夜に読んでほしい話。",
    author: { "@type": "Person", name: "ルミナ" },
    publisher: { "@type": "Organization", name: "ルミナ" },
  },
  "sukinanoni-renraku-shinai": {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "好きなのに連絡してこない男性は、何を考えているのか",
    description:
      "好きなのに連絡しない男性心理を解説。連絡こない理由、脈なしとの見分け方、自分から連絡していいかの判断基準まで。不安な夜に、少しだけ心が軽くなる話。",
    author: { "@type": "Person", name: "ルミナ" },
    publisher: { "@type": "Organization", name: "ルミナ" },
  },
  "kidokumushi-dansei": {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "既読無視する男性の心の中で、本当は何が起きているのか",
    description:
      "既読無視する男性心理を解説。既読スルーの理由、わざと返信しない場合の本音、脈なしとの違いまで。返信がこない夜に、少しだけ心が軽くなる話。",
    author: { "@type": "Person", name: "ルミナ" },
    publisher: { "@type": "Organization", name: "ルミナ" },
  },
  "renraku-matsu": {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "連絡を待つ時間は、無駄じゃない",
    description:
      "好きな人から連絡こない日が続いてつらいあなたへ。連絡が減った理由、待つことの意味、自分から連絡すべきか迷ったときの考え方を、やさしい言葉でお伝えします。",
    author: { "@type": "Person", name: "ルミナ" },
    publisher: { "@type": "Organization", name: "ルミナ" },
  },
  "renai-tenki": {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "恋愛が動く5つのタイミング——止まっているように見える恋にも、転機は来る",
    description:
      "恋愛が動くタイミングを5つ紹介。手放しかけたとき、環境が変わるとき、自分のために動き始めたとき——止まっているように見える恋にも転機がある理由と、その見つけ方。",
    author: { "@type": "Person", name: "ルミナ" },
    publisher: { "@type": "Organization", name: "ルミナ" },
  },
  "honki-koudou": {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "男性が本気で好きな女性にだけ見せる8つの行動——言葉にしない愛情の見つけ方",
    description:
      "男性が本気で好きな女性にだけ見せる行動を8つ紹介。小さな変化に気づく、用事がないのに連絡してくる、弱さを見せる——言葉にしない男性の愛情表現の見つけ方。",
    author: { "@type": "Person", name: "ルミナ" },
    publisher: { "@type": "Organization", name: "ルミナ" },
  },
  "unmei-sign": {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "運命の人に出会う前に現れる7つのサイン｜今のつらさは始まりの合図かもしれない",
    description:
      "運命の人に出会う前に現れるサインを7つ紹介。つらい時期が続くのは、大切な出会いの前兆かもしれません。恋愛に疲れた夜に読んでほしい話。",
    author: { "@type": "Person", name: "ルミナ" },
    publisher: { "@type": "Organization", name: "ルミナ" },
  },
  "kidoku-yoru": {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "既読がつかない夜に読んでほしい話",
    description:
      "既読無視や既読スルーが続いて不安な夜に。返信こない時間の意味と、脈なしだと決めつけてしまう前に知ってほしいことを、やさしい言葉でお伝えします。",
    author: { "@type": "Person", name: "ルミナ" },
    publisher: { "@type": "Organization", name: "ルミナ" },
  },
};

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

const CATEGORY_DISPLAY: Record<string, string> = {
  仕事: "仕事",
  失恋: "恋愛",
  不安: "不安",
  願い: "願い",
  占い: "占い",
};

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
    slug !== "when-wishes-feel-far" &&
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

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[#3a3229]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
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

type ArticleSection = {
  heading: string;
  id: string;
  paragraphs: string[];
};

function toHeadingId(text: string, index: number): string {
  return `section-${index + 1}`;
}

function groupIntoSections(paragraphs: string[]): { intro: string[]; sections: ArticleSection[] } {
  const intro: string[] = [];
  const sections: ArticleSection[] = [];
  let current: ArticleSection | null = null;

  for (const p of paragraphs) {
    const block = toRichBlock(p);
    if (block.type === "heading") {
      if (current) sections.push(current);
      const id = toHeadingId(block.content, sections.length);
      current = { heading: block.content, id, paragraphs: [] };
    } else if (current) {
      current.paragraphs.push(p);
    } else {
      intro.push(p);
    }
  }
  if (current) sections.push(current);
  return { intro, sections };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getColumnArticle(slug);
  if (!article) return {};
  const override = ARTICLE_METADATA[slug];
  if (override) return override;
  return {
    title: `${article.title} - ルミナ`,
    description: article.lead,
  };
}

export default async function ColumnDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const maybeArticle = getColumnArticle(slug);
  if (!maybeArticle) {
    notFound();
  }
  const article = maybeArticle;

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
  const baseBodyParagraphs = paragraphs;
  let affirmation = baseBodyParagraphs[baseBodyParagraphs.length - 1] ?? article.lead;
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
        slug !== "when-wishes-feel-far" &&
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

  const jsonLd = ARTICLE_JSONLD[slug];

  // Group body paragraphs into intro (before first h2) and sections (each h2 + its content)
  const { intro, sections } = groupIntoSections(bodyParagraphs);
  const tocHeadings = sections.map((s) => ({ id: s.id, text: s.heading }));

  // Helper to render a single paragraph block
  function renderBlock(paragraph: string, index: number, totalCount: number) {
    const calloutType = getCalloutType(paragraph);
    const block = toRichBlock(paragraph);

    if (calloutType) {
      return (
        <div
          key={`${article.slug}-callout-${index}`}
          className="my-6 rounded-xl border border-[#d8c8ab]/60 bg-white/70 p-5 shadow-[0_8px_20px_-16px_rgba(82,69,53,0.2)]"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9a8a72]">
            {CALLOUT_LABELS[calloutType]}
          </p>
          <p className="mt-2.5 text-[1rem] leading-[2.1] text-[#3a342c]">{paragraph}</p>
        </div>
      );
    }

    if (block.type === "subheading") {
      return (
        <h3
          key={`${article.slug}-sub-${index}`}
          className="rounded-lg border-l-[3px] border-[#d4c4a8] bg-[#f5eddf]/80 px-4 py-2.5 text-[1rem] font-semibold leading-relaxed text-[#3a332a]"
        >
          {block.content}
        </h3>
      );
    }

    if (block.type === "quote") {
      const isClosingQuote = slug === "wakare-danjo-shinri" && index === totalCount - 1;
      return (
        <div key={`${article.slug}-quote-${index}`}>
          <blockquote className="rounded-xl border-l-[3px] border-[#c9a96e]/70 bg-[#fdf8ee] px-5 py-4 text-[0.95rem] italic leading-[2.2] text-[#4a4239]">
            {block.content.split("\n").map((line, li) => (
              <p key={`${article.slug}-ql-${index}-${li}`}>{line}</p>
            ))}
          </blockquote>
          {isClosingQuote ? (
            <div className="mt-4">
              <LuminaLinkButton href="/consultation" tone="secondary" className="px-5">
                個人鑑定を依頼する
              </LuminaLinkButton>
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div key={`${article.slug}-p-${index}`}>
        <p className="text-[1rem] leading-[2.2] text-[#3a342c]">{renderInlineMarkdown(block.content)}</p>
        {shouldShowConsultationButton(article.slug, block.content) ? (
          <div className="mt-3">
            <LuminaLinkButton href="/consultation" tone="secondary" className="px-5">
              個人鑑定を依頼する
            </LuminaLinkButton>
          </div>
        ) : null}
      </div>
    );
  }

  const categoryLabel = CATEGORY_DISPLAY[article.category] ?? article.category;

  return (
    <PageShell maxWidth="narrow" showBottomHomeButton={false}>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <div className="mx-auto max-w-[700px]">
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-1.5 text-[12px] text-[#a09484]">
          <Link href="/" className="transition hover:text-[#6f6556]">トップ</Link>
          <span aria-hidden>/</span>
          <Link href="/columns" className="transition hover:text-[#6f6556]">館の書棚</Link>
          <span aria-hidden>/</span>
          <span className="text-[#6f6556]">{article.title.length > 20 ? `${article.title.slice(0, 20)}...` : article.title}</span>
        </nav>

        {/* Article Header Card */}
        <header className="mb-6 overflow-hidden rounded-2xl border border-[#d8c8ab]/50 bg-white/85 shadow-[0_14px_32px_-20px_rgba(82,69,53,0.16)] backdrop-blur">
          {/* Eyecatch / Hero Image */}
          {article.heroImage ? (
            <div className="overflow-hidden">
              <Image
                src={article.heroImage}
                alt={article.title}
                width={700}
                height={394}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          ) : null}

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-full border border-[#d8c8ab]/70 bg-[#fff8ed] px-3 py-0.5 text-[11px] font-semibold tracking-[0.08em] text-[#7f725f]">
                {categoryLabel}
              </span>
              <span className="text-[12px] text-[#b5a48e]">·</span>
              <span className="text-[12px] tracking-wide text-[#b5a48e]">
                約{readMinutes}分
              </span>
            </div>

            <h1 className="mt-4 text-[1.55rem] font-bold leading-[1.45] tracking-tight text-[#1e1a16] sm:text-[1.8rem]">
              {article.title}
            </h1>

            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-[#d4c4a8]/50 to-transparent" />
              <span className="text-[10px] text-[#c9a96e]">✦</span>
              <div className="h-px flex-1 bg-gradient-to-l from-[#d4c4a8]/50 to-transparent" />
            </div>

            <p className="mt-5 text-[1rem] leading-[2] text-[#4a4139]">{article.lead}</p>
          </div>
        </header>

        {/* Introduction paragraphs (before first h2) */}
        {intro.length > 0 ? (
          <div className="mb-6 rounded-2xl border border-[#e1d5bf]/40 bg-white/80 p-6 shadow-[0_8px_20px_-16px_rgba(82,69,53,0.1)] backdrop-blur sm:p-8">
            <div className="space-y-[1.8em]">
              {intro.map((p, i) => renderBlock(p, i, intro.length))}
            </div>
          </div>
        ) : null}

        {/* Table of Contents */}
        {tocHeadings.length > 0 ? (
          <div className="mb-8">
            <TableOfContents headings={tocHeadings} />
          </div>
        ) : null}

        {/* Article Body Sections */}
        <article>
          {sections.map((section, sectionIndex) => {
            const sectionImage = article.sectionImages?.[sectionIndex];
            return (
              <div key={section.id} className="mb-6">
                {/* Section divider (ornamental between sections, not before the first) */}
                {sectionIndex > 0 ? (
                  sectionImage ? (
                    <div className="mb-6 overflow-hidden rounded-2xl shadow-[0_10px_24px_-20px_rgba(82,69,53,0.18)]">
                      <Image
                        src={sectionImage.src}
                        alt={sectionImage.alt}
                        width={700}
                        height={394}
                        className="h-auto w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mb-6 flex items-center gap-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4c4a8]/45 to-transparent" />
                      <span className="text-[10px] text-[#c9a96e]/70">✦</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4c4a8]/45 to-transparent" />
                    </div>
                  )
                ) : null}

                {/* Section card with background */}
                <section className="rounded-2xl border border-[#e1d5bf]/40 bg-white/80 p-6 shadow-[0_8px_20px_-16px_rgba(82,69,53,0.1)] backdrop-blur sm:p-8">
                  {/* h2 heading with anchor */}
                  <h2
                    id={section.id}
                    className="-mx-6 mb-6 scroll-mt-20 border-l-[3px] border-[#c9a96e] bg-[linear-gradient(90deg,#f5eddf,#faf6ef_70%,transparent)] px-6 py-3 text-[1.2rem] font-semibold leading-[1.5] tracking-tight text-[#2f2924] sm:-mx-8 sm:px-8 sm:text-[1.35rem]"
                  >
                    {section.heading}
                  </h2>

                  {/* Section body */}
                  <div className="space-y-[1.8em]">
                    {section.paragraphs.map((p, pi) => renderBlock(p, pi, section.paragraphs.length))}
                  </div>
                </section>
              </div>
            );
          })}
        </article>

        {/* 今日のひとこと */}
        <section className="mb-6 rounded-2xl border border-[#d8c8ab]/50 bg-[linear-gradient(160deg,rgba(253,247,234,0.9),rgba(255,252,245,0.85))] p-6 shadow-[0_12px_28px_-20px_rgba(82,69,53,0.18)] sm:p-8">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4c4a8]/40 to-transparent" />
            <p className="text-[11px] font-bold tracking-[0.22em] text-[#9a8a72]">
              今日のひとこと
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4c4a8]/40 to-transparent" />
          </div>
          <p className="mt-4 text-center text-[1rem] italic leading-[2] text-[#5a4f42]">{affirmation}</p>
          {shouldShowAffirmationConsultationButton(article.slug, affirmation) ? (
            <div className="mt-5 text-center">
              <LuminaLinkButton href="/consultation" tone="secondary" className="px-5">
                個人鑑定を依頼する
              </LuminaLinkButton>
            </div>
          ) : null}
        </section>

        {/* CTA sections (unchanged logic) */}
        {slug === "kidoku-yoru" || slug === "renraku-matsu" || slug === "unmei-sign" || slug === "renai-tenki" ? (
          <section className="mb-6 rounded-2xl border border-[#d8c8ab]/50 bg-[linear-gradient(165deg,rgba(255,252,245,0.85),rgba(248,240,225,0.8))] p-6 shadow-[0_12px_28px_-20px_rgba(82,69,53,0.16)] sm:p-8">
            <p className="text-center text-[0.92rem] leading-relaxed text-[#6f6556]">
              あなたの恋の流れを、カードに聞いてみませんか。
            </p>
            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <LuminaLinkButton href="/uranai/kataomoi" tone="primary" className="px-5">
                あなたの恋の流れを見てみる（片思い占い）
              </LuminaLinkButton>
              <LuminaLinkButton href="/uranai/kare-no-kimochi" tone="secondary" className="px-5">
                あの人の本音を読み解く（あの人の気持ち占い）
              </LuminaLinkButton>
            </div>
          </section>
        ) : null}

        {slug === "kidokumushi-dansei" || slug === "sukinanoni-renraku-shinai" || slug === "honki-koudou" ? (
          <section className="mb-6 rounded-2xl border border-[#d8c8ab]/50 bg-[linear-gradient(165deg,rgba(255,252,245,0.85),rgba(248,240,225,0.8))] p-6 shadow-[0_12px_28px_-20px_rgba(82,69,53,0.16)] sm:p-8">
            <p className="text-center text-[0.92rem] leading-relaxed text-[#6f6556]">
              あの人の沈黙の奥にある気持ちを、カードに聞いてみませんか。
            </p>
            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <LuminaLinkButton href="/uranai/kare-no-kimochi" tone="primary" className="px-5">
                あの人の本音を読み解く（あの人の気持ち占い）
              </LuminaLinkButton>
              <LuminaLinkButton href="/uranai/kataomoi" tone="secondary" className="px-5">
                あなたの恋の流れを見てみる（片思い占い）
              </LuminaLinkButton>
            </div>
          </section>
        ) : null}

        {slug === "motokare-kimochi" || slug === "wakare-danjo-shinri" ? (
          <section className="mb-6 rounded-2xl border border-[#d8c8ab]/50 bg-[linear-gradient(165deg,rgba(255,252,245,0.85),rgba(248,240,225,0.8))] p-6 shadow-[0_12px_28px_-20px_rgba(82,69,53,0.16)] sm:p-8">
            <p className="text-center text-[0.92rem] leading-relaxed text-[#6f6556]">
              あの人との間に残っている光を、カードに聞いてみませんか。
            </p>
            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <LuminaLinkButton href="/uranai/fukuen" tone="primary" className="px-5">
                復縁の可能性を見てみる（復縁占い）
              </LuminaLinkButton>
              <LuminaLinkButton href="/uranai/kare-no-kimochi" tone="secondary" className="px-5">
                あの人の本音を読み解く（あの人の気持ち占い）
              </LuminaLinkButton>
            </div>
          </section>
        ) : null}

        {/* Related columns */}
        {RELATED_COLUMNS[slug] ? (
          <section className="mb-6 rounded-2xl border border-[#e1d5bf]/50 bg-white/60 p-6 shadow-[0_12px_28px_-20px_rgba(82,69,53,0.14)] backdrop-blur sm:p-8">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#c9a96e]">✦</span>
              <h2 className="text-[0.95rem] font-semibold tracking-wide text-[#4e453a]">関連コラム</h2>
            </div>
            <div className="mt-4 grid gap-2.5">
              {RELATED_COLUMNS[slug].map((item) => (
                <Link
                  key={item.slug}
                  href={`/columns/${item.slug}`}
                  className="group rounded-xl border border-[#e1d5bf]/40 bg-[#fdfaf4]/70 px-4 py-3.5 transition hover:border-[#d4c4a8]/60 hover:bg-[#fff8ed]/90"
                >
                  <p className="text-[0.85rem] font-medium leading-relaxed text-[#4e453a] transition group-hover:text-[#2e2a26]">{item.title}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Next to read */}
        {related.length > 0 ? (
          <section className="mb-6 rounded-2xl border border-[#e1d5bf]/50 bg-white/60 p-6 shadow-[0_12px_28px_-20px_rgba(82,69,53,0.14)] backdrop-blur sm:p-8">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#c9a96e]">✦</span>
              <h2 className="text-[0.95rem] font-semibold tracking-wide text-[#4e453a]">次に読む</h2>
            </div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/columns/${item.slug}`}
                  className="group rounded-xl border border-[#e1d5bf]/40 bg-[#fdfaf4]/70 px-4 py-3.5 transition hover:border-[#d4c4a8]/60 hover:bg-[#fff8ed]/90"
                >
                  <p className="text-[11px] font-medium tracking-wide text-[#a09484]">{CATEGORY_DISPLAY[item.category] ?? item.category}</p>
                  <p className="mt-1 text-[0.85rem] font-medium leading-relaxed text-[#4e453a] transition group-hover:text-[#2e2a26]">{item.title}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Bottom navigation */}
        <div className="flex items-center justify-center gap-4 pb-1">
          <LuminaLinkButton href="/columns" tone="secondary" className="px-6">
            館の書棚に戻る
          </LuminaLinkButton>
          <LuminaLinkButton href="/" tone="secondary" className="px-6">
            トップへ戻る
          </LuminaLinkButton>
        </div>
      </div>
    </PageShell>
  );
}
