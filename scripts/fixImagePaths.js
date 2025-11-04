import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// temples.jsonを読み込む
const templesJsonPath = path.join(__dirname, '../public/data/temples.json');
const templesData = JSON.parse(fs.readFileSync(templesJsonPath, 'utf-8'));

// 画像ディレクトリのパス
const imagesDir = path.join(__dirname, '../public/data/images');

// 実際に存在する画像ファイルのリストを取得
const existingFiles = fs.readdirSync(imagesDir);
const fileMap = new Map();

// 小文字変換したファイル名をキーにマップを作成
existingFiles.forEach(file => {
  const lowerFile = file.toLowerCase();
  fileMap.set(lowerFile, file);
});

let fixedCount = 0;
let missingCount = 0;
const missingFiles = [];

// 各寺社の画像パスをチェック・修正
templesData.temples.forEach(temple => {
  temple.images = temple.images.map(imagePath => {
    // パスからファイル名を抽出
    const fileName = imagePath.split('/').pop();
    const lowerFileName = fileName.toLowerCase();

    // 実際のファイル名を取得
    const actualFileName = fileMap.get(lowerFileName);

    if (actualFileName && actualFileName !== fileName) {
      // ファイル名の大文字小文字が異なる場合
      const newPath = imagePath.replace(fileName, actualFileName);
      console.log(`Fixed: ${imagePath} -> ${newPath}`);
      fixedCount++;
      return newPath;
    } else if (!actualFileName) {
      // ファイルが存在しない場合
      console.warn(`Missing file: ${imagePath} (temple: ${temple.name})`);
      missingCount++;
      missingFiles.push({ temple: temple.name, path: imagePath });
      return imagePath; // そのまま残す（後で手動対応）
    }

    return imagePath;
  });
});

// 修正結果を保存
fs.writeFileSync(templesJsonPath, JSON.stringify(templesData, null, 2), 'utf-8');

console.log('\n===== Summary =====');
console.log(`Fixed: ${fixedCount} paths`);
console.log(`Missing: ${missingCount} files`);

if (missingFiles.length > 0) {
  console.log('\n===== Missing Files =====');
  missingFiles.forEach(({ temple, path }) => {
    console.log(`- ${temple}: ${path}`);
  });
}

console.log('\ntemples.json has been updated!');
