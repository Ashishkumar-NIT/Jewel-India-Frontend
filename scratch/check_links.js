const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

const filesWithLinkMissingImport = [];

walkDir('.', (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('<Link') || /\bLink\b/.test(content)) {
      // Check if it has 'import Link' or 'import { Link }' or similar
      const hasImport = content.includes('import Link') || content.includes("from 'next/link'") || content.includes('from "next/link"') || content.includes("from 'react-router-dom'") || content.includes("import { Link }");
      const isDeclaringLink = content.includes('const Link') || content.includes('function Link') || content.includes('class Link');
      
      if (!hasImport && !isDeclaringLink && (content.includes('<Link') || content.includes(' Link(') || content.includes('= Link'))) {
        filesWithLinkMissingImport.push(filePath);
      }
    }
  }
});

console.log('Files missing Link import:', filesWithLinkMissingImport);
