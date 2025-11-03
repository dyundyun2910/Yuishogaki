#!/usr/bin/env node

/**
 * Geminiから取得したJSONデータと、EXIFから生成したJSONをマージするスクリプト
 * 
 * 使い方:
 * 1. npm run generate:temples でEXIFデータから雛形を生成
 * 2. Geminiで画像から寺社情報を取得（JSON形式）
 * 3. このスクリプトで2つをマージ
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const EXIF_JSON = path.join(__dirname, '../public/data/temples-generated.json')
const GEMINI_JSON = path.join(__dirname, '../public/data/temples-from-gemini.json')
const OUTPUT_FILE = path.join(__dirname, '../public/data/temples.json')

/**
 * 画像ファイル名で寺社をマッチング
 */
function findMatchingTemple(exifTemples, geminiTemple) {
  // 画像ファイル名で一致するものを探す
  for (const exifTemple of exifTemples) {
    const exifImages = new Set(exifTemple.images.map(img => path.basename(img)))
    const geminiImages = new Set(geminiTemple.images ? geminiTemple.images.map(img => path.basename(img)) : [])

    // 共通の画像があればマッチ
    const intersection = [...exifImages].filter(img => geminiImages.has(img))
    if (intersection.length > 0) {
      return exifTemple
    }
  }

  return null
}

/**
 * 2つのJSONをマージ
 */
function mergeTemplesData(exifData, geminiData) {
  const merged = []

  for (const geminiTemple of geminiData.temples || geminiData) {
    const exifTemple = findMatchingTemple(exifData.temples, geminiTemple)

    if (exifTemple) {
      // マッチした場合、Geminiのデータを優先してEXIFデータで補完
      merged.push({
        id: geminiTemple.id || exifTemple.id,
        name: geminiTemple.name || exifTemple.name,
        nameKana: geminiTemple.nameKana || exifTemple.nameKana || '',
        category: geminiTemple.category || exifTemple.category,
        location: {
          lat: exifTemple.location.lat, // EXIFの位置情報を使用
          lng: exifTemple.location.lng,
          address: geminiTemple.location?.address || exifTemple.location.address || '',
        },
        description: geminiTemple.description || exifTemple.description || '',
        images: [...new Set([...exifTemple.images, ...(geminiTemple.images || [])])], // 重複を除去
        visitDate: exifTemple.visitDate || geminiTemple.visitDate || '',
        tags: geminiTemple.tags || exifTemple.tags || [],
        website: geminiTemple.website || exifTemple.website || '',
      })
    } else {
      // マッチしない場合はGeminiのデータをそのまま使用
      console.warn(`警告: ${geminiTemple.name || geminiTemple.id} の位置情報が見つかりません`)
      merged.push(geminiTemple)
    }
  }

  // EXIFにしかない寺社も追加（Geminiで認識されなかったもの）
  for (const exifTemple of exifData.temples) {
    const found = merged.some(temple => {
      const exifImages = new Set(exifTemple.images.map(img => path.basename(img)))
      const mergedImages = new Set(temple.images.map(img => path.basename(img)))
      const intersection = [...exifImages].filter(img => mergedImages.has(img))
      return intersection.length > 0
    })

    if (!found) {
      console.log(`追加: ${exifTemple.name} (Geminiで未認識)`)
      merged.push(exifTemple)
    }
  }

  return { temples: merged }
}

/**
 * メイン処理
 */
function main() {
  console.log('JSONデータをマージします...\n')

  // ファイルの存在確認
  if (!fs.existsSync(EXIF_JSON)) {
    console.error(`エラー: ${EXIF_JSON} が見つかりません`)
    console.log('先に npm run generate:temples を実行してください')
    process.exit(1)
  }

  if (!fs.existsSync(GEMINI_JSON)) {
    console.error(`エラー: ${GEMINI_JSON} が見つかりません`)
    console.log('Geminiから取得したJSONを temples-from-gemini.json として保存してください')
    process.exit(1)
  }

  // JSONファイルを読み込み
  const exifData = JSON.parse(fs.readFileSync(EXIF_JSON, 'utf-8'))
  const geminiData = JSON.parse(fs.readFileSync(GEMINI_JSON, 'utf-8'))

  console.log(`EXIF JSON: ${exifData.temples.length}件`)
  console.log(`Gemini JSON: ${(geminiData.temples || geminiData).length}件\n`)

  // マージ
  const merged = mergeTemplesData(exifData, geminiData)

  console.log(`\nマージ結果: ${merged.temples.length}件\n`)

  // 出力
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2), 'utf-8')

  console.log(`✓ ${OUTPUT_FILE} を生成しました`)
  console.log('\n次のステップ:')
  console.log('1. 生成されたファイルを確認')
  console.log('2. 必要に応じて手動で編集')
  console.log('3. アプリケーションをリロード')
}

main()
