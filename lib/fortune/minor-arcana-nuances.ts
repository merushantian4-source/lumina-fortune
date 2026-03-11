/**
 * 小アルカナ全カードの固有ニュアンス辞書
 * プロンプト生成時に該当カードのニュアンスだけを注入する
 */

export type MinorArcanaNuance = {
  /** 中心テーマ */
  themes: string[];
  /** 使いたい語彙 */
  vocabulary: string[];
  /** 今日の流れに出しやすいこと */
  flowHints: string[];
  /** アドバイスに向く行動 */
  adviceHints: string[];
  /** 避けたいズレ */
  avoidance: string[];
  /** 逆位置の傾向（省略時はスート共通を使う） */
  reversedHint?: string;
};

type SuitReversedDefaults = {
  tendency: string[];
};

const SUIT_REVERSED: Record<string, SuitReversedDefaults> = {
  wands: {
    tendency: [
      "情熱の空回り",
      "勢いの乱れ",
      "動きたいのに進みにくい",
      "急ぎすぎ / 熱が散る",
    ],
  },
  cups: {
    tendency: [
      "感情の滞り",
      "受け取りにくさ",
      "気持ちの揺れ",
      "関係性のずれ",
      "心が閉じやすい / こぼれやすい",
    ],
  },
  swords: {
    tendency: [
      "考えすぎ",
      "判断ミス",
      "言葉のこじれ",
      "混乱",
      "切り分けにくさ",
      "緊張の内向き化",
    ],
  },
  pentacles: {
    tendency: [
      "管理の乱れ",
      "土台の不安定さ",
      "積み重ね不足",
      "現実面の詰まり",
      "お金 / 生活 / 実務の偏り",
    ],
  },
};

// ---------------------------------------------------------------------------
// ワンド 1〜10
// ---------------------------------------------------------------------------

const WAND_ACE: MinorArcanaNuance = {
  themes: ["火がつく始まり", "着火", "ひらめき", "行動のきっかけ"],
  vocabulary: ["火がつく", "ひらめく", "やる気が湧く", "動き始める", "はじまる"],
  flowHints: ["新しい気持ちで始めやすい", "まず着手するのに向く", "意欲が流れを作る"],
  adviceHints: ["まず一歩動く", "思いついたことをメモする", "最初の着手だけ済ませる"],
  avoidance: ["停滞前提", "慎重すぎて何もしない文"],
};

const WAND_2: MinorArcanaNuance = {
  themes: ["視野を広げる", "次の計画", "可能性を見る", "一歩先を考える"],
  vocabulary: ["見渡す", "次を考える", "広げる", "視野", "先の景色"],
  flowHints: ["目先だけでなく先を見る日", "計画や見通しを立てやすい", "次の一手を考えるのに向く"],
  adviceHints: ["先の予定を一つ決める", "目標を見直す", "今後の選択肢を並べる"],
  avoidance: ["目の前だけの細かい話で終わること"],
};

const WAND_3: MinorArcanaNuance = {
  themes: ["広がり", "展開", "連携", "見通しが開く"],
  vocabulary: ["広がる", "先が見える", "連なる", "展開", "見晴らし"],
  flowHints: ["話が先へ進みやすい", "協力や共有で広がる", "見通しが立ちやすい"],
  adviceHints: ["情報を共有する", "一人で抱えない", "次の段階を見据える"],
  avoidance: ["閉じた印象", "孤立だけを強調する文"],
};

const WAND_4: MinorArcanaNuance = {
  themes: ["安心", "小さな達成", "落ち着く場所", "喜びを分かち合う"],
  vocabulary: ["落ち着く", "祝う", "ひと息つく", "安心感", "居場所"],
  flowHints: ["安心できる場が力になる", "頑張ったことを認めやすい", "小さな達成を感じやすい"],
  adviceHints: ["一度区切る", "できたことを数える", "心地よい場所を整える"],
  avoidance: ["緊張感だけで終わること"],
};

const WAND_5: MinorArcanaNuance = {
  themes: ["ぶつかり合い", "競り合い", "熱が散る", "まとまりきらない勢い"],
  vocabulary: ["ぶつかる", "競る", "熱が散る", "まとまりにくい", "主張が強い"],
  flowHints: ["意見や気持ちがぶつかりやすい", "熱量はあるが散りやすい", "小競り合いから気づくことがある"],
  adviceHints: ["言い返す前に一度整える", "勝ち負けにしない", "論点を一つに絞る"],
  avoidance: ["平穏無風すぎる文"],
};

const WAND_6: MinorArcanaNuance = {
  themes: ["前進の手応え", "認められる", "追い風", "一歩抜ける"],
  vocabulary: ["追い風", "手応え", "認められる", "前に出る", "進展"],
  flowHints: ["努力が見えやすい", "評価や反応を受け取りやすい", "自信を持って進みやすい"],
  adviceHints: ["遠慮しすぎない", "成果を表に出す", "背筋を伸ばして進む"],
  avoidance: ["自信ゼロの後ろ向き文"],
};

