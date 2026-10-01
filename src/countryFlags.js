export const COUNTRY_CODES = {
  "Northern Ireland": "gb-nir",
  "United States": "us", "United Kingdom": "gb", England: "gb-eng", Wales: "gb-wls",
  Scotland: "gb-sct", Austria: "at", Argentina: "ar", Australia: "au", Belgium: "be",
  Bolivia: "bo", Brazil: "br", Canada: "ca", Chile: "cl", Colombia: "co",
  "Costa Rica": "cr", Czechia: "cz", Denmark: "dk", "Dominican Republic": "do",
  Ecuador: "ec", Estonia: "ee", Finland: "fi", France: "fr", Germany: "de",
  Guatemala: "gt", Honduras: "hn", Ireland: "ie", Iran: "ir", "Isle of Man": "im",
  Italy: "it", Japan: "jp",
  Latvia: "lv", Lithuania: "lt", Mexico: "mx", Mongolia: "mn", Netherlands: "nl",
  "New Zealand": "nz", Norway: "no", Portugal: "pt", "Puerto Rico": "pr",
  Russia: "ru", "South Africa": "za", "South Korea": "kr", Spain: "es",
  Sweden: "se", Switzerland: "ch", Uganda: "ug", Ukraine: "ua", Uruguay: "uy",
  Venezuela: "ve",
};

const aliases = { usa: "us", us: "us", "united states of america": "us", uk: "gb", "great britain": "gb", "czech republic": "cz", holland: "nl", korea: "kr" };
const names = Object.fromEntries(Object.entries(COUNTRY_CODES).map(([name, code]) => [name.toLowerCase(), code]));
export function countryFlagCode(value) {
  const name = value.trim().toLowerCase();
  return names[name] || aliases[name] || (Object.values(COUNTRY_CODES).includes(name) ? name : null);
}
