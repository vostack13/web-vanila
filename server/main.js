const { createServer } = require("node:http");
const { resolve } = require("node:path");
const { buildingProject } = require("./project-builder");
const { createRouter } = require("./router");

const rootPath = resolve(__dirname, `..`)
const assetsPath = resolve(rootPath, `assets`)
const pagesPath = resolve(rootPath, `pages`)
const notFound = resolve(rootPath, `pages/404.html`)

const configRouter = {
  pages: {
    extentions: ['html'],
    path: pagesPath
  },
  assets: {
    extentions: ['css', 'js'],
    path: assetsPath
  },
  notFound: { file: notFound }
}

const listenerHandler = async () => {
  console.log("server started on 8020 port");
}

const start = async ({ port }) => {
  await buildingProject();
  const router = await createRouter(configRouter)
  const server = createServer(router.requestHandler);
  server.listen(port, listenerHandler);
}

start({ port: 8020 })