#!/usr/bin/env node

/**
 * 画像ファイルからtemples.jsonを生成するスクリプト
 * 
 * 使い方:
 * 1. npm install exif-parser --save-dev
 * 2. node scripts/generateTemplesJson.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGES_DIR = path.join(__dirname, '../public/data/images')
const OUTPUT_FILE = path.join(__dirname, '../public/data/temples-generated.json')

// 画像ファイルの拡張子
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.JPG', '.JPEG', '.PNG', '.HEIC']

/**
 * 画像ファイルからEXIFデータを読み取る
 */
async function readExifData(imagePath) {
  try {
    const buffer = fs.readFileSync(imagePath)
    
    // exif-parserを動的にインポート
    const exifParser = await import('exif-parser')
    const parser = exifParser.default.create(buffer)
    const result = parser.parse()
    
    return result
  } catch (error) {
    console.warn(`EXIF読み取りエラー (${path.basename(imagePath)}):`, error.message)
    return null
  }
}

/**
 * EXIF GPSデータから緯度経度を取得
 */
function getLocationFromExif(exifData) {
  if (!exifData || !exifData.tags) {
    return null
  }

  const { GPSLatitude, GPSLongitude, GPSLatitudeRef, GPSLongitudeRef } = exifData.tags

  if (!GPSLatitude || !GPSLongitude) {
    return null
  }

  // 緯度の符号を調整（N=正, S=負）
  const lat = GPSLatitudeRef === 'S' ? -GPSLatitude : GPSLatitude
  
  // 経度の符号を調整（E=正, W=負）
  const lng = GPSLongitudeRef === 'W' ? -GPSLongitude : GPSLongitude

  return { lat, lng }
}

/**
 * ファイル名から撮影日を取得
 */
function getDateFromFilename(filename) {
  // YYYY-MM-DD形式
  const match1 = filename.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (match1) {
    return `${match1[1]}-${match1[2]}-${match1[3]}`
  }

  // IMG_XXXX形式は日付情報なし
  return null
}

/**
 * EXIFから撮影日を取得
 */
function getDateFromExif(exifData) {
  if (!exifData || !exifData.tags) {
    return null
  }

  const dateTime = exifData.tags.DateTimeOriginal || exifData.tags.DateTime
  if (!dateTime) {
    return null
  }

  // UNIXタイムスタンプをISO日付に変換
  const date = new Date(dateTime * 1000)
  return date.toISOString().split('T')[0]
}

/**
 * 画像一覧を取得
 */
function getImageFiles() {
  const files = fs.readdirSync(IMAGES_DIR)
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase()
    return IMAGE_EXTENSIONS.includes(ext)
  })
}

/**
 * 位置情報でグループ化（近い位置の画像をまとめる）
 */
function groupByLocation(imageDataList) {
  const groups = []
  const THRESHOLD = 0.001 // 約100m

  for (const data of imageDataList) {
    if (!data.location) {
      continue
    }

    // 既存のグループに追加できるか確認
    let added = false
    for (const group of groups) {
      const distance = Math.sqrt(
        Math.pow(group.location.lat - data.location.lat, 2) +
        Math.pow(group.location.lng - data.location.lng, 2)
      )

      if (distance < THRESHOLD) {
        group.images.push(data.image)
        added = true
        break
      }
    }

    // 新しいグループを作成
    if (!added) {
      groups.push({
        location: data.location,
        images: [data.image],
        date: data.date,
      })
    }
  }

  return groups
}

/**
 * メイン処理
 */
async function main() {
  console.log('画像ファイルからtemples.jsonを生成します...\n')

  const imageFiles = getImageFiles()
  console.log(`${imageFiles.length}枚の画像ファイルを検出しました\n`)

  const imageDataList = []

  for (const filename of imageFiles) {
    const imagePath = path.join(IMAGES_DIR, filename)
    const exifData = await readExifData(imagePath)
    const location = getLocationFromExif(exifData)
    const date = getDateFromExif(exifData) || getDateFromFilename(filename)

    if (location) {
      console.log(`✓ ${filename}: (${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})`)
      imageDataList.push({
        image: `data/images/${filename}`,
        location,
        date,
      })
    } else {
      console.log(`✗ ${filename}: 位置情報なし`)
    }
  }

  console.log(`\n位置情報を持つ画像: ${imageDataList.length}枚\n`)

  // 位置情報でグループ化
  const groups = groupByLocation(imageDataList)
  console.log(`${groups.length}箇所の寺社を検出しました\n`)

  // temples.jsonの雛形を生成
  const temples = groups.map((group, index) => {
    const id = `temple_${index + 1}`
    return {
      id,
      name: `寺社 ${index + 1}`, // 手動で編集が必要
      nameKana: '', // 手動で編集が必要
      category: 'temple', // または 'shrine'、手動で編集が必要
      location: {
        lat: group.location.lat,
        lng: group.location.lng,
        address: '', // 手動で編集が必要
      },
      description: '', // OCRまたは手動で編集が必要
      images: group.images,
      visitDate: group.date || '',
      tags: [],
      website: '',
    }
  })

  const output = {
    temples,
    _note: 'このファイルは自動生成されました。name, nameKana, address, descriptionなどを手動で編集してください。',
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8')

  console.log(`✓ ${OUTPUT_FILE} を生成しました`)
  console.log('\n次のステップ:')
  console.log('1. 生成されたファイルを確認')
  console.log('2. name, nameKana, category, address, descriptionを編集')
  console.log('3. temples.jsonにリネーム')
}

main().catch(error => {
  console.error('エラーが発生しました:', error)
  process.exit(1)
})