const WAND_7: MinorArcanaNuance = {
  themes: ["守りながら立つ", "踏ん張る", "自分の立場を守る", "簡単に譲らない"],
  vocabulary: ["踏ん張る", "守る", "立場を保つ", "簡単に崩れない", "張る"],
  flowHints: ["引かない強さが必要", "周囲に流されすぎないほうがいい", "自分の考えを守る場面がある"],
  adviceHints: ["必要な境界線を引く", "安易に譲りすぎない", "自分の軸を確認する"],
  avoidance: ["全面受容だけの文"],
};

const WAND_8: MinorArcanaNuance = {
  themes: ["速い展開", "一気に進む", "連絡", "流れが加速する"],
  vocabulary: ["一気に動く", "速まる", "飛ぶ", "連なる", "加速"],
  flowHints: ["話が早く進みやすい", "連絡や変化が来やすい", "迷うより動いたほうが流れに乗りやすい"],
  adviceHints: ["返事を溜めない", "早めに着手する", "流れが来たら受け取る"],
  avoidance: ["ゆっくり停滞文だけで終わること"],
  reversedHint: "連絡や進展のずれ / 加速の乱れ",
};

const WAND_9: MinorArcanaNuance = {
  themes: ["警戒", "備える", "ここまでの疲れ", "でもまだ立っている"],
  vocabulary: ["警戒", "備える", "疲れ", "守る", "まだ立てる"],
  flowHints: ["気を張りやすい", "すぐには安心しきれない", "慎重さが悪くない日", "疲れの自覚も大事"],
  adviceHints: ["無理を足さない", "先に備えを整える", "休みながら進める"],
  avoidance: ["全力前進だけを勧めること"],
};

const WAND_10: MinorArcanaNuance = {
  themes: ["背負いすぎ", "重さ", "責任の集中", "抱え込み"],
  vocabulary: ["背負う", "重い", "抱え込む", "手いっぱい", "持ちすぎる"],
  flowHints: ["役目を背負いすぎやすい", "一人で持ちすぎると苦しくなる", "減らす発想が大事"],
  adviceHints: ["一つ手放す", "頼れるところに頼る", "優先順位を削る"],
  avoidance: ["さらに頑張れと煽る文"],
};

// ---------------------------------------------------------------------------
// カップ 1〜10
// ---------------------------------------------------------------------------

const CUP_ACE: MinorArcanaNuance = {
  themes: ["心が満ちる始まり", "やさしい流入", "愛情", "感情がひらく"],
  vocabulary: ["満ちる", "ひらく", "やさしさ", "受け取る", "潤う"],
  flowHints: ["気持ちがやわらぎやすい", "優しさを受け取りやすい", "心の流れが動きやすい"],
  adviceHints: ["ありがとうを伝える", "気持ちを受け取る", "やさしい時間を作る"],
  avoidance: ["冷たく切るだけの文"],
};

const CUP_2: MinorArcanaNuance = {
  themes: ["向き合う", "通じ合う", "ふたりの間の共鳴", "心の一致"],
  vocabulary: ["向き合う", "通じる", "寄り合う", "心が重なる", "距離が縮まる"],
  flowHints: ["一対一の関係が大事", "気持ちが通いやすい", "対話から関係が深まりやすい"],
  adviceHints: ["ひとこと素直に返す", "二人の時間を大切にする", "相手の目線に立つ"],
  avoidance: ["孤立文", "感情無視の合理論"],
};

const CUP_3: MinorArcanaNuance = {
  themes: ["喜びを分かち合う", "仲間", "祝福", "明るい交流"],
  vocabulary: ["分かち合う", "喜び", "仲間", "ほぐれる", "明るい空気"],
  flowHints: ["人との交流で気分が明るくなる", "一人で抱えないほうがいい", "軽やかな会話が運ぶ"],
  adviceHints: ["誰かと話す", "小さな楽しみを共有する", "笑える時間を作る"],
  avoidance: ["孤独感一辺倒"],
};

const CUP_4: MinorArcanaNuance = {
  themes: ["閉じた心", "物足りなさ", "受け取りにくさ", "目の前を見過ごす"],
  vocabulary: ["閉じる", "受け取りにくい", "ぼんやりする", "心が止まる", "見過ごす"],
  flowHints: ["気持ちが内向きになりやすい", "目の前のやさしさを受け取りにくい", "少し反応を返すと空気が変わる"],
  adviceHints: ["小さな誘いに応じる", "気持ちを閉じすぎない", "ひとつ受け取る"],
  avoidance: ["華やかさだけで押す文"],
  reversedHint: "閉じていた心が少しほどける / 受け取り直す流れ",
};

