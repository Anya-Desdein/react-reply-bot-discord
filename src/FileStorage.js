const fs = require('fs');
const path = require('path');

class FileStorage {

  readFile(dbFolderPath, filename){
    return fs.readFileSync(path.join(dbFolderPath, filename), 'utf8');
  }
}

module.exports = FileStorage;