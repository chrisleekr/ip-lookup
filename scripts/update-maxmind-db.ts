import * as fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import * as path from 'node:path';
import { mkdir } from 'node:fs/promises';

const DATA_DIR = path.join(__dirname, '../data');

interface Database {
  name: string;
  url: string;
}

const DATABASES: Database[] = [
  {
    name: 'GeoLite2-ASN.mmdb',
    url: 'https://git.io/GeoLite2-ASN.mmdb',
  },
  {
    name: 'GeoLite2-City.mmdb',
    url: 'https://git.io/GeoLite2-City.mmdb',
  },
  {
    name: 'GeoLite2-Country.mmdb',
    url: 'https://git.io/GeoLite2-Country.mmdb',
  },
];

async function downloadDatabase(url: string, filename: string): Promise<void> {
  try {
    console.log(`Downloading ${filename}...`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download ${filename}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error(`No data received for ${filename}`);
    }

    const dbPath = path.join(DATA_DIR, filename);
    await pipeline(response.body, fs.createWriteStream(dbPath));
    console.log(`${filename} updated successfully`);
  } catch (error) {
    console.error(`Error updating ${filename}:`, error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    // Create data directory if it doesn't exist
    await mkdir(DATA_DIR, { recursive: true });

    // Download all databases in parallel
    await Promise.all(DATABASES.map((db) => downloadDatabase(db.url, db.name)));

    console.log('All databases updated successfully');
  } catch (error) {
    console.error('Failed to update databases:', error);
    process.exit(1);
  }
}

main();
