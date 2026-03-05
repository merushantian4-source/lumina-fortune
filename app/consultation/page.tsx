"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";

const PROFILE_STORAGE_KEY = "lumina_profile";

type Category = "恋愛" | "仕事" | "人間関係" | "家庭" | "健康" | "その他";
type BloodType = "A" | "B" | "O" | "AB" | "未回答";
type Gender = "男性" | "女性" | "ノンバイナリー" | "未回答";

type StoredProfile = {
  nickname?: string;
  birthdate?: string;
};

const TAROT_KANTEI_INTRO = `鑑定のご依頼ありがとうございます。

今回のカードからは、
「人生の大きな節目に立っている流れ」
が強く出ています。

メールを開いた瞬間、ハクがぴんと背筋を伸ばして、あなたの方向をじっと見つめました。それだけで、あなたのエネルギーの強さが伝わってきましたよ。
少し聞かせてください。
あなたはこれまでの人生で、「なぜ自分はこんなに人のことを考えてしまうのだろう」と感じたことはありませんか？
その答えが、今日の鑑定の中にあります。

【運命数9「終わりなき慈愛」の魂】
・運命数9があなたに伝えること
運命数9は、1から9までの円環の最後の数字にして、すべてを包む完成の光です。
9を持って生まれた方は、魂のレベルで「与えること・手放すこと・許すこと」を学びに来ています。
生まれながらに視野が広く、小さなことより大きな流れを見ようとする。一人の人間というより、時代や社会全体を感じ取るアンテナを持っているような魂です。

【運命数9の光と影】
・光の部分
人の痛みへの共感力が際立っています。初めて会った人でも、その人が今どんな状態にあるか、なんとなくわかってしまう。その感受性は、あなたの最大の才能です。
また、執着を手放す力。これが9の魂の真骨頂。物事の終わりを悲しみながらも、最終的には「これでよかった」と受け入れられる強さを持っています。
・影の部分
与えすぎて、受け取ることが苦手になりがちです。
誰かに「ありがとう」と言われたとき、素直に受け取れずに「大したことしていないから」と流してしまう。そんな場面、心当たりはありませんか？
9の魂の課題は、「受け取ることも愛である」と知ること。あなたが受け取ることで、相手も喜びを感じられるのです。

【心理メッセージ】
あなたはこれまで、誰かのために一生懸命生きてきたはずです。
それは間違いではありません。でも、そろそろ「自分のために生きることも、誰かへの贈り物になる」と信じてほしいのです。
あなたが幸せでいることが、あなたの周りの人たちの幸せにもつながっています。
あなたは、ただ存在しているだけで、誰かの光になっています。`;

