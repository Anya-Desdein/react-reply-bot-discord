const Bot = require('./src/Bot');
let configPath = "config";
// print process.argv 2
if (process.argv.length > 2) {
  configPath = process.argv[2];
}  

const botInstance = new Bot();
botInstance.startBot(configPath);