#! /usr/bin/env node
// tslint:disable:no-console
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
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
  const findingDirsSpinner = ora("Finding directories...");
  let targetDirs;
  let userAnswer;

  findingDirsSpinner.spinner = "earth";
  findingDirsSpinner.start();
  targetDirs = await clnm.rreaddir(path);
  findingDirsSpinner.stop();
  if (targetDirs.length < 1) {
    log(chalk.cyan.bold(`\nNo 'node_modules' directories found under '${path}'. You're all clean!`));
    log(chalk.grey("Exiting..."));
    process.exit(0);
  }
  log(`${chalk.underline.cyanBright.bold("\nDirectories to be deleted:")}`);
  targetDirs.forEach((dir: string) => log(dir));
  log("");

  userAnswer = await inquirer.prompt([
    {
      choices: ["Yes", "No"],
      filter: (val: string) => val.toLowerCase(),
      message: "Do you want to delete these directories?",
      name: "shouldDelete",
      type: "list",
    },
  ]);
  if (userAnswer.shouldDelete === "yes" ) {
    deleteDirs(targetDirs);
  } else {
    log(chalk.grey("Exiting..."));
    process.exit(0);
  }
};

if (process.argv.length <= 2) {
  console.log(`Usage: clnm path/to/directory`);
  process.exit(-1);
}

main();
