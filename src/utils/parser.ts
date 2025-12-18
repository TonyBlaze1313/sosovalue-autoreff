import fs from "fs";

export function parseAccountsFile(): { email: string; password: string }[] {
  const accounts: { email: string; password: string }[] = [];
  if (fs.existsSync("accounts.txt")) {
    const fileContent = fs.readFileSync("accounts.txt", "utf8");
    const accountBlocks = fileContent.split(
      "==================================================================="
    );

    for (const block of accountBlocks) {
      if (block.trim()) {
        const emailMatch = block.match(/Email Address : (.*)/);
        const passwordMatch = block.match(/Password : (.*)/);

        if (emailMatch && passwordMatch) {
          accounts.push({
            email: emailMatch[1].trim(),
            password: passwordMatch[1].trim(),
          });
        }
      }
    }
  }
  return accounts;
}
