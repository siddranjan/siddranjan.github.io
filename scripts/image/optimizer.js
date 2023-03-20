const sharp = require("sharp");
const glob = require("glob");
const path = require("path");
const fs = require("fs");

async function createDirectory(directoryPath) {
  const newDirPath = path.dirname(directoryPath);
  if (!fs.existsSync(newDirPath)) {
    await fs.promises.mkdir(newDirPath, { recursive: true });
  }
}

function compressImages(dir, size) {
  const imagePaths = glob.sync("public/original/images/**/*.{jpg,jpeg,png}");
  return Promise.all(
    imagePaths.map(async (path) => {
      const optimizedImageBuffer = await sharp(path)
        .resize({ width: size })
        .toBuffer();
      const newPathArr = path.split("/");
      newPathArr.splice(1, 1);
      newPathArr.splice(2, 0, dir);
      const newPath = newPathArr.join("/");

      await createDirectory(newPath);

      await sharp(optimizedImageBuffer)
        .toFile(newPath)
        .catch((err) => console.error(err));
    })
  );
}

async function execute(params) {
  // script code
  await compressImages("thumbs", 1024);
  await compressImages("full", 2048);
  console.log("All images optimized!");
}
module.exports = execute;
