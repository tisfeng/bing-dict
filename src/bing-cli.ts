#!/usr/bin/env node

import { bingTranslate } from "./bing";

const word = process.argv[2];
if (word.trim().length) {
  bingTranslate(word);
} else {
  console.error("word is empty");
}
