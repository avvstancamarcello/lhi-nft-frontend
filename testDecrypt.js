const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Percorsi ai file keys.json e keys_decryptor.txt
const keysFilePath = path.join(__dirname, "../keys.json");
const decryptorFilePath = path.join(__dirname, "../keys_decryptor.txt");

// Cartelle per i file criptati e decifrati
const encryptedFolder = path.join(__dirname, "../encrypted_images");
const decryptedFolder = path.join(__dirname, "../decrypted_images");

// Assicurati che la cartella dei file decifrati esista
if (!fs.existsSync(decryptedFolder)) {
  fs.mkdirSync(decryptedFolder);
}

// Leggi i file keys.json e keys_decryptor.txt
const keys = JSON.parse(fs.readFileSync(keysFilePath, "utf8"));
const decryptorKeys = fs.readFileSync(decryptorFilePath, "utf8").split("\n").filter(line => line.trim() !== "");

// Funzione per decifrare un file
function decryptFile(fileName, key) {
  const encryptedPath = path.join(encryptedFolder, fileName);
  const decryptedPath = path.join(decryptedFolder, fileName.replace(".enc", ""));

  if (!fs.existsSync(encryptedPath)) {
    console.error(`File criptato non trovato: ${encryptedPath}`);
    return false;
  }

  try {
    const decipher = crypto.createDecipher("aes-256-cbc", key);
    const input = fs.createReadStream(encryptedPath);
    const output = fs.createWriteStream(decryptedPath);

    input.pipe(decipher).pipe(output);

    console.log(`File decifrato con successo: ${fileName} -> ${decryptedPath}`);
    return true;
  } catch (error) {
    console.error(`Errore durante la decifrazione del file ${fileName}:`, error.message);
    return false;
  }
}

// Test della funzione di decifrazione
function testDecryption() {
  console.log("Inizio del test di decifrazione...");

  let successCount = 0;
  let failureCount = 0;

  decryptorKeys.forEach((line) => {
    const [fileName, key] = line.split(":").map(item => item.trim());
    const fileData = keys.find(item => item.fileName === fileName);

    if (!fileData) {
      console.error(`File non trovato in keys.json: ${fileName}`);
      failureCount++;
      return;
    }

    const success = decryptFile(fileName, key);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  });

  console.log(`Test completato. File decifrati con successo: ${successCount}, falliti: ${failureCount}`);
}

// Esegui il test
testDecryption();
