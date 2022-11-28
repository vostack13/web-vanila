const { readFile } = require("node:fs/promises");
const { resolve, extname } = require("node:path");
const { getFileList } = require("../utils/get-files-list");

const mapContentType = {
  'js': 'application/javascript',
  'css': 'text/css',
  'html': 'text/html',
}

const getContentType = (ext) => mapContentType[ext] || 'text/plain'

const getFile = async (pathFile) => {
  try {
    return readFile(pathFile, { encoding: 'utf8' })
  } catch (error) {
    console.log('DG>>> ', 'error', error);
    return ''
  }
};

const getRoute = async (res, pathFile, contentType) => {
  const data = await getFile(pathFile);

  res.writeHead(200, { "Content-Type": contentType });
  res.end(data);
};

const getRouteNotFound = async (res, url, file) => {
  const ext = extname(url);

  if (ext) {
    res.statusCode = 404;
    res.statusMessage = 'Not Found'
    res.end();
  }

  const contentType = extname(file).slice(1);

  await getRoute(res, file, getContentType(contentType))
}

const getAssetsRoutes = async (config) => {
  const { extentions, path } = config
  const rootPath = resolve(path, '..')

  const assetsFiles = await getFileList(path);

  const assets = assetsFiles
    .reduce((acc, item) => {
      const ext = extname(item).slice(1);

      if (!extentions.includes(ext)) {
        return acc
      }

      const key = item.replace(rootPath, '');

      return {
        ...acc,
        [key]: (res) => getRoute(res, item, getContentType(ext))
      }
    }, {})

  return assets;
}

const getPagesRoutes = async (config) => {
  const { extentions, path } = config;

  const pagesFiles = await getFileList(path);

  const pages = pagesFiles
    .reduce((acc, item) => {
      const ext = extname(item).slice(1);

      if (!extentions.includes(ext)) {
        return acc
      }

      const key = item.replace(path, '').replace(`.${ext}`, '');

      return {
        ...acc,
        [key]: (res) => getRoute(res, item, getContentType(ext))
      }
    }, {})

  pages['/'] = pages['/index'];
  delete pages['/index'];

  return pages
}

const getNotFoundRoutes = async (config) => {
  const { file } = config;

  return { notFound: (res, url) => getRouteNotFound(res, url, file) }
}

const createRouter = async (config) => {
  const assets = await getAssetsRoutes(config.assets);
  const pages = await getPagesRoutes(config.pages);
  const notFound = await getNotFoundRoutes(config.notFound);

  const routes = { ...assets, ...pages, ...notFound};

  const requestHandler = async (req, res) => {
    if (routes[req.url]) {
      await routes[req.url](res);

      return;
    }

    routes.notFound(res, req.url)
  };

  return {
    requestHandler,
  }
}

module.exports = { createRouter }