import type { Metadata } from "next";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/ui/page-shell";

const establishedAt = "2026年3月8日";

const privacySections = [
  {
    title: "第1条（収集する情報）",
    body: ["本サービスでは、以下の情報を収集する場合があります。"],
    items: [
      "ユーザーがチャット入力フォームに入力したテキスト（占いの質問・お悩みの内容など）",
      "本サービスへのアクセス日時・利用環境（ブラウザの種類、OSの種類、IPアドレスなど）",
      "Cookieおよびこれに類する技術により取得した利用履歴・行動履歴",
      "なお、本サービスは会員登録不要のサービスであり、氏名・住所・電話番号・メールアドレス等の直接的な個人識別情報を収集することを目的としていません。チャットへの入力は匿名で行っていただけます。ただし、ユーザーが自ら個人情報を入力した場合、当運営者はその情報を取得することがあります。",
    ],
  },
  {
    title: "第2条（情報の利用目的）",
    body: ["収集した情報は、以下の目的のために利用します。"],
    items: [
      "本サービスの提供・運営・維持・改善",
      "AIの占い応答品質の向上および機械学習への活用",
      "不正利用の検知・防止およびセキュリティの確保",
      "アクセス解析・利用状況の統計的把握",
      "本サービスに関するお知らせや重要事項の連絡（該当する場合）",
    ],
  },
  {
    title: "第3条（第三者への提供）",
    body: ["当運営者は、以下のいずれかに該当する場合を除き、ユーザーの個人情報を第三者に提供しません。"],
    items: [
      "ユーザーご本人の同意がある場合",
      "法令に基づき開示・提供が必要な場合",
      "人の生命・身体・財産の保護のために必要であり、ユーザーの同意を得ることが困難な場合",
      "公衆衛生の向上または児童の健全な育成の推進のために特に必要な場合",
    ],
  },
  {
    title: "第4条（外部サービス・AIの利用）",
    body: [
      "本サービスは、AIチャット機能の提供のために外部のAIサービス（Anthropic社が提供するClaudeなど）を利用しています。ユーザーが入力したテキストは、これらの外部サービスのサーバーに送信・処理される場合があります。各外部サービスにおける個人情報の取り扱いについては、各サービスのプライバシーポリシーをご確認ください。",
      "センシティブな個人情報（氏名・住所・電話番号・金融情報・健康情報など）はチャットに入力しないようにしてください。",
    ],
  },
  {
    title: "第5条（Cookieの使用）",
    body: [
      "本サービスでは、サービスの利便性向上やアクセス解析のためにCookieを使用する場合があります。Cookieは、ブラウザの設定により無効にすることが可能ですが、無効にした場合、本サービスの一部機能が正常に動作しない場合があります。",
    ],
  },
  {
    title: "第6条（アクセス解析ツールの使用）",
    body: [
      "本サービスでは、Google Analyticsなどのアクセス解析ツールを使用する場合があります。これらのツールはCookieを使用してトラフィックデータを収集しますが、このデータは匿名で収集されており、個人を特定するものではありません。この機能はCookieを無効にすることで収集を拒否することができます。",
    ],
  },
  {
    title: "第7条（情報の管理・保護）",
    body: [
      "当運営者は、収集した情報の漏洩・紛失・改ざんを防ぐため、合理的なセキュリティ対策を講じます。ただし、インターネット上の通信は完全な安全性を保証できるものではなく、当運営者はセキュリティ上のリスクを完全に排除することを保証するものではありません。",
    ],
  },
  {
    title: "第8条（未成年者のプライバシー）",
    body: [
      "本サービスは、13歳未満の方からの個人情報を意図的に収集することはありません。13歳未満の方がサービスをご利用になる場合は、保護者の方の同意および監督のもとでご利用ください。",
    ],
  },
  {
    title: "第9条（プライバシーポリシーの変更）",
    body: [
      "当運営者は、法令の変更やサービス内容の変更に伴い、本プライバシーポリシーを予告なく変更する場合があります。変更後のプライバシーポリシーは、本サービス上に掲示した時点から効力を生じるものとします。重要な変更がある場合には、本サービス上でお知らせします。",
    ],
  },
  {
    title: "第10条（お問い合わせ）",
    body: [
      "本プライバシーポリシーに関するお問い合わせ、または個人情報の開示・訂正・削除のご依頼は、本サービス内のお問い合わせフォームよりご連絡ください。",
    ],
  },
];

export const metadata: Metadata = {
  title: "プライバシーポリシー | 白の魔女ルミナの占い",
  description: "白の魔女ルミナの占いのプライバシーポリシーです。",
};

export default function PrivacyPage() {
  return (
    <PageShell
      title="プライバシーポリシー"
      description="白の魔女ルミナの占いにおける個人情報の取り扱いについてご案内します。"
      backHref="/"
      backLabel="トップへ戻る"
    >
      <GlassCard className="space-y-6 text-sm leading-relaxed text-[#544c42]">
        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8a7a66]">Privacy Policy</p>
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-[#2e2a26]">白の魔女ルミナの占い</h2>
            <p>制定日：{establishedAt}</p>
          </div>
          <p>
            「白の魔女ルミナの占い」（以下「本サービス」といいます）の運営者（以下「当運営者」といいます）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーは、本サービスにおける個人情報の取り扱いについて定めるものです。
          </p>
        </section>

        {privacySections.map((section) => (
          <section key={section.title} className="space-y-3 border-t border-[#e7dcc7]/70 pt-5">
            <h3 className="text-base font-medium text-[#2e2a26]">{section.title}</h3>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.items ? (
              <ul className="list-disc space-y-2 pl-5">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section className="space-y-2 border-t border-[#e7dcc7]/70 pt-5 text-xs text-[#6f6355]">
          <p>制定日：{establishedAt}</p>
          <p>白の魔女ルミナの占い 運営者</p>
        </section>
      </GlassCard>
    </PageShell>
  );
}
