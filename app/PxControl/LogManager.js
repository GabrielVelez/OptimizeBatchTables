'use restrict'
const fs = require("fs");

class LogManager {
  async FileSizeByte(logType) {
    let stats = fs.statSync(`Logs/${logType}1.txt`);
    let size = stats.size;
    return size;
  }

  async logApp(data) {
    await this.begin(data, 'logApp')
  }
  async logDB(data) {
    await this.begin(data, 'logDB')
  }
  async begin(data, logType) {
    let reset = false;
    if (!fs.existsSync('Logs')) {
      fs.mkdirSync('Logs');
    }

    if (fs.existsSync(`Logs/${logType}1.txt`)) {
      if (await this.FileSizeByte(logType) >= 104857600) {
        //100 mb 104857600
        fs.createReadStream(`Logs/${logType}1.txt`).pipe(
          fs.createWriteStream(`Logs/${logType}2.txt`)
        );
        reset = true;
      } else {
        fs.appendFile(`Logs/${logType}.txt`, `\n${data}`, error => {
          if (error) {
            console.log(`Error al agregar datos al archivo: ${error}`);
          }
        });
      }
      if (reset == true) {
        setTimeout(() => {
          fs.writeFile(`Logs/${logType}1.txt`, data, error => {
            if (error) {
              console.log(`Error al rescribir el log: ${error}`);
            }
          });
          reset = false;
        }, 3000);
      }
    } else {
      fs.writeFile(`Logs/${logType}1.txt`, data, error => {
        if (error) {
          console.log(`Error al crear el archivo: ${error}`);
        }
      });
    }
  }
}

module.exports = LogManager