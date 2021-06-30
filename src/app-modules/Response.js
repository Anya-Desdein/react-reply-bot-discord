const fs = require('fs');
const EventEmitter = require('events');
const path = require('path');

class Response extends EventEmitter {
  constructor(startConfig, dirname, dbFolderPath, fileStorageInstance, client) {
    super();
    this.startConfig = startConfig;
    this.dirname = dirname;
    this.startDbFolderPath = dbFolderPath;
    this.fileStorageInstance = fileStorageInstance;
    this.combinations;
    this.reactsOn = false;
    this.repliesOn = false;
  }
  readStart(){
    if(this.startConfig){
      if(this.startConfig["reactHow"]) {
        this.reactsOn = true;
      }
      if(this.startConfig["replyHow"]) {
        this.repliesOn = true;
      }
      this.getResponseCombinations();
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
    this.combinations = this.fileStorageInstance.readFile(this.startDbFolderPath,"Response_Combinations.json");
    // console.log(this.combinations);

  }
};

module.exports = Response;