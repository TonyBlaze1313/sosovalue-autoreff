import chalk from "chalk";
import fs from "fs";
import { getRandomProxy, loadProxies } from "./classes/proxy";
import { sosoValuRefferal } from "./classes/sosoValue";
import { generatePassword } from "./utils/generate";
import { logMessage, prompt, rl } from "./utils/logger";

async function main(): Promise<void> {
  console.log(
    chalk.cyan(`
░█▀▀░█▀█░█▀▀░█▀█░░░█░█░█▀█░█░░░█░█░█▀▀
░▀▀█░█░█░▀▀█░█░█░░░▀▄▀░█▀█░█░░░█░█░█▀▀
░▀▀▀░▀▀▀░▀▀▀░▀▀▀░░░░▀░░▀░▀░▀▀▀░▀▀▀░▀▀▀
        By : El Puqus Airdrop
        github.com/ahlulmukh
      Use it at your own risk
  `)
  );

  const choice = await prompt(chalk.yellow("Choose an option:\n1. Create new referral accounts\n2. Perform daily check-in for existing accounts\nEnter number: "));

  if (choice === '1') {
    const refCode = await prompt(chalk.yellow("Enter Referral Code: "));
    const count = parseInt(await prompt(chalk.yellow("How many do you want? ")));
    const captchaMethod = await prompt(
      chalk.yellow(`Choose Captcha Method \n1.2Captcha\n2.Puppeteer (Free)\n3.Anti Captcha\nEnter Number: `)
    );
    const proxiesLoaded = loadProxies();
    if (!proxiesLoaded) {
      logMessage(null, null, "No Proxy. Using default IP", "warning");
    }

    const sosoValueaccount = fs.createWriteStream("accounts.txt", { flags: "a" });
    let successful = 0;
    let attempt = 1;

    try {
      while (successful < count) {
        console.log(chalk.white("-".repeat(85)));
        const currentProxy = await getRandomProxy(successful + 1, count);
        const sosoValue = new sosoValuRefferal(refCode, currentProxy, captchaMethod, successful + 1, count);
        try {

          const email = sosoValue.generateTempEmail();
          const password = generatePassword()
          const registered = await sosoValue.registerAccount(email, password.encodedPassword);

          if (registered) {
            sosoValueaccount.write(`Email Address : ${email}\n`);
            sosoValueaccount.write(`Password : ${password.password}\n`);
            sosoValueaccount.write(`Invitation Code : ${registered.invitationCode}\n`);
            sosoValueaccount.write(`===================================================================\n`);

            const token = await sosoValue.login(email, password.encodedPassword);
            if (token) {
              const tasks = await sosoValue.getStarterTasks(token);
              if (tasks) {
                for (const task of tasks) {
                  await sosoValue.claimTaskReward(token, task.id);
                }
              }
            }

            successful++;
            attempt = 1;
          } else {
            logMessage(
              successful + 1,
              count,
              "Register Account Failed, retrying...",
              "error"
            );
            attempt++;
          }
        } catch (error) {
          logMessage(
            successful + 1,
            count,
            `Error: ${(error as Error).message}, retrying...`,
            "error"
          );
          attempt++;
        }
      }
    } finally {
      sosoValueaccount.end();
      console.log(chalk.magenta("\n[*] Finished!"));
      console.log(
        chalk.green(`[*] Successfully created ${successful} of ${count} accounts`)
      );
      console.log(chalk.magenta("[*] Result in accounts.txt"));
      rl.close();
    }
  } else if (choice === '2') {
    await performRefsDailyChecking();
    rl.close();
  } else {
    console.log(chalk.red("Invalid choice. Please enter 1 or 2."));
    rl.close();
  }
}

import { parseAccountsFile } from "./utils/parser";

async function performRefsDailyChecking() {
  const accounts = parseAccountsFile();
  if (accounts.length === 0) {
    logMessage(null, null, "No accounts found in accounts.txt", "warning");
    return;
  }

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    console.log(chalk.white("-".repeat(85)));
    const sosoValue = new sosoValuRefferal("", null, "1", i + 1, accounts.length);
    const token = await sosoValue.login(account.email, account.password);
    if (token) {
      await sosoValue.performDailyCheckin(token);
    }
  }
}

main().catch((err) => {
  console.error(chalk.red("Error occurred:"), err);
  process.exit(1);
});