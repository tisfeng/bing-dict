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
exports.parsePhrase = exports.parseForms = exports.parseExplains = exports.parseAudioUrl = exports.parsePhonetic = exports.parseParaphrase = exports.bingTranslate = void 0;
const cheerio = __importStar(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const audio_1 = require("./audio");
function bingTranslate(word) {
    const queryWordUrl = `https://cn.bing.com/dict/search?q=${encodeURI(word)}`;
    axios_1.default.get(queryWordUrl).then((response) => {
        console.warn(`=================== Bing Translate: ${word} ===================`);
        const html = response.data;
        parsePhonetic(html);
        parseExplains(html);
        parseForms(html);
        parsePhrase(html);
        parseParaphrase(html);
        const audioUrl = parseAudioUrl(html);
        if (audioUrl) {
            const audioPath = (0, audio_1.getWordAudioPath)(word);
            (0, audio_1.downloadWordAudio)(audioUrl, audioPath, () => {
                (0, audio_1.playAudio)(audioPath);
            });
        }
    });
}
exports.bingTranslate = bingTranslate;
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
                console.warn(`Bing Paraphrase: ${paraphrase}`);
            }
        }
    }
}
exports.parseParaphrase = parseParaphrase;
// parse word pronounce from html
function parsePhonetic(html) {
    const $ = cheerio.load(html);
    let phonetic;
    // '美 [ɡʊd]'
    const pronounceText = $(".hd_p1_1>.hd_prUS").text();
    console.warn(`pronounceText: ${pronounceText}`);
    if (pronounceText) {
        phonetic = pronounceText.split("[")[1].split("]")[0];
        console.warn(`phonetic: [${phonetic}]`);
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
    let data = [];
    for (const element of $(".qdef>ul>li")) {
        const part = $(element).find(".pos").text();
        const meam = $(element).find(".def").text();
        const partMean = `${part} ${meam}`;
        data.push(partMean);
        console.warn(partMean);
    }
    return data;
}
exports.parseExplains = parseExplains;
// parse word forms from html
function parseForms(html) {
    const $ = cheerio.load(html);
    const fomrs = $(".hd_div1>.hd_if").text();
    if (fomrs) {
        console.warn(`forms: ${fomrs}`);
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
    if (titles.length) {
        console.log("");
        console.warn(`------------------ phrase ------------------`);
    }
    for (let i = 0; i < titles.length; i++) {
        console.log("\n");
        console.warn(`${titles[i]}`);
        console.warn(`${subtitles[i]}`);
    }
    return titles.map((i, element) => {
        `${titles[i]} ${subtitles[i]}`;
    });
}
exports.parsePhrase = parsePhrase;
//# sourceMappingURL=bing.js.map