const CUP_5: MinorArcanaNuance = {
  themes: ["喪失感", "こぼれたものに目が向く", "悔しさ", "まだ残っているもの"],
  vocabulary: ["こぼれる", "失う", "目が向きすぎる", "残っている", "振り返る"],
  flowHints: ["足りないものに意識が寄りやすい", "気落ちしやすい", "でも全部が失われたわけではない"],
  adviceHints: ["失ったものだけ見ない", "残っている支えを数える", "気持ちを責めすぎない"],
  avoidance: ["無理なポジティブ押し"],
};

const CUP_6: MinorArcanaNuance = {
  themes: ["懐かしさ", "やさしい記憶", "素直さ", "過去からのぬくもり"],
  vocabulary: ["懐かしい", "やさしい記憶", "素直", "あたたかい", "ふと戻る"],
  flowHints: ["過去から気持ちがほどけやすい", "素直な反応が助けになる", "やさしい関係に目が向きやすい"],
  adviceHints: ["素直な気持ちを思い出す", "昔のよさを取り戻す", "やわらかく接する"],
  avoidance: ["冷酷すぎる文"],
};

const CUP_7: MinorArcanaNuance = {
  themes: ["想像", "迷い", "選べない", "心が散る", "夢見がち"],
  vocabulary: ["迷う", "ふくらむ", "夢を見る", "散る", "選びきれない"],
  flowHints: ["可能性が多く見えやすい", "気持ちが散りやすい", "理想がふくらみやすい", "現実とのすり合わせが必要"],
  adviceHints: ["選択肢を減らす", "一つに絞る", "理想と現実を並べる"],
  avoidance: ["明快すぎる断定だけの文"],
};

const CUP_8: MinorArcanaNuance = {
  themes: ["離れる", "見切りをつける", "心が次へ向かう", "もう満たされない場所を離れる"],
  vocabulary: ["離れる", "背を向ける", "次へ向かう", "見切る", "置いていく"],
  flowHints: ["心が今までの場所から離れやすい", "もう十分なものを見極める", "無理に留まらなくてよい"],
  adviceHints: ["合わないものから少し離れる", "区切りをつける", "未練だけで留まらない"],
  avoidance: ["何でも抱え続ける文"],
};

const CUP_9: MinorArcanaNuance = {
  themes: ["満足", "心の充足", "願いがかなう感覚", "満ち足りる"],
  vocabulary: ["満たされる", "満足", "うれしい", "ほっとする", "かなう"],
  flowHints: ["小さな満足を感じやすい", "願いが形になりやすい", "受け取り上手でいたい日"],
  adviceHints: ["うれしいことを素直に受け取る", "満足した点を認める", "ほしいものをはっきりさせる"],
  avoidance: ["欠乏感だけを強調"],
};

const CUP_10: MinorArcanaNuance = {
  themes: ["心の完成", "関係の調和", "あたたかな満ち足り", "安心できるつながり"],
  vocabulary: ["調和", "あたたかい", "満ちる", "安心", "つながり"],
  flowHints: ["人とのつながりに安心が生まれやすい", "心の安定を感じやすい", "身近な関係が支えになる"],
  adviceHints: ["近しい人を大切にする", "感謝を伝える", "安心できる場を整える"],
  avoidance: ["孤独一辺倒", "冷たすぎる文"],
};

// ---------------------------------------------------------------------------
// ソード 1〜10
// ---------------------------------------------------------------------------

const SWORD_ACE: MinorArcanaNuance = {
  themes: ["明快な気づき", "判断", "切り分け", "言葉の力"],
  vocabulary: ["はっきりする", "切り分ける", "見抜く", "言葉にする", "明確"],
  flowHints: ["頭が冴えやすい", "判断がつきやすい", "言葉が流れを切り開く"],
  adviceHints: ["結論を一つ出す", "必要なことを言葉にする", "曖昧さを減らす"],
  avoidance: ["ぼかし続ける文"],
};

const SWORD_2: MinorArcanaNuance = {
  themes: ["保留", "迷い", "決めきれない", "見ないふり", "静かな緊張"],
  vocabulary: ["保留", "迷う", "揺れる", "決めきれない", "動かない"],
  flowHints: ["すぐには決めにくい", "気持ちと判断が止まりやすい", "無理に切らなくてもよいが放置しすぎにも注意"],
  adviceHints: ["判断材料を増やす", "期限を決める", "迷いを紙に書く"],
  avoidance: ["即断即決だけを強要"],
  reversedHint: "保留の限界 / 決める流れが近づく",
};

const SWORD_3: MinorArcanaNuance = {
  themes: ["痛み", "刺さる言葉", "すれ違い", "心の傷", "切り分けの苦しさ"],
  vocabulary: ["刺さる", "痛む", "すれ違う", "割り切れない", "傷つく"],
  flowHints: ["言葉が強く響きやすい", "すれ違いに敏感になりやすい", "痛みを無視しないほうが整う"],
  adviceHints: ["刺さったことを抱え込みすぎない", "きつい言葉を増やさない", "一呼吸おいて受け止める"],
  avoidance: ["平気なふりだけを勧めること"],
};