const TAROT_KANTEI_SAMPLE = `【白の魔女ルミナ 個人鑑定 】
〜タロット・ホロスコープスプレッド 人生全体リーディング〜
・運命数9 × 13枚の魂の地図

ハクが静かに目を閉じ、13枚のカードの流れをゆっくりと感じ取っています……フランキンセンスとローズの香りが、ふわりと部屋に広がりました。

改めて、カードと向き合ってくださりありがとうございます。
先ほどの宿曜と数秘術で見えてきた「静かなる光」の魂。今日はそこにタロットという鏡を当てて、あなたの人生をもう少し細かく照らしていきましょう。
ハクが13枚のカードをじっと見つめながら、小さく羽根を揺らしました。まるで「この人のこと、もっと教えてあげて」と言っているようです。
ひとつ聞かせてください。
あなたはこれまで、「自分はまだ本気を出していない」と感じながら過ごしてきた瞬間はありませんか？
この13枚には、その答えが静かに宿っています。

【スプレッド全体の印象】
まず全体を眺めて、私が最初に感じたことをお伝えします。
このスプレッドには硬貨のカードが5枚、そしてペイジが2枚・ナイトが1枚と、コートカードが多く登場しています。
硬貨の多さは「地に足のついた豊かさへの道」を示し、コートカードの多さは「人生がまだ発展途上にある」というサイン。これは未熟という意味ではありません。むしろ、あなたの人生にはまだこれから開いていく扉がたくさんあるということです。
全体的に見ると、「豊かさの種はすでに持っている。あとは、どう育てるかを学んでいく旅の途中」という印象を受けます。
では、一つひとつ見ていきましょう。

【第1ハウス：自己・外見・第一印象】
硬貨のペイジ（正位置）
あなた自身を表すカードです。
硬貨のペイジは、学びへの好奇心と、着実に物事を積み上げていこうとする姿勢を持つ人物。若々しい探究心と、現実的な感覚を同時に持ち合わせています。
周りからは「しっかりしている」「落ち着いている」と見られることが多いのではないでしょうか。でも内側では常に「もっと知りたい、もっと成長したい」という熱がふつふつと燃えている。そんな方です。
運命数9の「終わりなき慈愛」と亢宿の「誠実さ」が、このペイジのエネルギーとぴったり重なります。あなたは生涯、学び続けることで輝く魂なのだと、カードが教えてくれています。

【第2ハウス：お金・所有・価値観】
カップの9（正位置）
金運・物質的豊かさのカードです。
カップの9は「願望成就」「物質的・精神的な充足」を示す、タロットの中でも特に幸運なカードのひとつです。
金銭面において、あなたは「必要なものはちゃんと手に入る」という豊かさの流れの中にいます。派手な大富豪というよりも、「気づいたら困っていない」「なぜかうまく回っている」という静かな豊かさ。
ただ、カップの9には「一人で満足してしまいがち」という側面もあります。お金を貯めることは上手でも、使うこと・循環させることに少し抵抗を感じる場面があるかもしれません。豊かさは流れてこそ、さらに大きくなります。「もったいない」より「循環」を意識すると、この運がさらに活きてきますよ。

【第3ハウス：コミュニケーション・学習・知性】
悪魔（正位置）
思考・言葉・学びのエリアに悪魔が来ました。
「悪魔」と聞いてどきっとした方、安心してください。このカードが第3ハウスにある意味は、「知識への強烈な執着と探究心」です。
あなたは一度興味を持ったことに対して、とことん深掘りせずにはいられない性質を持っています。「なぜ？」「どうして？」という問いが止まらない。周りから「そこまで調べるの？」と驚かれたことはありませんか？
これはあなたの大きな武器です。ただ悪魔の影の部分として、知識や情報に囚われすぎて、頭でっかちになってしまう瞬間があるかもしれません。「完璧に理解してから動こう」と思っているうちに、タイミングを逃してしまった経験はないでしょうか。「知ること」と「動くこと」のバランスが、あなたの人生の鍵のひとつです。

【第4ハウス：家庭・ルーツ・心の基盤】
硬貨の2（逆位置）
家庭環境・心の土台を示すカードです。
硬貨の2の逆位置は、バランスを取ることへの苦労を示します。家庭環境において、「あれもこれも」と抱えすぎる場面があったかもしれません。家族の中で自分が調整役になることが多かった、または物事が安定しない環境の中で育ったという方もいるかもしれません。
でも見方を変えると、不安定な環境の中でバランスを保つ術を身につけてきたということでもあります。この経験があるからこそ、あなたは人の「揺れ」に敏感で、寄り添うことができる。
心の土台を整えるために、今のあなたに必要なのは「自分の居場所」を意識的に作ること。それは物理的な家でも、信頼できる一人の友人でも、静かに過ごせる時間でも構いません。

【第5ハウス：恋愛・創造・喜び】
ソードのペイジ（正位置）
恋愛・楽しみ・自己表現のエリアです。
ソードのペイジは、鋭い観察眼と慎重な判断力を持つ人物。恋愛においてあなたは「好きになる前に、まず相手のことをよく観察する」タイプではないでしょうか。
直感で飛び込むより、「この人は信頼できるのか」「本当に大丈夫か」と慎重に見極めてから動く。そのため、恋愛のスタートがゆっくりになりがちです。
これは臆病なのではなく、あなたが誠実だからです。ただ、慎重になりすぎて「観察期間」が長くなりすぎると、相手に「興味がないのかな」と誤解されてしまうこともあります。ときには、少しだけ先に笑顔を見せてみるのも悪くないかもしれませんよ。

【第6ハウス：仕事・健康・日常】
硬貨のナイト（正位置）
仕事・習慣・体調のカードです。
硬貨のナイトは、コートカードの中でも特に「着実な行動力と現実的な成果」を象徴します。華やかさはなくても、確実に前進する。地道に積み上げた努力が、きちんと評価される流れがあります。
仕事においてあなたは、「言ったことを必ずやり遂げる人」として信頼を得るタイプです。派手なパフォーマンスより、コツコツとした積み重ね。それがあなたの仕事スタイルであり、強みです。
健康面では、この騎士のエネルギーから「動き続けることで調子が整う」体質かもしれません。じっとしているより、体を動かしていた方が気持ちが安定するという方が多いカードです。

【第7ハウス：パートナーシップ・結婚・対人関係】
硬貨の3（正位置）
結婚・重要なパートナーを示すカードです。
硬貨の3は「協力・技術・共同作業」のカード。これが結婚のポジションにあるということ。あなたにとっての理想のパートナーシップは、「お互いの得意なことを持ち寄って、一緒に何かを作り上げていく関係」です。
情熱的なときめきや、運命的な出会いよりも、「この人といると自分が成長できる」「一緒にいて安心できる」という感覚を大切にします。
亢宿×運命数9の読みと見事に一致していますね。あなたのパートナーは、あなたの深い部分を理解してくれる、知性と誠実さを持った方になりそうです。共に何かを育てること。それがあなたの愛の形です。

【第8ハウス：変容・継承・深層心理】
ワンドの2（正位置）
魂の転換点・深い変化のカードです。
ワンドの2は、広い世界を見渡しながら「次はどこへ行こうか」と計画を練る人物のカード。第8ハウスにこれが来ることは、あなたの人生に「大きな転換の選択」が訪れることを示しています。
それは今かもしれないし、少し先かもしれない。でもそのとき、あなたは必ず「もっと広い世界へ踏み出す」という選択肢の前に立ちます。
怖くて当然です。でもワンドの2が示すのは、その選択肢の先にあなたの本当のステージが待っているということ。今の安心できる場所に留まるか、広い地平線へ向かうか。その答えを出す瞬間が、あなたの人生の大きな山場になるでしょう。

【第9ハウス：哲学・高等教育・海外・精神的成長】
ソードの2（正位置）
信念・人生観・精神的な探求のカードです。
ソードの2は、目を閉じて二本の剣を交差させた人物のカード。決断を迫られているのに、まだ動き出せない状態を示します。
精神的な成長の場において、あなたは「どちらの道が正しいのか」という問いに長く向き合ってきたのではないでしょうか。第3ハウスの悪魔と合わせて読むと、知識は十分にある、でも行動に踏み切れないという葛藤が見えてきます。
人生観や信念を固めていく過程で、あなたはきっと何度も「これでいいのだろうか」と立ち止まってきた。でもその慎重さが、あなたの言葉と行動に深みを与えているのです。

【第10ハウス：社会的地位・使命・キャリア】
ソードの3（正位置）
社会における役割・天職のカードです。
ソードの3は「悲しみ・心の痛み・試練」のカードです。これが社会的使命の場所に来ることは、一見ハードに見えますが、あなたの使命は、痛みを知っているからこそ人を救える場所にある、ということです。
自分が傷ついた経験、理不尽さに向き合った経験、深く悲しんだ経験。そのすべてが、あなたが誰かの痛みに寄り添うための魂の資格になっています。
運命数9の「終わりなき慈愛」と、これほど一致するカードはないと感じました。あなたの社会的な役割は、経験から生まれた言葉と共感で、誰かの心を救うことにあるのかもしれません。

【第11ハウス：夢・友人・社会とのつながり】
正義（逆位置）
希望・友人関係・社会参加のカードです。
正義の逆位置は、バランスが取りにくい・不公平さへの不満・自己評価の歪みを示します。
友人関係や社会において、あなたは「こんなはずじゃなかった」という違和感を感じた経験があるのではないでしょうか。「なぜあの人があんな評価を受けるのか」「なぜ誠実に動いても報われないのか」。そういった理不尽さに、人一倍敏感なはずです。
亢宿の「公正を重んじる魂」だからこそ、この逆位置は深く刺さる。でも見方を変えると、公正さを求める目を持っているあなただからこそ、不正に気づけるのです。その感覚は、鈍らせてはいけない大切なものです。

【第12ハウス：潜在意識・隠れた力・試練】
硬貨の5（正位置）
無意識・隠れた恐れ・魂の課題のカードです。
硬貨の5は「物質的な喪失・孤独・経済的な不安」を示すカード。第12ハウスという「隠れた場所」にこれが来ることは、あなたの深層に「失うことへの恐れ」が眠っていることを示しています。
「お金がなくなったら」「一人になったら」「評価されなくなったら」。そういった不安が、意識していなくても行動の判断に影響していることがあるかもしれません。
でもこのカードは同時に、試練を乗り越えた先に真の豊かさがあることも示しています。その恐れを直視したとき、あなたは本当の意味で「足るを知る」魂になれるでしょう。

【隠れたカード・魂全体の統合】
吊るされた男（正位置）
スプレッド全体を統合するカードです。
吊るされた男は、逆さまにぶら下がりながらも、穏やかな表情で悟りの光を放つ人物のカードです。
このカードがスプレッド全体の統合として来たことに、私はとても深いものを感じました。
あなたの人生のテーマは「あえて立ち止まることで見えてくる真実」です。
周りが前へ前へと急ぐ中、あなたは時に立ち止まり、内側を見つめ、違う角度から世界を見てきた。それは遅れているのではありません。あなたにしか見えない景色を、時間をかけて受け取ってきたということです。
吊るされた男は「犠牲と啓示」のカード。何かを手放したとき、何かを諦めたと思ったとき。その瞬間こそが、あなたにとっての最大の気づきになってきたはずです。

【人生全体の統合メッセージ】
亢宿×運命数9×この13枚のカードが、一つの声で語りかけています。
「あなたは傷を知っているから、光を灯せる人間だ」
硬貨の豊かさ、カップの満足、そしてソードの試練。すべてがあなたの中に同居しています。それは矛盾ではなく、深みのある人生を歩むために必要な、すべての色が揃っているということです。
ペイジが多いこのスプレッドは、「まだ学びの途中」ではなく「生涯学び続けることがあなたの喜び」であることを示しています。完成しなくていい。育ち続けることが、あなたの在り方なのです。

【今のあなたへの具体的アドバイス】
「知っていること」を、誰かに話してみてください。
悪魔の知識欲、ソードの分析力、硬貨の着実さ。これだけの力を持ちながら、あなたはまだ「自分の言葉」を外に出しきれていないかもしれません。
ブログでも、友人との会話でも、日記でも。あなたの内側にある深い言葉を、少しずつ世界に手渡していく時期が来ています。

【心理メッセージ】
あなたはずっと、誠実に、真剣に、生きてきました。
傷ついても立ち上がり、疑問を持ちながらも前を向き、誰かのために自分を使い続けてきた。
そのすべてが、無駄ではありませんでした。
吊るされた男が最後に教えてくれることは、「すべての経験には意味があった」ということ。あなたの人生に、無駄なページは一枚もありません。

【引き寄せのアファメーション】
ハクが白い羽根を一枚、そっとあなたの胸元に落としました。
「私は傷も喜びも、すべてを抱きしめながら、自分だけの光を世界に灯し続ける」

フランキンセンスとラベンダーの香りがゆっくりと漂う中、ハクが満足そうに白い羽根をたたみ、静かに目を閉じました。
あなたの人生の地図、少し鮮明になりましたか？`;

