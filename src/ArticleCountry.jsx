import { useState } from "react";
import { countryFlagCode } from "./countryFlags";

export default function ArticleCountry({ country, showName }) {
  const code = countryFlagCode(country);
  const [failedSource, setFailedSource] = useState(null);
  if (!code || failedSource === code) return country;
  return <span className="article-country" title={country}>
    <img src={`https://flagcdn.com/w40/${code}.png`} alt={showName ? "" : country}
      loading="lazy" width="24" onError={() => setFailedSource(code)} />
    {showName && <span>{country}</span>}
  </span>;
}
