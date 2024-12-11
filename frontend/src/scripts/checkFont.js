const fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, '..', 'theme', 'fonts');

const fonts = [
  'HubotSans-Regular.woff2',
  'HubotSans-Light.woff2',
  'HubotSans-SemiBold.woff2',
  'HubotSans-Bold.woff2'
];

fonts.forEach(fontFile => {
  const fontPath = path.join(fontsDir, fontFile);
  const buffer = fs.readFileSync(fontPath);
  const font = fontkit.create(buffer);
  
  console.log(`\nAnalyzing ${fontFile}:`);
  console.log('PostScript Name:', font.postscriptName);
  console.log('Family Name:', font.familyName);
  console.log('Full Name:', font.fullName);
  console.log('Weight:', font.weight);
  console.log('Style:', font.style);
});
