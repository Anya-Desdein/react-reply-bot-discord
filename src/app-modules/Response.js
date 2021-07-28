const fs = require('fs');
const path = require('path');
const BaseModule = require('./BaseModule');

class Response extends BaseModule {
  constructor(dirname, dbFolderPath, fileStorageInstance) {
    super();
    this.dirname = dirname;
    this.startDbFolderPath = dbFolderPath;
    this.fileStorageInstance = fileStorageInstance;
    this.combinations = null;

    this.getResponseCombinations();
  }

  readStart() {
    if(this.startConfig){
      if(this.startConfig["reactHow"]) {
        this.reactsOn = true;
      }
      if(this.startConfig["replyHow"]) {
        this.repliesOn = true;
      }
    }
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  } 

  randomizeResponse(data) {
    if(data) {
      return data[Math.floor(Math.random()*data.length)];
    }
  }

  getResponseCombinations(){
    this.combinations = this.fileStorageInstance.readFile(this.startDbFolderPath, "Response_Combinations.json");
    console.log(this.combinations);
  }
};

module.exports = Response;