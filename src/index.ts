#!/usr/bin/env node

import { bingTranslate } from "./bing";

// console.log("hello,", process.argv[2]);

const word = process.argv[2];
if (word.trim().length) {
  bingTranslate(word);
} else {
  console.error("word is empty");
}
