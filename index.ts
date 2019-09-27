#! /usr/bin/env node
// tslint:disable:no-console
import chalk from "chalk";
import fs from "fs";
import rimraf from "rimraf";
import util from "util";

const readdir = util.promisify(fs.readdir);
const log = console.log;

const deleteDir = (dir: string): void => {
  log(`${chalk.bgRed.bold.white(" DELETING ")} ${dir}...`);
  rimraf(dir, () => {
    log(`${chalk.bgGreen.bold.white(" DELETED ")} ${dir}.`);
  });
};

const walk = async (
  walkPath: string,
  checkValid: (path: string) => boolean,
  validAction: (path: string) => any,
  done: () => any,
) => {
  try {
    const items: fs.Dirent[] = await readdir(walkPath, { withFileTypes: true });
    const dirs = items.filter((item: fs.Dirent) => item.isDirectory());
    dirs.forEach(async (d: fs.Dirent) => {
      const fullPath = `${walkPath}/${d.name}`;
      const isValid = checkValid(fullPath);
      if (!isValid) {
        await walk(fullPath, checkValid, validAction, done);
        return;
      }
      validAction(fullPath);
    });
  } catch (err) {
    log("Error:", err);
  }
};

const shouldDelete = () => {
  // TODO
};

const main = async () => {
  const path: string = process.argv[2];
  const isValid = (walkedPath: string) => {
    const match = walkedPath.match(/node_modules/g) || [];
    return match.length === 1;
  };
  const onDone = () => process.exit(0);
  const dirsToDelete: string[] = [];

  if (process.argv.length <= 2) {
    console.log(`Usage: clnm path/to/directory`);
    process.exit(-1);
  }

  log("Dirs to delete:\n");
  await walk(
    path,
    isValid,
    (walkedPath: string) => {
      log(walkedPath);
    },
    onDone,
  );

  if (shouldDelete()) {
    await walk(
      path,
      isValid,
      (walkedPath: string) => deleteDir(walkedPath),
      onDone,
    );
  }

};

main();