const SWORD_4: MinorArcanaNuance = {
  themes: ["休息", "思考停止ではなく静養", "立て直し", "頭を休める"],
  vocabulary: ["休む", "静かに整える", "ひと息", "回復", "頭を休める"],
  flowHints: ["無理に動かないほうが整う", "考えすぎを休ませたい", "充電の時間が大事"],
  adviceHints: ["一度手を止める", "休憩を後回しにしない", "情報を減らす"],
  avoidance: ["無理に攻める文"],
};

const SWORD_5: MinorArcanaNuance = {
  themes: ["勝ち負け", "後味の悪さ", "言い負かす", "無理な取り方"],
  vocabulary: ["勝ち負け", "後味", "引き際", "きつい", "取りすぎる"],
  flowHints: ["言いすぎや意地が出やすい", "正しさだけで押すと荒れやすい", "何を守りたいか見直したい"],
  adviceHints: ["勝つことより整うことを選ぶ", "引く判断を持つ", "言い負かさない"],
  avoidance: ["攻撃的な成功論"],
};

const SWORD_6: MinorArcanaNuance = {
  themes: ["移行", "離脱", "少しずつ静まる", "荒れた場所を抜ける"],
  vocabulary: ["移る", "抜ける", "静まる", "少しずつ離れる", "落ち着く"],
  flowHints: ["荒れた気持ちが落ち着きやすい", "今までの場所から離れる流れ", "一気にではなく徐々に整う"],
  adviceHints: ["距離を取る", "環境を少し変える", "落ち着くほうへ移す"],
  avoidance: ["激しい対立を煽る文"],
};

const SWORD_7: MinorArcanaNuance = {
  themes: ["ずらす", "本音を隠す", "立ち回り", "正面から行きにくい"],
  vocabulary: ["ずらす", "隠す", "立ち回る", "表に出さない", "抜け道"],
  flowHints: ["正面突破しにくい", "本音を出しづらい", "立ち回りに意識が向きやすい", "誤魔化しすぎには注意"],
  adviceHints: ["隠しごとを増やしすぎない", "必要な線だけ守る", "本音を少し整理する"],
  avoidance: ["ただの悪人扱い", "道徳断罪だけにすること"],
};

const SWORD_8: MinorArcanaNuance = {
  themes: ["身動きのしづらさ", "思考の縛り", "自分で狭めている感じ", "出口はある"],
  vocabulary: ["縛られる", "身動きしづらい", "狭い", "思い込み", "出口を探す"],
  flowHints: ["考えが固まりやすい", "自由がないように感じやすい", "でも見方を変える余地はある"],
  adviceHints: ["条件を一つ疑ってみる", "助けを借りる", "できることを一つ確認する"],
  avoidance: ["完全絶望", "逃げ場ゼロの言い方"],
};

const SWORD_9: MinorArcanaNuance = {
  themes: ["不安", "夜の思考", "心配しすぎ", "頭の中で膨らむ苦しさ"],
  vocabulary: ["不安", "考えすぎる", "夜に重くなる", "心配", "膨らむ"],
  flowHints: ["心配が大きくなりやすい", "頭の中で繰り返しやすい", "事実以上に重く感じやすい"],
  adviceHints: ["夜に考え込みすぎない", "不安を紙に出す", "眠る前の情報を減らす"],
  avoidance: ["さらに不安を煽ること"],
};

const SWORD_10: MinorArcanaNuance = {
  themes: ["行き止まり", "限界", "終わり", "これ以上は無理という地点", "そこからの切り替え"],
  vocabulary: ["限界", "終わる", "行き止まり", "ここまで", "切り替える"],
  flowHints: ["無理を続けるほうが苦しい", "終える判断が必要", "底まで見たからこそ切り替えやすい"],
  adviceHints: ["続けない判断をする", "ひとつ終わらせる", "限界を認める"],
  avoidance: ["絶望だけで終えること"],
};

// ---------------------------------------------------------------------------
// ペンタクル 1〜10
// ---------------------------------------------------------------------------

const PENTACLE_ACE: MinorArcanaNuance = {
  themes: ["現実の種", "具体的な始まり", "受け取れる形", "土台づくり"],
  vocabulary: ["種", "手元に来る", "形になる", "土台", "現実的"],
  flowHints: ["小さな現実のチャンスがある", "形にしやすい", "手堅く始めるのに向く"],
  adviceHints: ["小さく始める", "必要なものを整える", "手元の資源を使う"],
  avoidance: ["抽象論だけで終えること"],
};

const PENTACLE_2: MinorArcanaNuance = {
  themes: ["やりくり", "両立", "軽やかな調整", "配分の工夫"],
  vocabulary: ["やりくり", "配分", "両立", "回す", "調整する"],
  flowHints: ["複数のことを回しやすい", "配分の見直しが大事", "軽く調整しながら進める日"],
  adviceHints: ["優先順位を並べる", "詰め込みすぎを減らす", "予定を調整する"],
  avoidance: ["一点突破だけを勧めること"],
};

