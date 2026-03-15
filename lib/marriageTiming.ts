import { getThreeYearWindow, destinyNumberFromBirthdate, personalYearNumberFromBirthdate } from "./numerology";
import type { FortuneNumber } from "./fortune/types";
import {
  marriageDestinyTemplates,
  marriageYearTemplates,
  type MarriageYearTemplate,
} from "./marriageTimingTemplate";
import { buildMarriageTimingFrame, type InterpretationFrame } from "@/lib/ai/interpretation-frame";

export type MarriageTimingYearReading = {
  year: number;
  label: "今年" | "来年" | "再来年";
  personalYear: FortuneNumber;
  title: string;
  badge: string;
  body: string;
};

export type MarriageTimingReading = {
  destinyNumber: FortuneNumber;
  baseYear: number;
  intro: string;
  tendency: string;
  flowSummary: string;
  years: MarriageTimingYearReading[];
  signs: string[];
  advice: string[];
  closing: string;
  freePreview: {
    headline: string;
    summary: string;
  };
  interpretationFrame: InterpretationFrame;
};

function relativeLabel(index: number): MarriageTimingYearReading["label"] {
  if (index === 0) return "今年";
  if (index === 1) return "来年";
  return "再来年";
}

function badgeFromTemplate(template: MarriageYearTemplate) {
  switch (template.emphasis) {
    case "main":
      return "婚期の本命年";
    case "growth":
      return "ご縁が育つ年";
    case "seed":
      return "流れが動く年";
    case "grounding":
      return "土台を整える年";
    case "change":
      return "揺らぎの中で選ぶ年";
    case "closure":
      return "節目を迎える年";
  }
}

function chooseHeadline(years: MarriageTimingYearReading[]) {
  const mainYear = years.find((year) => year.personalYear === 6);
  if (mainYear) {
    return `${mainYear.label}は、愛が形になりやすい大切な節目です。`;
  }

  const practicalYear = years.find((year) => year.personalYear === 8);
  if (practicalYear) {
    return `${practicalYear.label}は、未来設計が現実に寄りやすい婚期候補です。`;
  }

  const growthYear = years.find((year) => year.personalYear === 2);
  if (growthYear) {
    return `${growthYear.label}は、ご縁を育てることが結婚への近道になります。`;
  }

  return `${years[0]?.label ?? "今年"}から3年は、愛の流れを整え直す大切な期間です。`;
}

function buildFlowSummary(years: MarriageTimingYearReading[]) {
  const [first, second, third] = years;
  return `${first.label}は${marriageYearTemplates[first.personalYear].focus}${second.label}は${marriageYearTemplates[second.personalYear].focus}${third.label}は${marriageYearTemplates[third.personalYear].focus}この3年は、ばらばらの出来事ではなく、愛の種が芽吹き、信頼を深め、形へ向かっていく流れとして読むとしっくりきます。`;
}

function buildYearBody(template: MarriageYearTemplate, nextTemplate?: MarriageYearTemplate) {
  const closing = nextTemplate ? template.transition : "この年の終わりには、あなたが望む愛の形が今よりずっと明るく見えやすくなるでしょう。";
  return `${template.focus}${template.flow}${closing}`;
}

export function getMarriageTimingReading(
  birthdate: string,
  baseYear = new Date().getFullYear(),
): MarriageTimingReading {
  const destinyNumber = destinyNumberFromBirthdate(birthdate);
  const destinyTemplate = marriageDestinyTemplates[destinyNumber];
  const years = getThreeYearWindow(baseYear).map((year, index, windowYears) => {
    const personalYear = personalYearNumberFromBirthdate(birthdate, year);
    const template = marriageYearTemplates[personalYear];
    const nextTemplate =
      index < windowYears.length - 1
        ? marriageYearTemplates[
            personalYearNumberFromBirthdate(birthdate, windowYears[index + 1] as number)
          ]
        : undefined;

    return {
      year,
      label: relativeLabel(index),
      personalYear,
      title: template.title,
      badge: badgeFromTemplate(template),
      body: buildYearBody(template, nextTemplate),
    } satisfies MarriageTimingYearReading;
  });

  return {
    destinyNumber,
    baseYear,
    intro: destinyTemplate.intro,
    tendency: destinyTemplate.tendency,
    flowSummary: buildFlowSummary(years),
    years,
    signs: destinyTemplate.signs,
    advice: destinyTemplate.advice,
    closing: destinyTemplate.closing,
    freePreview: {
      headline: chooseHeadline(years),
      summary: `${years[0].label}から${years[2].label}にかけて、${years.map((year) => year.badge).join("、")}が順に巡ります。`,
    },
    interpretationFrame: buildMarriageTimingFrame(
      destinyNumber,
      years.map((y) => y.personalYear),
    ),
  };
}
