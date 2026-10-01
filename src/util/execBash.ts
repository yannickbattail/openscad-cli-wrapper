import chalk from "chalk";
import { Executor } from "../types/IOpenScad.js";
import { spawn } from "node:child_process";

export function createFctExecCommand(quietMode: boolean, showCommand = false): Executor {
  return async (command: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> => {
    return (
      (await execCommand(
        command,
        {
          allowFailure: false,
          quietMode: quietMode,
        },
        showCommand,
      )) ?? ""
    );
  };
}

/**
 * Executes a shell command synchronously and provides options for customization.
 *
 * @param command - The shell command to execute.
 * @param options - Optional configuration for the command execution.
 * @param options.cwd - The working directory to execute the command in. Defaults to the current working directory.
 * @param options.allowFailure - If true, suppresses errors and allows the command to fail without throwing. Defaults to false.
 * @param options.quietMode - If true and `stdio` is set to 'pipe', suppresses the output of the command. Defaults to false.
 * @param showCommand log the command being executed to the console. Defaults to false.
 * @returns The output of the command as a string if `stdio` is set to 'pipe', otherwise undefined.
 * @throws An error if the command fails and `allowFailure` is set to false.
 */
export async function execCommand(
  command: string[],
  {
    cwd,
    allowFailure = false,
    quietMode = false,
  }: {
    cwd?: string;
    allowFailure?: boolean;
    quietMode?: boolean;
  } = {},
  showCommand = false,
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  try {
    if (showCommand) {
      console.log(chalk.blue(`$ ${command.join(" ")}`));
    }
    const proc = await spawnAsync(command, !quietMode, cwd);
    if (proc.code !== 0) {
      if (allowFailure) {
        console.warn(chalk.yellow(`Command exits with code ${proc.code}`), proc);
      } else {
        throw new Error(`Command exits with code: ${proc.code} stdout: ${proc.stdout} stderr: ${proc.stderr}`);
      }
    }
    return proc;
  } catch (e) {
    if (allowFailure) {
      console.warn(chalk.yellow(e && typeof e === "object" && "message" in e ? e.message : e));
      return { code: null, stderr: "", stdout: "" };
    }
    throw e;
  }
}

function spawnAsync(
  command: string[],
  streamOutput: boolean,
  cwd?: string,
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const p = spawn(command[0], command.slice(1), { cwd: cwd });
    let stdout = "";
    let stderr = "";
    if (streamOutput) {
      p.stdout.on("data", (x) => {
        stdout += x.toString();
        process.stdout.write(x.toString());
      });
      p.stderr.on("data", (x) => {
        stderr += x.toString();
        process.stderr.write(x.toString());
      });
    } else {
      p.stdout.on("data", (x) => {
        stdout += x.toString();
      });
      p.stderr.on("data", (x) => {
        stderr += x.toString();
      });
    }
    p.on("exit", (code) => {
      if (code === 0) {
        resolve({ code, stdout, stderr });
      } else {
        reject({ code, stdout, stderr });
      }
    });
  });
}