const PENTACLE_3: MinorArcanaNuance = {
  themes: ["技術", "協力", "丁寧な積み上げ", "評価される仕事"],
  vocabulary: ["丁寧に作る", "技術", "協力", "仕上げる", "評価"],
  flowHints: ["コツコツ進めるほどよい", "協力で質が上がりやすい", "技術や手間が活きやすい"],
  adviceHints: ["手を抜かず整える", "相談しながら進める", "細部まで確認する"],
  avoidance: ["雑な勢い重視"],
};

const PENTACLE_4: MinorArcanaNuance = {
  themes: ["守る", "固める", "手放しにくさ", "安定への執着"],
  vocabulary: ["守る", "固める", "握る", "離しにくい", "安全圏"],
  flowHints: ["守りに入りやすい", "手放しにくい", "安定を優先したくなる", "閉じすぎには注意"],
  adviceHints: ["何を守りたいか確かめる", "固めすぎを見直す", "少しだけ余白を作る"],
  avoidance: ["浪費や冒険ばかり勧めること"],
  reversedHint: "固めすぎをゆるめる / 手放しの必要",
};

const PENTACLE_5: MinorArcanaNuance = {
  themes: ["足りなさ", "心細さ", "支えの不足感", "でも助けはある"],
  vocabulary: ["心細い", "足りない", "冷える", "支えがほしい", "助けを求める"],
  flowHints: ["不足感を感じやすい", "一人で抱えると寒くなりやすい", "助けを受け取る意識が大事"],
  adviceHints: ["早めに相談する", "無理を隠さない", "支えを探す"],
  avoidance: ["根性論だけで押すこと"],
};

const PENTACLE_6: MinorArcanaNuance = {
  themes: ["受け渡し", "分かち合い", "助け合い", "与える / 受け取るの循環"],
  vocabulary: ["受け取る", "分け合う", "循環", "手を差し伸べる", "巡る"],
  flowHints: ["助け合いが活きやすい", "与える側にも受け取る側にもなりやすい", "バランスのよい循環が起きやすい"],
  adviceHints: ["遠慮しすぎず受け取る", "必要な助けを差し出す", "一方通行を見直す"],
  avoidance: ["閉じた孤立文"],
  reversedHint: "与えすぎ / 受け取りすぎ / 循環の偏り",
};

const PENTACLE_7: MinorArcanaNuance = {
  themes: ["様子を見る", "成果待ち", "積み重ねの途中", "まだ収穫前"],
  vocabulary: ["育つ途中", "見守る", "様子を見る", "待つ", "途中経過"],
  flowHints: ["すぐの結果は出にくい", "積み重ねを信じたい日", "手応えを見直すのに向く"],
  adviceHints: ["焦って掘り返さない", "途中経過を確認する", "次の一手を整える"],
  avoidance: ["即結果だけを煽ること"],
};

const PENTACLE_8: MinorArcanaNuance = {
  themes: ["反復", "鍛える", "手をかける", "丁寧な習熟", "地道さ"],
  vocabulary: ["磨く", "反復する", "鍛える", "地道", "丁寧に続ける"],
  flowHints: ["コツコツ積む力が活きる", "繰り返しが質につながる", "地味でも手をかけたい日"],
  adviceHints: ["反復する", "基本を丁寧にやる", "手順を整える"],
  avoidance: ["一発逆転だけを求めること"],
};

const PENTACLE_9: MinorArcanaNuance = {
  themes: ["自立", "実り", "自分で築いた安心", "上質な満足"],
  vocabulary: ["実る", "自立", "余裕", "上質", "落ち着いた満足"],
  flowHints: ["自分で整えたものが支えになる", "落ち着いた満足を感じやすい", "無理に群れなくてもよい"],
  adviceHints: ["自分のペースを守る", "積み上げを認める", "心地よい選択をする"],
  avoidance: ["依存前提の文"],
};

const PENTACLE_10: MinorArcanaNuance = {
  themes: ["長く続く豊かさ", "家 / 基盤", "受け継ぐもの", "安定の完成形"],
  vocabulary: ["根づく", "安定", "長く続く", "基盤", "受け継ぐ"],
  flowHints: ["生活基盤に意識が向きやすい", "長い目で整えるのに向く", "身近な安心が力になる"],
  adviceHints: ["土台を整える", "家や生活を見直す", "長く続く選択をする"],
  avoidance: ["刹那的な勢いだけの文"],
};

// ---------------------------------------------------------------------------
// コートカード
// ---------------------------------------------------------------------------

const WAND_PAGE: MinorArcanaNuance = {
  themes: ["まっすぐな意欲", "好奇心", "若い火", "試したい気持ち"],
  vocabulary: ["わくわく", "試したい", "まっすぐ", "好奇心", "火がつく"],
  flowHints: ["新しいことに目が向きやすい", "好奇心が動きを作る"],
  adviceHints: ["気になったことを試す", "興味に素直になる"],
  avoidance: ["退屈・停滞だけの文"],
};

