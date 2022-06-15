#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bing_1 = require("./bing");
// console.log("hello,", process.argv[2]);
const word = process.argv[2];
if (word.trim().length) {
    (0, bing_1.bingTranslate)(word);
}
else {
    console.error("word is empty");
}
//# sourceMappingURL=bing-cli.js.map