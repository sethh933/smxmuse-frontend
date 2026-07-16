import { useState } from "react";
import { Link } from "react-router-dom";
import { buildRiderPath } from "./seo";

const BRAND_LOGOS = {
  KTM: "https://assets.liveracemedia.com/manufacturers/primary/ktm.png",
  HON: "https://assets.liveracemedia.com/manufacturers/primary/honda.png",
  HUS: "https://assets.liveracemedia.com/manufacturers/primary/husqvarna.png",
  YAM: "https://assets.liveracemedia.com/manufacturers/primary/yamaha.png",
  KAW: "https://assets.liveracemedia.com/manufacturers/primary/kawasaki.png",
  GAS: "https://assets.liveracemedia.com/manufacturers/primary/gasgas.png",
  SUZ: "https://assets.liveracemedia.com/manufacturers/primary/suzuki.png",
  TRI: "https://assets.liveracemedia.com/manufacturers/primary/triumph.png",
  BET: "https://assets.liveracemedia.com/manufacturers/primary/beta.png",
  DUC: "https://assets.liveracemedia.com/manufacturers/primary/ducati.png",
};

const BRAND_ALIASES = {
  BETA: "BET", DUCATI: "DUC", GASGAS: "GAS", GG: "GAS", HONDA: "HON",
  HSQ: "HUS", HUSQVARNA: "HUS", KAWASAKI: "KAW", SUZUKI: "SUZ",
  TRIUMPH: "TRI", YAMAHA: "YAM",
};

const COUNTRY_CODES = {
  "United States": "us", "United Kingdom": "gb", England: "gb", Wales: "gb",
  Scotland: "gb", Austria: "at", Argentina: "ar", Australia: "au", Belgium: "be",
  Bolivia: "bo", Brazil: "br", Canada: "ca", Chile: "cl", Colombia: "co",
  "Costa Rica": "cr", Czechia: "cz", Denmark: "dk", "Dominican Republic": "do",
  Ecuador: "ec", Estonia: "ee", Finland: "fi", France: "fr", Germany: "de",
  Guatemala: "gt", Honduras: "hn", Ireland: "ie", Italy: "it", Japan: "jp",
  Latvia: "lv", Lithuania: "lt", Mexico: "mx", Mongolia: "mn", Netherlands: "nl",
  "New Zealand": "nz", Norway: "no", Portugal: "pt", "Puerto Rico": "pr",
  Russia: "ru", "South Africa": "za", "South Korea": "kr", Spain: "es",
  Sweden: "se", Switzerland: "ch", Uganda: "ug", Ukraine: "ua", Uruguay: "uy",
  Venezuela: "ve",
};

function normalizeBrand(brand) {
  return String(brand || "").trim().toUpperCase();
}

function riderInitials(name) {
  return String(name || "?").trim().split(/\s+/).slice(0, 2)
    .map((part) => part[0]).join("").toUpperCase();
}

export function ResultRider({ riderId, name, imageUrl, onClick }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = imageUrl && !imageFailed;

  return (
    <Link className="result-rider-identity" to={buildRiderPath(riderId, name)} onClick={onClick}>
      <span className={`result-rider-photo${showImage ? " has-image" : ""}`}>
        {showImage ? (
          <img src={imageUrl} alt="" loading="lazy" onError={() => setImageFailed(true)} />
        ) : <span>{riderInitials(name)}</span>}
      </span>
      <span className="result-rider-name">{name}</span>
    </Link>
  );
}

export function BrandMark({ brand }) {
  const normalizedBrand = normalizeBrand(brand);
  const brandCode = BRAND_ALIASES[normalizedBrand] || normalizedBrand;
  const logoUrl = BRAND_LOGOS[brandCode];

  return (
    <span className="result-brand-mark" title={brand || undefined}>
      {logoUrl ? <img src={logoUrl} alt={brand || brandCode} loading="lazy" /> : (brand || "—")}
    </span>
  );
}

export function CountryFlag({ country }) {
  const countryCode = COUNTRY_CODES[country];
  return countryCode ? (
    <img className="result-country-flag" src={`https://flagcdn.com/w40/${countryCode}.png`}
      alt={country} title={country} loading="lazy" />
  ) : <span className="result-country-empty">—</span>;
}
