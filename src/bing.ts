import * as cheerio from "cheerio";
import axios from "axios";
import { downloadWordAudio, getWordAudioPath } from "./audio";
import chalk from "chalk";

import playerImport = require("play-sound");
const player = playerImport({});

export default function bingTranslate(word: string) {
  const queryWordUrl = `https://cn.bing.com/dict/search?q=${encodeURI(word)}`;
  axios.get(queryWordUrl).then((response) => {
    const html = response.data;
    const phonetic = parsePhonetic(html);

    console.log("");
    if (phonetic) {
      console.log(
        `${chalk.magenta(`${word}`)}: ${chalk.magenta(`[${phonetic}]`)}`
      );
    }
    parseExplains(html);
    parseForms(html);
    parsePhrase(html);
    console.log("");

    // parse paraphrase(html);

    const audioUrl = parseAudioUrl(html);
    if (audioUrl) {
      const audioPath = getWordAudioPath(word);
      downloadWordAudio(audioUrl, audioPath, () => {
        player.play(audioPath, (err) => {
          if (err) throw err;
        });
      });
    }
  });
}

// parse word pronounce from html
export function parsePhonetic(html: string) {
  const $ = cheerio.load(html);
  let phonetic;
  const pronounceText = $(".hd_p1_1>.hd_prUS").text(); // '美 [ɡʊd]'
  if (pronounceText) {
    phonetic = pronounceText.split("[")[1];
    if (phonetic) {
      phonetic = phonetic.split("]")[0];
    }
  }
  return phonetic;
}

// parse word audio url from html
export function parseAudioUrl(html: string) {
  const $ = cheerio.load(html);

  // onclick = "javascript:BilingualDict.Click(this,'https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/8e/00/8E00A7C3C07F3A1E7B6706E266B8FC3B.mp3','akicon.png',false,'dictionaryvoiceid')"

  const onclick = $(".bigaud").first().attr("onclick");
  let audioUrl;
  if (onclick) {
    audioUrl = onclick.split("'")[1];
  }
  return audioUrl;
}

// parse word expains from html
export function parseExplains(html: string) {
  const $ = cheerio.load(html);
  const data: string[] = [];
  for (const element of $(".qdef>ul>li")) {
    let part = $(element).find(".pos").text();
    if (part === "网络") {
      part = "网络：";
    }
    const meam = $(element).find(".def").text();
    const partMean = `${part} ${meam}`;
    data.push(partMean);
    console.log(`${chalk.green(part)} ${chalk.greenBright(meam)}`);
  }
  if (data.length === 0) {
    console.log(`${chalk.red("emmmm, no explain 😭")}`);
  }
  return data;
}

// parse word forms from html
export function parseForms(html: string) {
  const $ = cheerio.load(html);
  const fomrs = $(".hd_div1>.hd_if").text();
  if (fomrs) {
    console.log(chalk.yellow(fomrs));
  }
  return fomrs;
}

// parse word pharase from html, class="dis, class="se_lis"
export function parsePhrase(html: string) {
  const $ = cheerio.load(html);
  const titles = $(".dis", "#pos_0").map((i, element) => {
    return $(".bil_dis", element).text() + " " + $(".val_dis", element).text();
  });
  const subtitles = $(".se_lis", "#pos_0").map((i, element) => {
    return (
      $(".se_d", element).text() +
      " " +
      $(".bil", element).text() +
      "；" +
      $(".val", element).text()
    );
  });
  for (let i = 0; i < Math.min(titles.length, 3); i++) {
    console.log("");
    console.log(chalk.whiteBright(titles[i]));
    console.log(chalk.white(subtitles[i]));
  }
  return titles.map((i) => {
    `${titles[i]} ${subtitles[i]}`;
  });
}

export function parseParaphrase(html: string) {
  const $ = cheerio.load(html);
  /**
    <meta name="description" content="必应词典为您提供还的释义，拼音[hái] [huán]，adv. also; still; even; yet； v. return; repay; give back； n. a surname； 网络释义： as well; too; in addition； " />

 `美[ɡʊd]，英[ɡʊd]，
  adv. 好； 
  n. 好处；好人；益处；善行； 
  adj. 有好处；好的；优质的；符合标准的； 
  网络释义： 良好；很好；佳；
  `
   */
  const description = $("meta[name=description]");
  if (description.length > 0) {
    const descriptionText = description.attr("content");
    if (descriptionText) {
      const arr = descriptionText.split("，");
      if (arr.shift()) {
        const paraphrase = arr.join("，");
        console.log(chalk.whiteBright(paraphrase));
      }
    }
  }
}
