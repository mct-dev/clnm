import chalk from "chalk";
import { Dirent, readdir, stat } from "fs";
import inquirer from "inquirer";
import { join } from "path";
import rimraf from "rimraf";
import { promisify } from "util";

export class Clnm {

  private readdirP = promisify(readdir);
  private rimrafP = promisify(rimraf);
  // private statP = promisify(stat);

  public async rreaddir(path: string, nodeDirs: string[] = []): Promise<string[]> {
    const files: string[] = (await this.readdirP(path, { withFileTypes: true }))
      .filter((file: Dirent) => file.isDirectory())
      .map((file: Dirent) => join(path, file.name));

    nodeDirs.push(...files.filter((f: string) => this.checkValid(f)));

    await Promise.all(
      files.map(
        async (f: string) => {
          return this.rreaddir(f, nodeDirs);
        },
      ),
    );

    return nodeDirs;
  }

  public async deleteDirs(dirs: string[]): Promise<string[]> {

    try {
      await Promise.all(
        dirs.map(async (d: string) => {
          await this.rimrafP(d);
        }),
      );
    } catch (err) {
      console.log(err);
    }

    return dirs;
  }

  private checkValid(fullPath: string): boolean {
    const endMatch = fullPath.match(/node_modules$/g) || [];
    const otherMatch = fullPath.match(/node_modules/g) || [];
    return endMatch.length === 1 && otherMatch.length === 1;
  }

}
