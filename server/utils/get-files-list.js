const { readdir } = require('node:fs/promises');

const getFileList = async (dirName) => {
  let files = [];
  const items = await readdir(dirName, { withFileTypes: true });

  for await (const item of items) {
      if (item.isDirectory()) {
          files = [...files, ...await getFileList(`${dirName}/${item.name}`)];
      } else {
          files.push(`${dirName}/${item.name}`);
      }
  }

  return files;
};

module.exports = { getFileList }