function normalizeJob(job?: string): string {
  return job?.trim().toLowerCase() ?? "";
}

export function resolveJobSurfaceLabel(job?: string): string {
  const normalized = normalizeJob(job);

  if (!normalized) return "仕事";

  if (/(学生|生徒|受験生|院生|高校生|中学生|小学生|留学生)/.test(normalized)) {
    return "勉強や学び";
  }

  if (/(営業|セールス|販売|接客|カスタマー|受付)/.test(normalized)) {
    return "仕事ややり取り";
  }

  if (/(事務|経理|総務|人事|労務|秘書|アシスタント|庶務)/.test(normalized)) {
    return "仕事や作業";
  }

  if (/(エンジニア|開発|プログラマ|デザイナ|web|マーケ|企画|広報|編集|ライター)/.test(normalized)) {
    return "仕事や作業";
  }

  if (/(看護|介護|保育|医療|福祉|療法)/.test(normalized)) {
    return "日々の役割や仕事";
  }

  return "仕事";
}

export function sanitizeJobSurface(text: string, job?: string): string {
  const trimmedJob = job?.trim();
  if (!trimmedJob) return text;

  return text.split(trimmedJob).join(resolveJobSurfaceLabel(trimmedJob));
}
