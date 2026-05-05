/**
 * Generates email and password for a new employee.
 *
 * Email format: firstname.lastname@businessslug.com
 * Password format: Name3Chars + Biz3Chars + 4RandomDigits + SpecialChar
 *
 * Example: "Priya Sharma" at "Pine Jewels"
 *   → email: priya.sharma@pinejewels.com
 *   → password: Priels7284!
 */
function stripDiacritics(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

function sanitizeLocalPart(fullName = "") {
  const normalized = stripDiacritics(fullName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const tokens = normalized ? normalized.split(/\s+/).filter(Boolean) : [];
  const base = tokens
    .join(".")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+|\.+$/g, "");

  return base || "employee";
}

function sanitizeDomainLabel(businessName = "") {
  const label = stripDiacritics(businessName)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Domain labels are max 63 chars; keep a short safe fallback.
  return (label || "jewelindia").slice(0, 63);
}

export function isValidEmailFormat(email) {
  const pattern = /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,24}$/i;
  return pattern.test(String(email || ""));
}

/**
 * Validates and normalizes Indian mobile numbers.
 *
 * Accepts common formats: 9876543210, 09876543210, +919876543210, 91-987-654-3210
 * Returns E.164 format: +919876543210
 *
 * Edge cases handled:
 * - Leading 0 is stripped (09876543210 → +919876543210)
 * - 91 prefix is preserved as +91
 * - Must be exactly 10 digits starting with 6-9 after normalization
 * - Rejects numbers starting with 0-5 (e.g. 1234567890)
 * - Rejects short/long numbers (e.g. 987654321 = 9 digits)
 */
export function validateIndianMobile(input) {
  const digits = String(input || "").replace(/\D/g, "");

  if (/^[6-9]\d{9}$/.test(digits)) {
    return { valid: true, normalized: `+91${digits}` };
  }
  if (/^0[6-9]\d{9}$/.test(digits)) {
    return { valid: true, normalized: `+91${digits.slice(1)}` };
  }
  if (/^91[6-9]\d{9}$/.test(digits)) {
    return { valid: true, normalized: `+${digits}` };
  }

  return { valid: false, normalized: null };
}

export function generateEmployeeCredentials(fullName, businessName, existingEmails = []) {
  const localPart = sanitizeLocalPart(fullName);
  const domainLabel = sanitizeDomainLabel(businessName);

  const existingLower = new Set(
    (existingEmails || [])
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())
  );

  let email = `${localPart}@${domainLabel}.com`;

  // Handle duplicate emails by appending a number.
  let counter = 1;
  while (existingLower.has(email.toLowerCase())) {
    email = `${localPart}${counter}@${domainLabel}.com`;
    counter++;
  }

  // Last-resort safety guard; should be extremely rare with sanitization above.
  if (!isValidEmailFormat(email)) {
    const fallbackId = Math.floor(100000 + Math.random() * 900000);
    email = `employee${fallbackId}@${domainLabel}.com`;
  }

  // Password generation.
  const cleanName = stripDiacritics(fullName).replace(/[^a-zA-Z0-9]/g, "");
  const cleanBusiness = stripDiacritics(businessName).replace(/[^a-zA-Z0-9]/g, "");
  const namePrefix = (cleanName.slice(0, 3) || "Emp").toLowerCase();
  const namePrefixCapitalized =
    namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1).toLowerCase();
  const bizSuffix = (cleanBusiness.slice(-3) || "biz").toLowerCase();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const specials = ['!', '@', '#', '$', '&'];
  const special = specials[Math.floor(Math.random() * specials.length)];
  const password = `${namePrefixCapitalized}${bizSuffix}${randomDigits}${special}`;

  return { email, password };
}
