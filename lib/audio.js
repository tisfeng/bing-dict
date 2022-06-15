"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWordAudioPath = exports.downloadWordAudio = exports.playAudio = void 0;
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let audioDirPath = path_1.default.resolve(__dirname, "../audio");
// console.log(`audioDirPath:`, audioDirPath);
function playAudio(audioPath) {
    // console.log(`play audio: ${audioPath}`);
    if (!fs_1.default.existsSync(audioPath)) {
        console.error(`audio file not exists: ${audioPath}`);
        return;
    }
    (0, child_process_1.execFile)("afplay", [audioPath], (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
        }
        console.log(stdout);
    });
}
exports.playAudio = playAudio;
function downloadWordAudio(url, audioPath, callback) {
    if (fs_1.default.existsSync(audioPath)) {
        // console.log(`audio file already exists: ${audioPath}`);
        callback && callback();
        return;
    }
    // console.log(`download url audio: ${url}`);
    (0, axios_1.default)({
        method: "get",
        url: url,
        responseType: "stream",
    })
        .then((response) => {
        response.data.pipe(fs_1.default
            .createWriteStream(audioPath)
            .on("close", callback ? callback : () => { }));
    })
        .catch((error) => {
        console.error(error);
    });
}
exports.downloadWordAudio = downloadWordAudio;
// function: get audio file name, if audio directory is empty, create it
function getWordAudioPath(word) {
    if (!fs_1.default.existsSync(audioDirPath)) {
        // console.log(`create directory: ${audioDirPath}`);
        fs_1.default.mkdirSync(`${audioDirPath}`);
    }
    return `${audioDirPath}/${word}.mp3`;
}
exports.getWordAudioPath = getWordAudioPath;
//# sourceMappingURL=audio.js.map