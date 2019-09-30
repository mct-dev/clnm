#! /usr/bin/env node
// tslint:disable:no-console
import chalk from "chalk";
import inquirer from "inquirer";
import rimraf from "rimraf";
import { Clnm } from "./Clnm";

const path: string = process.argv[2];
const log = console.log;

const deleteDirs = (dirs: string[]): void => {
  dirs.forEach((dir: string) => {
    rimraf(dir, () => {
      log(`${chalk.bgRed.bold.white(" DELETED ")} ${dir}.`);
    });
  });
};

const main = async () => {

  const clnm = new Clnm();
  clnm.rreaddir(path)
    .then((dirs: string[]) => {
      if (dirs.length < 1) {
        log(chalk.cyan.bold(`\nNo 'node_modules' directories found under '${path}'. You're all clean!`));
        log(chalk.grey("Exiting..."));
        process.exit(0);
      }
      log(`${chalk.underline.cyanBright.bold("\nDirectories to be deleted:")}`);
      dirs.forEach((dir: string) => log(dir));
      log("");

      inquirer.prompt([
        {
          choices: ["Yes", "No"],
          filter: (val: string) => val.toLowerCase(),
          message: "Do you want to delete these directories?",
          name: "shouldDelete",
          type: "list",
        },
      ])
        .then((responses) => responses.shouldDelete === "yes" ? deleteDirs(dirs) : process.exit(0));
    });
};

if (process.argv.length <= 2) {
  console.log(`Usage: clnm path/to/directory`);
  process.exit(-1);
}

main();