function loadProfileForConsultation(): StoredProfile {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { nickname?: unknown; birthdate?: unknown };
    return {
      nickname: typeof parsed.nickname === "string" ? parsed.nickname : "",
      birthdate: typeof parsed.birthdate === "string" ? parsed.birthdate : "",
    };
  } catch {
    return {};
  }
}

export default function ConsultationPage() {
  const [profile] = useState(loadProfileForConsultation);
  const [nickname, setNickname] = useState(profile.nickname ?? "");
  const [birthdate, setBirthdate] = useState(profile.birthdate ?? "");
  const [bloodType, setBloodType] = useState<BloodType>("未回答");
  const [gender, setGender] = useState<Gender>("未回答");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<Category>("恋愛");
  const [content, setContent] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setRequestId(null);

    if (!nickname.trim() || !email.trim() || !content.trim() || !agreed) {
      setError("必須項目を入力し、同意にチェックしてください。");
      return;
    }

    try {
      setSending(true);
      const response = await fetch("/api/reading-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          birthdate: birthdate.trim() || undefined,
          bloodType,
          gender,
          email: email.trim(),
          category,
          content: content.trim(),
          agreed,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; requestId?: string; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "送信に失敗しました。");
      }
      setRequestId(data.requestId ?? null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "送信に失敗しました。");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell
      maxWidth="content"
      title="個人鑑定のご依頼"
      description="いま抱えている悩みや違和感を、そのまま書いてください。"
      backHref="/"
      backLabel="トップへ戻る"
      className="font-serif"
    >
      <GlassCard className="rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <section className="rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(160deg,rgba(255,251,245,0.92),rgba(248,241,229,0.88))] p-4">
            <h2 className="text-base font-medium text-[#2e2a26]">🌙 ルミナに相談する</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#544c42]">
              <p>
                もし今、心の中で答えが見つからず静かに迷っていることがあるなら、その想いをルミナに預けてみてください。
              </p>
              <p>
                白の館で引かれたカードを通して、あなたの心の流れを丁寧に読み解き、言葉としてお届けします。
              </p>
              <p>焦らなくて大丈夫です。光はいつも、あなたの中にあります。</p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e1d5bf]/75 bg-white/65 p-4">
            <h2 className="text-base font-medium text-[#2e2a26]">🌙 こんなご相談が届いています</h2>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_280px] md:items-start">
              <div className="space-y-3 text-sm leading-relaxed text-[#544c42]">
                <p>
                  20代女性
                  <br />
                  付き合っている彼と喧嘩をしてしまい、連絡が途絶えています。
                  <br />
                  仲直りしたいのですが、今どんな言葉をかけるのがよいのでしょうか。
                </p>
                <p>
                  30代女性
                  <br />
                  今の仕事を続けるか、転職するかで迷っています。
                  <br />
                  新しい道へ進むタイミングなのかを知りたいです。
                </p>
                <p>
                  40代女性
                  <br />
                  職場の人間関係に疲れてしまいました。
                  <br />
                  どう接すれば気持ちが楽になるでしょうか。
                </p>
                <p>
                  20代女性
                  <br />
                  これからの人生で、どんな方向に進めばよいのか迷っています。
                  <br />
                  自分に合う流れを知りたいです。
                </p>
                <p>
                  30代男性
                  <br />
                  仕事は順調ですが、このまま今の道を進んでよいのか迷いがあります。
                  <br />
                  これからの人生の流れや、自分に合う選択を知りたいです。
                </p>
                <p>このようなご相談を、ルミナがカードを通して丁寧に読み解きます。</p>
              </div>
              <div className="mx-auto w-full max-w-[280px] rounded-xl border border-[#e1d5bf]/70 bg-white/80 p-2">
                <Image
                  src="/gazou/kanteisyo.png"
                  alt="個人鑑定の鑑定結果イメージ"
                  width={1200}
                  height={1600}
                  className="h-auto w-full rounded-lg"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(160deg,rgba(255,249,241,0.9),rgba(249,240,225,0.86))] p-4">
            <h2 className="text-base font-medium text-[#2e2a26]">🌙 個人鑑定について</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#544c42]">
              <p>
                ご依頼を受け取ってから、通常 2〜3営業日ほどで指定のメールアドレスへ鑑定結果をお届けします。
              </p>
              <p>
                カードからの導きを丁寧に読み解くため、ご相談内容によっては少し詳しくお話を伺うメールをお送りする場合があります。
              </p>
              <p>個人鑑定は 1件 3,000円です。</p>
              <p>ルミナは、あなたの心の流れを静かに読み解き、言葉としてお届けします。</p>
              <p className="text-xs text-[#6f6355]">※ ご相談内容はすべて秘密として大切に扱います。</p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(160deg,rgba(255,249,241,0.9),rgba(249,240,225,0.86))] p-4">
            <h2 className="text-base font-medium text-[#2e2a26]">🌿 白の館の鑑定について</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#544c42]">
              <p>ルミナのカードは、未来を決めるためのものではありません。</p>
              <p>人の心にある光を思い出すための静かな道しるべです。</p>
              <p>そのため次のような内容については、白の館ではお答えしていません。</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>生死に関わること</li>
                <li>子宝の時期</li>
                <li>犯人探しや浮気の特定</li>
                <li>病気の診断</li>
                <li>合否・勝敗・ギャンブルなどの当てもの</li>
              </ul>
              <p>これらはカードの役目を越えるものだからです。</p>
              <p>
                ルミナは未来を決める存在ではなく、あなたが自分の道を見つけるための灯りを渡す存在です。
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e1d5bf]/75 bg-white/70 p-4">
            <h2 className="text-base font-medium text-[#2e2a26]">🌙 タロット鑑定例：20代女性　人生全体を総合的に見てほしい</h2>
            <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
              <div className="mx-auto w-full max-w-[260px] overflow-hidden rounded-xl border border-[#e1d5bf]/70 bg-white/80 p-2">
                <Image
                  src="/gazou/tarotkanteirei.jpg"
                  alt="タロット鑑定例のイメージ"
                  width={900}
                  height={1200}
                  className="h-auto w-full rounded-lg"
                />
              </div>
              <div className="rounded-xl border border-[#e1d5bf]/60 bg-[rgba(255,252,247,0.78)] p-3">
                <p className="max-h-[560px] overflow-y-auto whitespace-pre-line pr-1 text-sm leading-relaxed text-[#544c42]">
                  {`${TAROT_KANTEI_INTRO}\n\n${TAROT_KANTEI_SAMPLE}`}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e1d5bf]/75 bg-white/70 p-4">
            <h2 className="text-base font-medium text-[#2e2a26]">🌙 お客様の声</h2>
            <div className="mt-3 space-y-4 text-sm leading-relaxed text-[#544c42]">
              <div className="rounded-xl border border-[#e1d5bf]/60 bg-[rgba(255,252,247,0.78)] p-3">
                <p className="font-medium text-[#2e2a26]">30代女性 / 恋愛相談</p>
                <p className="mt-2 whitespace-pre-line">
                  {`ルミナさんの鑑定を読んで、
自分の気持ちを落ち着いて見つめ直すことができました。

相手の気持ちを決めつけるのではなく、
自分の心を整える大切さに気づかせてもらえた気がします。

言葉がとても優しくて、
読んだあと少し安心できました。`}
                </p>
              </div>

              <div className="rounded-xl border border-[#e1d5bf]/60 bg-[rgba(255,252,247,0.78)] p-3">
                <p className="font-medium text-[#2e2a26]">20代女性 / 人生相談</p>
                <p className="mt-2 whitespace-pre-line">
                  {`今の仕事を続けるべきか迷っていたのですが、
鑑定の言葉を読んで焦らなくていいんだと思えました。

未来を断定するのではなく、
「今の自分にできること」を教えてもらえた感じです。`}
                </p>
              </div>

              <div className="rounded-xl border border-[#e1d5bf]/60 bg-[rgba(255,252,247,0.78)] p-3">
                <p className="font-medium text-[#2e2a26]">40代女性 / 人間関係</p>
                <p className="mt-2 whitespace-pre-line">
                  {`人間関係で悩んでいたのですが、
カードの意味を丁寧に説明していただき、
気持ちがとても軽くなりました。

文章が温かくて、
何度も読み返しています。`}
                </p>
              </div>
            </div>
          </section>

          <h2 className="pt-1 text-base font-medium text-[#2e2a26]">🌙 個人鑑定を依頼する</h2>

          <label className="block text-sm font-medium text-[#2e2a26]">
            ニックネーム（必須）
            <input
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#2e2a26]">
            連絡用メール（必須）
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              required
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block text-sm font-medium text-[#2e2a26]">
              生年月日
              <input
                type="date"
                value={birthdate}
                onChange={(event) => setBirthdate(event.target.value)}
                className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              />
            </label>

            <label className="block text-sm font-medium text-[#2e2a26]">
              血液型
              <select
                value={bloodType}
                onChange={(event) => setBloodType(event.target.value as BloodType)}
                className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="O">O</option>
                <option value="AB">AB</option>
                <option value="未回答">未回答</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-[#2e2a26]">
              性別
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value as Gender)}
                className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              >
                <option value="男性">男性</option>
                <option value="女性">女性</option>
                <option value="ノンバイナリー">ノンバイナリー</option>
                <option value="未回答">未回答</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-[#2e2a26]">
            相談カテゴリ（必須）
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              required
            >
              <option value="恋愛">恋愛</option>
              <option value="仕事">仕事</option>
              <option value="人間関係">人間関係</option>
              <option value="家庭">家庭</option>
              <option value="健康">健康</option>
              <option value="その他">その他</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-[#2e2a26]">
            ご相談内容（必須）
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="lumina-input mt-2 min-h-36 w-full rounded-xl px-4 py-3 text-base leading-relaxed"
              required
            />
          </label>

          <label className="flex items-start gap-2 text-sm leading-relaxed text-[#544c42]">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[#958cad]"
              required
            />
            注意事項を確認し、内容に同意します。
          </label>

          <LuminaButton type="submit" disabled={sending} className="rounded-xl px-6">
            {sending ? "送信中..." : "依頼する"}
          </LuminaButton>

          {error ? <p className="text-sm text-[#8b5e5e]">{error}</p> : null}
          {requestId ? <p className="text-sm text-[#5f6b52]">受付ID: {requestId}</p> : null}

          <div className="pt-2 text-center">
            <Link href="/" className="text-sm text-[#5f5a78] underline decoration-[#9a92b2] underline-offset-4">
              Topページに戻る
            </Link>
          </div>
        </form>
      </GlassCard>
    </PageShell>
  );
}
