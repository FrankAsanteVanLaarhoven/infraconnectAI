const fs = require('fs');
const dir = '/Users/favl/Downloads/infraconnectAI/public/brand/';
const path = require('path');
let sharp;
try {
  sharp = require('/Users/favl/Downloads/infraconnectAI/node_modules/sharp');
} catch(e) {
  console.log("No sharp found");
  process.exit(1);
}

// Open the logo-symbol.png which has white background
sharp(dir + 'logo-symbol.png')
  // We can easily remove white bg by finding pixels above a high threshold
  // But a robust way is to convert to WebP or just use sharp's threshold extraction or flatten.
  // Actually, sharp has 	trim() to remove whitespace.
  // To make white transparent: we can compose it with a mask.
  .toBuffer()
  .then(buffer => {
      console.log("Image processed locally");
  })
  .catch(err => {
      console.error(err);
  });
