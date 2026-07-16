#!/usr/bin/env node
/**
 * Validates that all 4 locale JSON files (es, en, fr, it) have identical key structures
 * for each app in the monorepo.
 *
 * Usage: node scripts/validate-i18n-parity.js
 */
const fs = require("fs");
const path = require("path");

const APPS = ["web-landing", "web-patient", "web-admin", "web-merchant"];
const LOCALES = ["es", "en", "fr", "it"];
const ROOT = path.resolve(__dirname, "..");

function getKeys(obj, prefix = "") {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...getKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

let hasErrors = false;

for (const app of APPS) {
  const dir = path.join(ROOT, "apps", app, "src", "i18n", "messages");
  const localeKeys = {};

  for (const locale of LOCALES) {
    const filePath = path.join(dir, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`[${app}] MISSING: ${locale}.json`);
      hasErrors = true;
      continue;
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    localeKeys[locale] = getKeys(data);
  }

  const esKeys = localeKeys["es"] || [];
  const esSet = new Set(esKeys);

  for (const locale of LOCALES) {
    if (locale === "es") continue;
    const localeSet = new Set(localeKeys[locale] || []);
    
    const missing = esKeys.filter((k) => !localeSet.has(k));
    const extra = (localeKeys[locale] || []).filter((k) => !esSet.has(k));

    if (missing.length > 0) {
      console.error(`[${app}] ${locale}.json — MISSING ${missing.length} keys:`);
      missing.slice(0, 10).forEach((k) => console.error(`  - ${k}`));
      if (missing.length > 10) console.error(`  ... and ${missing.length - 10} more`);
      hasErrors = true;
    }

    if (extra.length > 0) {
      console.error(`[${app}] ${locale}.json — EXTRA ${extra.length} keys:`);
      extra.slice(0, 10).forEach((k) => console.error(`  + ${k}`));
      if (extra.length > 10) console.error(`  ... and ${extra.length - 10} more`);
      hasErrors = true;
    }
  }

  if (!hasErrors) {
    console.log(`[${app}] ✅ ${esKeys.length} keys — all 4 locales match`);
  }
}

if (hasErrors) {
  console.error("\n❌ Parity check FAILED");
  process.exit(1);
} else {
  console.log("\n✅ All locales match across all apps");
}
