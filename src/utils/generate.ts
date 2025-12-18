export class EmailGenerator {
    private baseEmail: string;

    constructor(baseEmail: string) {
      this.baseEmail = baseEmail;
    }
    generatePlusVariations() {
      const [username, domain] = this.baseEmail.split("@");
      const randomString = Math.random().toString(36).substring(2, 8);
      return `${username}+${randomString}@${domain}`;
    }

    generateDotVariations() {
      const [username, domain] = this.baseEmail.split("@");
      if (username.length < 2) {
        return this.baseEmail;
      }
      let newUsername = "";
      for (let i = 0; i < username.length; i++) {
        newUsername += username[i];
        if (i < username.length - 1 && Math.random() < 0.5) {
          newUsername += ".";
        }
      }
      return `${newUsername.replace(/\.+/g, ".")}@${domain}`;
    }

    generateRandomVariation() {
      if (Math.random() < 0.5) {
        return this.generatePlusVariations();
      } else {
        return this.generateDotVariations();
      }
    }
  }

export function generatePassword() {
  const firstLetter = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
  const otherLetters = Array.from({ length: 4 }, () =>
    String.fromCharCode(Math.floor(Math.random() * 26) + 97)
  ).join("");
  const numbers = Array.from({ length: 3 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  const password = `${firstLetter}${otherLetters}@${numbers}!`;
  const encodedPassword = Buffer.from(password).toString('base64');
  return { password, encodedPassword };
}
