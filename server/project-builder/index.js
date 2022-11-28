const { resolve } = require('node:path');

const rootPath = resolve(__dirname, '../..');

const buildingProject = async () => {
  console.log('Project building...');

  console.log('Project build success.');
}

module.exports = { buildingProject }