const fs = require('fs');

const filePath = 'src/pages/sangam/BusinessSangamPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace corrupted duplicate chunk
const targetChunk = `    image: '/assets/images/sangam-ch-thane.jpg', // फूड प्रोसेसिंग व ऑटोमेटेड मॅन्युफॅक्चरिंग प्लांट
    specialties: ['कॉर्पोरेट टॅक्स व CA', 'फिनटेक व आयटी', 'कमर्शियल रिअल इस्टेट', 'लक्झरी हॉस्पिटॅलिटी'],
    coordinator: 'ॲड. नितीन सावंत (संयोजक)',
    phone: '+91 98205 99123'
  }`;

const splitIndex = content.indexOf(targetChunk);
if (splitIndex !== -1) {
  const afterChunk = content.indexOf('];\n\nfunction formatCurrency', splitIndex);
  if (afterChunk !== -1) {
    const newContent = content.substring(0, splitIndex + targetChunk.length) + '\n' + content.substring(afterChunk);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Successfully cleaned BusinessSangamPage.jsx');
  } else {
    console.log('Could not find afterChunk');
  }
} else {
  console.log('Could not find targetChunk');
}
