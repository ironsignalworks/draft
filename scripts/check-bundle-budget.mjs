import { gzipSync } from 'node:zlib';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BUDGET_KB = Number.parseInt(process.env.BUNDLE_BUDGET_KB ?? '300', 10);
const BUDGET_MODE = process.env.BUNDLE_BUDGET_MODE ?? 'gzip';
const assetsDir = join('dist', 'assets');

const assetFiles = readdirSync(assetsDir).filter((name) => name.endsWith('.js') || name.endsWith('.css'));

const totals = assetFiles.reduce(
  (acc, file) => {
    const fileContents = readFileSync(join(assetsDir, file));
    acc.rawBytes += fileContents.byteLength;
    acc.gzipBytes += gzipSync(fileContents).byteLength;
    return acc;
  },
  { rawBytes: 0, gzipBytes: 0 },
);

const measuredBytes = BUDGET_MODE === 'raw' ? totals.rawBytes : totals.gzipBytes;
const measuredKb = measuredBytes / 1024;
const rawKb = totals.rawBytes / 1024;
const gzipKb = totals.gzipBytes / 1024;

if (measuredKb > BUDGET_KB) {
  console.error(
    `Bundle budget exceeded (${BUDGET_MODE}): ${measuredKb.toFixed(1)}KB > ${BUDGET_KB}KB` +
      ` (raw=${rawKb.toFixed(1)}KB, gzip=${gzipKb.toFixed(1)}KB)`,
  );
  process.exit(1);
}

console.log(
  `Bundle budget ok (${BUDGET_MODE}): ${measuredKb.toFixed(1)}KB <= ${BUDGET_KB}KB` +
    ` (raw=${rawKb.toFixed(1)}KB, gzip=${gzipKb.toFixed(1)}KB)`,
);
