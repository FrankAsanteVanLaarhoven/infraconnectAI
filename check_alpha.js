const sharp = require('sharp');
const fs = require('fs');
const dir = '/Users/favl/Downloads/infraconnectAI/assets/INFRACONNECTAI-LOGO/';

async function checkFiles() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
  for (let file of files) {
    const meta = await sharp(dir + file).metadata();
    console.log(file, meta.hasAlpha, meta.channels);
  }
}
checkFiles();