const WAND_KNIGHT: MinorArcanaNuance = {
  themes: ["勢い", "突進", "情熱的前進", "熱の強さ"],
  vocabulary: ["一気に進む", "勢い", "突き進む", "熱くなる"],
  flowHints: ["勢いに乗りやすい", "一気に進む力が出る"],
  adviceHints: ["動けるうちに動く", "勢いを一つに絞る"],
  avoidance: ["無謀さの美化"],
};

const WAND_QUEEN: MinorArcanaNuance = {
  themes: ["あたたかな自信", "魅力", "明るい主導", "堂々とした熱"],
  vocabulary: ["堂々と", "あたたかい", "魅力", "自信", "明るい熱"],
  flowHints: ["自分の魅力が活きやすい", "明るく導く力が出る"],
  adviceHints: ["自分のよさを隠さない", "明るく受け答えする"],
  avoidance: ["自信ゼロの文"],
};

const WAND_KING: MinorArcanaNuance = {
  themes: ["大きな意志", "ビジョン", "熱を導く", "指揮する力"],
  vocabulary: ["導く", "意志", "大きく見る", "任せる", "主導する"],
  flowHints: ["全体を見る力が活きる", "ビジョンを示すのに向く"],
  adviceHints: ["全体像を決める", "熱量をまとめる"],
  avoidance: ["細かいことだけの文"],
};

const CUP_PAGE: MinorArcanaNuance = {
  themes: ["素直な感受性", "やわらかな気持ち", "心の小さな便り", "かわいい本音"],
  vocabulary: ["素直", "やわらかい", "小さな気持ち", "心の便り", "受け取る"],
  flowHints: ["素直な気持ちが動きやすい", "小さな感情に気づきやすい"],
  adviceHints: ["素直に返す", "気持ちを小さく伝える"],
  avoidance: ["感情を無視する文"],
};

const CUP_KNIGHT: MinorArcanaNuance = {
  themes: ["ロマン", "想いを届ける", "やさしい前進", "感情を運ぶ"],
  vocabulary: ["想いを運ぶ", "やさしく近づく", "ときめき", "心を向ける"],
  flowHints: ["気持ちを伝えやすい", "やさしい接近が起きやすい"],
  adviceHints: ["気持ちを丁寧に伝える", "やわらかく近づく"],
  avoidance: ["冷たい合理文"],
};

const CUP_QUEEN: MinorArcanaNuance = {
  themes: ["深い受容", "共感", "感情の奥行き", "静かなやさしさ"],
  vocabulary: ["受け止める", "深い", "共感", "やわらかく包む", "静かな心"],
  flowHints: ["共感力が活きやすい", "深く受け止める力がある"],
  adviceHints: ["感じたことを否定しない", "やさしく聞く"],
  avoidance: ["感情を切り捨てる文"],
};

const CUP_KING: MinorArcanaNuance = {
  themes: ["感情の安定", "包容力", "揺れても落ち着ける", "心を整えて導く"],
  vocabulary: ["落ち着く", "包む", "安定した感情", "穏やか", "大人のやさしさ"],
  flowHints: ["感情的にぶれにくい", "落ち着いた対応が力になる"],
  adviceHints: ["感情的に返しすぎない", "落ち着いて受け止める"],
  avoidance: ["感情爆発だけの文"],
};

const SWORD_PAGE: MinorArcanaNuance = {
  themes: ["敏感な知性", "察知", "情報感度", "まだ落ち着かない頭"],
  vocabulary: ["敏感", "察する", "気づく", "すばやい頭", "張る"],
  flowHints: ["情報に敏感になりやすい", "気づきが多い日"],
  adviceHints: ["気になったことを確認する", "早合点しすぎない"],
  avoidance: ["鈍感だけの文"],
};

const SWORD_KNIGHT: MinorArcanaNuance = {
  themes: ["速い判断", "切り込む", "強い言葉", "まっすぐすぎる進み方"],
  vocabulary: ["切り込む", "一気に言う", "速い", "鋭い", "真っ直ぐ"],
  flowHints: ["判断が速くなりやすい", "言葉に力が出る"],
  adviceHints: ["速さを少しゆるめる", "言葉を選んで伝える"],
  avoidance: ["攻撃性の美化"],
};

const SWORD_QUEEN: MinorArcanaNuance = {
  themes: ["冴えた判断", "距離感", "率直さ", "感情に流されない知性"],
  vocabulary: ["冴える", "見極める", "率直", "ぶれない", "距離を保つ"],
  flowHints: ["判断が冴えやすい", "距離感が活きる日"],
  adviceHints: ["事実で見る", "線を明確にする"],
  avoidance: ["感情だけの文"],
};

const SWORD_KING: MinorArcanaNuance = {
  themes: ["論理的統率", "高い判断力", "ルール", "ぶれない決断"],
  vocabulary: ["判断する", "論理", "統率", "ぶれない", "厳正"],
  flowHints: ["論理的に整えやすい", "決断の力が出る"],
  adviceHints: ["条件を整理する", "判断軸を明確にする"],
  avoidance: ["感情論だけの文"],
};

