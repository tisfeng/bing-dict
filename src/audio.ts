import axios from "axios";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";

let audioDirPath = path.resolve(__dirname, "../audio");
// console.log(`audioDirPath:`, audioDirPath);

export function playAudio(audioPath: string) {
  console.log(`audioPath: ${audioDirPath}`);
  console.log(`play audio: ${audioPath}`);
  if (!fs.existsSync(audioPath)) {
    console.error(`audio file not exists: ${audioPath}`);
    return;
  }
  execFile("afplay", [audioPath], (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
    }
    console.log(stdout);
  });
}

export function downloadWordAudio(
  url: string,
  audioPath: string,
  callback?: () => void
) {
  if (fs.existsSync(audioPath)) {
    console.log(`audio file already exists: ${audioPath}`);
    callback && callback();
    return;
  }

  console.log(`download url audio: ${url}`);
  axios({
    method: "get",
    url: url,
    responseType: "stream",
  })
    .then((response) => {
      response.data.pipe(
        fs
          .createWriteStream(audioPath)
          .on("close", callback ? callback : () => {})
      );
    })
    .catch((error) => {
      console.error(error);
    });
}

// function: get audio file name, if audio directory is empty, create it
export function getWordAudioPath(word: string) {
  if (!fs.existsSync(audioDirPath)) {
    console.log(`create directory: ${audioDirPath}`);
    fs.mkdirSync(`${audioDirPath}`);
  }
  return `${audioDirPath}/${word}.mp3`;
}
