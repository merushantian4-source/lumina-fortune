import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/ui/page-shell";

const establishedAt = "2026年3月8日";

const termsSections = [
  {
    title: "第1条（サービスの内容）",
    body: [
      "本サービスは、AIを活用したタロット占いのエンターテインメントサービスです。ユーザーの質問やお悩みに対し、AIキャラクター「白の魔女ルミナ」がタロットカードを用いた占いの結果をお伝えします。",
    ],
  },
  {
    title: "第2条（エンターテインメント目的のサービス）",
    body: ["本サービスは、純粋なエンターテインメントおよび娯楽を目的として提供されています。以下の点にご注意ください。"],
    items: [
      "本サービスの占い結果は、科学的根拠に基づくものではありません。",
      "占い結果を、医療・法律・金融・進路・人間関係などの重要な判断の根拠として利用しないでください。",
      "重要な意思決定を行う場合は、必ず専門家（医師・弁護士・ファイナンシャルプランナー等）にご相談ください。",
      "占い結果の正確性・的中率について、当サービスは一切の保証をいたしません。",
    ],
  },
  {
    title: "第3条（禁止事項）",
    body: ["ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。"],
    items: [
      "法令または公序良俗に違反する行為",
      "犯罪行為に関連する行為",
      "本サービスの運営を妨害するような行為",
      "他のユーザー、第三者、または当サービス運営者の知的財産権・プライバシー・名誉・その他の権利を侵害する行為",
      "本サービスを通じて、第三者に不当な差別・誹謗中傷・嫌がらせを行う行為",
      "本サービスのシステムやコンテンツを無断で複製・転用・販売する行為",
      "AIの応答を意図的に誘導し、不正確な情報の拡散に利用する行為",
      "未成年者が保護者の同意なく利用する行為",
      "その他、当サービス運営者が不適切と判断する行為",
    ],
  },
  {
    title: "第4条（個人情報の取り扱い）",
    body: [
      "本サービスにおける個人情報の取り扱いについては、別途定める",
      "に従います。ユーザーが入力した情報は、サービスの提供・改善のために利用される場合があります。センシティブな個人情報（氏名・住所・電話番号・金融情報等）の入力はお控えください。",
    ],
    hasPrivacyLink: true,
  },
  {
    title: "第5条（免責事項）",
    body: ["当サービス運営者は、以下について一切の責任を負いません。"],
    items: [
      "本サービスの占い結果に基づいてユーザーが行った判断・行動により生じたいかなる損害",
      "本サービスの一時的な停止・遅延・中断・廃止により生じた損害",
      "ユーザーが入力した情報の内容に関する問題",
      "本サービスと連携する外部サービスの障害により生じた損害",
      "その他、当サービスの利用に関連してユーザーに生じたあらゆる損害（当サービス運営者の故意または重過失による場合を除く）",
    ],
  },
  {
    title: "第6条（知的財産権）",
    body: [
      "本サービスに含まれるすべてのコンテンツ（テキスト・画像・デザイン・AIキャラクター「白の魔女ルミナ」の設定・会話内容等）に関する著作権その他の知的財産権は、当サービス運営者または正当な権利を有する第三者に帰属します。ユーザーは、これらのコンテンツを当サービス運営者の事前の書面による許可なく、複製・転載・公衆送信・改変・販売等の行為を行うことはできません。",
    ],
  },
  {
    title: "第7条（サービスの変更・停止・終了）",
    body: [
      "当サービス運営者は、ユーザーへの事前通知なく、本サービスの内容の変更・停止・終了を行う場合があります。これによりユーザーに損害が生じた場合であっても、当サービス運営者は責任を負いません。",
    ],
  },
  {
    title: "第8条（利用規約の変更）",
    body: [
      "当サービス運営者は、必要に応じて本規約を変更することがあります。変更後の規約は、本サービス上に掲示した時点から効力を生じるものとします。変更後も本サービスをご利用になる場合、変更後の規約に同意されたものとみなします。",
    ],
  },
  {
    title: "第9条（準拠法および管轄裁判所）",
    body: [
      "本規約の解釈および適用は、日本法に準拠するものとします。本サービスに関連する紛争については、当サービス運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。",
    ],
  },
  {
    title: "第10条（お問い合わせ）",
    body: ["本規約に関するお問い合わせは、本サービス内のお問い合わせフォームよりご連絡ください。"],
  },
];

export const metadata: Metadata = {
  title: "利用規約 | 白の魔女ルミナの占い",
  description: "白の魔女ルミナの占いの利用規約です。",
};

export default function TermsPage() {
  return (
    <PageShell
      title="利用規約"
      description="白の魔女ルミナの占いをご利用いただく前に、ご確認ください。"
      backHref="/"
      backLabel="トップへ戻る"
    >
      <GlassCard className="space-y-6 text-sm leading-relaxed text-[#544c42]">
        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8a7a66]">Terms of Service</p>
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-[#2e2a26]">白の魔女ルミナの占い</h2>
            <p>制定日：{establishedAt}</p>
          </div>
          <p>
            本利用規約（以下「本規約」といいます）は、「白の魔女ルミナの占い」（以下「本サービス」といいます）をご利用いただくすべての方
            （以下「ユーザー」といいます）に適用されます。本サービスをご利用になる前に、本規約をよくお読みください。本サービスをご利用になった時点で、本規約に同意されたものとみなします。
          </p>
        </section>

        {termsSections.map((section) => (
          <section key={section.title} className="space-y-3 border-t border-[#e7dcc7]/70 pt-5">
            <h3 className="text-base font-medium text-[#2e2a26]">{section.title}</h3>
            {section.hasPrivacyLink ? (
              <p>
                {section.body[0]}
                <Link href="/privacy" className="underline decoration-[#b7a98f] underline-offset-4">
                  プライバシーポリシー
                </Link>
                {section.body[1]}
              </p>
            ) : (
              section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            )}
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