const PENTACLE_PAGE: MinorArcanaNuance = {
  themes: ["学び始める現実感", "まじめな着手", "手堅い好奇心", "小さな種"],
  vocabulary: ["まじめに始める", "小さな種", "学ぶ", "手堅い", "育てる"],
  flowHints: ["地道な着手に向く", "学びのきっかけがある"],
  adviceHints: ["小さく学び始める", "基本を確認する"],
  avoidance: ["抽象論だけの文"],
};

const PENTACLE_KNIGHT: MinorArcanaNuance = {
  themes: ["着実", "ぶれない継続", "遅くても進む", "実務力"],
  vocabulary: ["着実", "一歩ずつ", "堅実", "続ける", "ぶれない"],
  flowHints: ["着実に進みやすい", "地道な継続が活きる"],
  adviceHints: ["今日やる分を淡々と進める", "速度より継続を選ぶ"],
  avoidance: ["一発逆転だけの文"],
};

const PENTACLE_QUEEN: MinorArcanaNuance = {
  themes: ["生活を整える豊かさ", "手元の安心", "世話する力", "現実的なやさしさ"],
  vocabulary: ["整える", "手元を満たす", "安心", "世話する", "現実的な豊かさ"],
  flowHints: ["生活まわりを整えやすい", "身近な安心が力になる"],
  adviceHints: ["生活まわりを整える", "必要なものを丁寧に選ぶ"],
  avoidance: ["抽象的な精神論だけの文"],
};

const PENTACLE_KING: MinorArcanaNuance = {
  themes: ["安定した実力", "豊かさの管理", "信頼できる土台", "長期的な現実力"],
  vocabulary: ["安定", "管理", "実力", "信頼", "長く続く豊かさ"],
  flowHints: ["現実面を整えやすい", "管理力が活きる日"],
  adviceHints: ["現実面を堅実に整える", "管理と見直しをする"],
  avoidance: ["夢見がちな文"],
};

// ---------------------------------------------------------------------------
// カード名 → ニュアンスのマッピング
// ---------------------------------------------------------------------------

type CardEntry = {
  keywords: string[];
  nuance: MinorArcanaNuance;
  suit: string;
};

