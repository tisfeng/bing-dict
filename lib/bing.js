"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseParaphrase = exports.parsePhrase = exports.parseForms = exports.parseExplains = exports.parseAudioUrl = exports.parsePhonetic = void 0;
const cheerio = __importStar(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const audio_1 = require("./audio");
const chalk_1 = __importDefault(require("chalk"));
const playerImport = require("play-sound");
const player = playerImport({});
function bingTranslate(word) {
    const queryWordUrl = `https://cn.bing.com/dict/search?q=${encodeURI(word)}`;
    axios_1.default.get(queryWordUrl).then((response) => {
        const html = response.data;
        const phonetic = parsePhonetic(html);
        console.log("");
        if (phonetic) {
            console.log(`${chalk_1.default.magenta(`${word}`)}: ${chalk_1.default.magenta(`[${phonetic}]`)}`);
        }
        parseExplains(html);
        parseForms(html);
        parsePhrase(html);
        console.log("");
        // parse paraphrase(html);
        const audioUrl = parseAudioUrl(html);
        if (audioUrl) {
            const audioPath = (0, audio_1.getWordAudioPath)(word);
            (0, audio_1.downloadWordAudio)(audioUrl, audioPath, () => {
                player.play(audioPath, (err) => {
                    if (err)
                        throw err;
                });
            });
        }
    });
}
exports.default = bingTranslate;
// parse word pronounce from html
function parsePhonetic(html) {
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
exports.parsePhonetic = parsePhonetic;
// parse word audio url from html
function parseAudioUrl(html) {
    const $ = cheerio.load(html);
    // onclick = "javascript:BilingualDict.Click(this,'https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/8e/00/8E00A7C3C07F3A1E7B6706E266B8FC3B.mp3','akicon.png',false,'dictionaryvoiceid')"
    const onclick = $(".bigaud").first().attr("onclick");
    let audioUrl;
    if (onclick) {
        audioUrl = onclick.split("'")[1];
    }
    return audioUrl;
}
exports.parseAudioUrl = parseAudioUrl;
// parse word expains from html
function parseExplains(html) {
    const $ = cheerio.load(html);
    const data = [];
    for (const element of $(".qdef>ul>li")) {
        let part = $(element).find(".pos").text();
        if (part === "网络") {
            part = "网络：";
        }
        const meam = $(element).find(".def").text();
        const partMean = `${part} ${meam}`;
        data.push(partMean);
        console.log(`${chalk_1.default.green(part)} ${chalk_1.default.greenBright(meam)}`);
    }
    if (data.length === 0) {
        console.log(`${chalk_1.default.red("emmmm, no explain 😭")}`);
    }
    return data;
}
exports.parseExplains = parseExplains;
// parse word forms from html
function parseForms(html) {
    const $ = cheerio.load(html);
    const fomrs = $(".hd_div1>.hd_if").text();
    if (fomrs) {
        console.log(chalk_1.default.yellow(fomrs));
    }
    return fomrs;
}
exports.parseForms = parseForms;
// parse word pharase from html, class="dis, class="se_lis"
function parsePhrase(html) {
    const $ = cheerio.load(html);
    const titles = $(".dis", "#pos_0").map((i, element) => {
        return $(".bil_dis", element).text() + " " + $(".val_dis", element).text();
    });
    const subtitles = $(".se_lis", "#pos_0").map((i, element) => {
        return ($(".se_d", element).text() +
            " " +
            $(".bil", element).text() +
            "；" +
            $(".val", element).text());
    });
    for (let i = 0; i < Math.min(titles.length, 3); i++) {
        console.log("");
        console.log(chalk_1.default.whiteBright(titles[i]));
        console.log(chalk_1.default.white(subtitles[i]));
    }
    return titles.map((i) => {
        `${titles[i]} ${subtitles[i]}`;
    });
}
exports.parsePhrase = parsePhrase;
function parseParaphrase(html) {
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
                console.log(chalk_1.default.whiteBright(paraphrase));
            }
        }
    }
}
exports.parseParaphrase = parseParaphrase;
//# sourceMappingURL=bing.js.map