import fs from 'fs';
import fsPromises from 'fs/promises';
import config from './config.js';
import { join, extname } from 'path';
const {
  dir: {
    publicDirectory
  }
} = config;

export class Service {
  createFileStream(filename) {
    return fs.createReadStream(filename);
  }

  async getFileInfo(file) {
    // ex: file = home/index.js 
    const fullFilePath = join(publicDirectory, file);

    //valida se existe, se não existe estoura um erro!!
    await fsPromises.access(fullFilePath);

    // recupera a extensão do arquivo 
    const fileType = extname(fullFilePath);

    return {
      type: fileType,
      name: fullFilePath,
    }
  }

  async getFileStream(file) {
    const { type, name } = await this.getFileInfo(file);

    return {
      stream: this.createFileStream(name),
      type
    }
  }
}