const CARD_MAP: CardEntry[] = [
  // ワンド
  { keywords: ["ワンドのエース", "ワンド エース", "ワンド 1", "ワンドの1"], nuance: WAND_ACE, suit: "wands" },
  { keywords: ["ワンドの2", "ワンド 2"], nuance: WAND_2, suit: "wands" },
  { keywords: ["ワンドの3", "ワンド 3"], nuance: WAND_3, suit: "wands" },
  { keywords: ["ワンドの4", "ワンド 4"], nuance: WAND_4, suit: "wands" },
  { keywords: ["ワンドの5", "ワンド 5"], nuance: WAND_5, suit: "wands" },
  { keywords: ["ワンドの6", "ワンド 6"], nuance: WAND_6, suit: "wands" },
  { keywords: ["ワンドの7", "ワンド 7"], nuance: WAND_7, suit: "wands" },
  { keywords: ["ワンドの8", "ワンド 8"], nuance: WAND_8, suit: "wands" },
  { keywords: ["ワンドの9", "ワンド 9"], nuance: WAND_9, suit: "wands" },
  { keywords: ["ワンドの10", "ワンド 10"], nuance: WAND_10, suit: "wands" },
  { keywords: ["ワンドのペイジ", "ワンド ペイジ"], nuance: WAND_PAGE, suit: "wands" },
  { keywords: ["ワンドのナイト", "ワンド ナイト"], nuance: WAND_KNIGHT, suit: "wands" },
  { keywords: ["ワンドのクイーン", "ワンド クイーン"], nuance: WAND_QUEEN, suit: "wands" },
  { keywords: ["ワンドのキング", "ワンド キング"], nuance: WAND_KING, suit: "wands" },
  // カップ
  { keywords: ["カップのエース", "カップ エース", "カップ 1", "カップの1"], nuance: CUP_ACE, suit: "cups" },
  { keywords: ["カップの2", "カップ 2"], nuance: CUP_2, suit: "cups" },
  { keywords: ["カップの3", "カップ 3"], nuance: CUP_3, suit: "cups" },
  { keywords: ["カップの4", "カップ 4"], nuance: CUP_4, suit: "cups" },
  { keywords: ["カップの5", "カップ 5"], nuance: CUP_5, suit: "cups" },
  { keywords: ["カップの6", "カップ 6"], nuance: CUP_6, suit: "cups" },
  { keywords: ["カップの7", "カップ 7"], nuance: CUP_7, suit: "cups" },
  { keywords: ["カップの8", "カップ 8"], nuance: CUP_8, suit: "cups" },
  { keywords: ["カップの9", "カップ 9"], nuance: CUP_9, suit: "cups" },
  { keywords: ["カップの10", "カップ 10"], nuance: CUP_10, suit: "cups" },
  { keywords: ["カップのペイジ", "カップ ペイジ"], nuance: CUP_PAGE, suit: "cups" },
  { keywords: ["カップのナイト", "カップ ナイト"], nuance: CUP_KNIGHT, suit: "cups" },
  { keywords: ["カップのクイーン", "カップ クイーン"], nuance: CUP_QUEEN, suit: "cups" },
  { keywords: ["カップのキング", "カップ キング"], nuance: CUP_KING, suit: "cups" },
  // ソード
  { keywords: ["ソードのエース", "ソード エース", "ソード 1", "ソードの1"], nuance: SWORD_ACE, suit: "swords" },
  { keywords: ["ソードの2", "ソード 2"], nuance: SWORD_2, suit: "swords" },
  { keywords: ["ソードの3", "ソード 3"], nuance: SWORD_3, suit: "swords" },
  { keywords: ["ソードの4", "ソード 4"], nuance: SWORD_4, suit: "swords" },
  { keywords: ["ソードの5", "ソード 5"], nuance: SWORD_5, suit: "swords" },
  { keywords: ["ソードの6", "ソード 6"], nuance: SWORD_6, suit: "swords" },
  { keywords: ["ソードの7", "ソード 7"], nuance: SWORD_7, suit: "swords" },
  { keywords: ["ソードの8", "ソード 8"], nuance: SWORD_8, suit: "swords" },
  { keywords: ["ソードの9", "ソード 9"], nuance: SWORD_9, suit: "swords" },
  { keywords: ["ソードの10", "ソード 10"], nuance: SWORD_10, suit: "swords" },
  { keywords: ["ソードのペイジ", "ソード ペイジ"], nuance: SWORD_PAGE, suit: "swords" },
  { keywords: ["ソードのナイト", "ソード ナイト"], nuance: SWORD_KNIGHT, suit: "swords" },
  { keywords: ["ソードのクイーン", "ソード クイーン"], nuance: SWORD_QUEEN, suit: "swords" },
  { keywords: ["ソードのキング", "ソード キング"], nuance: SWORD_KING, suit: "swords" },
  // ペンタクル
  { keywords: ["ペンタクルのエース", "ペンタクル エース", "ペンタクル 1", "ペンタクルの1"], nuance: PENTACLE_ACE, suit: "pentacles" },
  { keywords: ["ペンタクルの2", "ペンタクル 2"], nuance: PENTACLE_2, suit: "pentacles" },
  { keywords: ["ペンタクルの3", "ペンタクル 3"], nuance: PENTACLE_3, suit: "pentacles" },
  { keywords: ["ペンタクルの4", "ペンタクル 4"], nuance: PENTACLE_4, suit: "pentacles" },
  { keywords: ["ペンタクルの5", "ペンタクル 5"], nuance: PENTACLE_5, suit: "pentacles" },
  { keywords: ["ペンタクルの6", "ペンタクル 6"], nuance: PENTACLE_6, suit: "pentacles" },
  { keywords: ["ペンタクルの7", "ペンタクル 7"], nuance: PENTACLE_7, suit: "pentacles" },
  { keywords: ["ペンタクルの8", "ペンタクル 8"], nuance: PENTACLE_8, suit: "pentacles" },
  { keywords: ["ペンタクルの9", "ペンタクル 9"], nuance: PENTACLE_9, suit: "pentacles" },
  { keywords: ["ペンタクルの10", "ペンタクル 10"], nuance: PENTACLE_10, suit: "pentacles" },
  { keywords: ["ペンタクルのペイジ", "ペンタクル ペイジ"], nuance: PENTACLE_PAGE, suit: "pentacles" },
  { keywords: ["ペンタクルのナイト", "ペンタクル ナイト"], nuance: PENTACLE_KNIGHT, suit: "pentacles" },
  { keywords: ["ペンタクルのクイーン", "ペンタクル クイーン"], nuance: PENTACLE_QUEEN, suit: "pentacles" },
  { keywords: ["ペンタクルのキング", "ペンタクル キング"], nuance: PENTACLE_KING, suit: "pentacles" },
];

export type ResolvedMinorNuance = {
  nuance: MinorArcanaNuance;
  suit: string;
  suitReversed: string[];
};

/**
 * カード名から小アルカナのニュアンスを引く。
 * 大アルカナやマッチしない場合は null を返す。
 */
export function resolveMinorArcanaNuance(cardName?: string): ResolvedMinorNuance | null {
  if (!cardName) return null;
  for (const entry of CARD_MAP) {
    if (entry.keywords.some((kw) => cardName.includes(kw))) {
      return {
        nuance: entry.nuance,
        suit: entry.suit,
        suitReversed: SUIT_REVERSED[entry.suit]?.tendency ?? [],
      };
    }
  }
  return null;
}
