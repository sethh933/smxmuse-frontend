const AFFILIATE_URL = "https://motosport.sjv.io/c/7719140/2763371/31692";
const CREATIVE_URL = "/motosport-logo.gif";
const IMPRESSION_URL = "https://imp.pxf.io/i/7719140/2763371/31692";

function AffiliateAd() {
  return (
    <aside className="affiliate-ad" aria-label="Sponsored offer from MotoSport">
      <span className="affiliate-ad-label">Sponsored</span>
      <a
        className="affiliate-ad-link"
        rel="sponsored noopener"
        href={AFFILIATE_URL}
        target="_blank"
        id="motosport-affiliate-2763371"
      >
        <img
          className="affiliate-ad-creative"
          src={CREATIVE_URL}
          alt="Shop MotoSport"
          width="160"
          height="33"
        />
      </a>
      <img
        className="affiliate-ad-impression"
        src={IMPRESSION_URL}
        alt=""
        width="1"
        height="1"
        aria-hidden="true"
      />
    </aside>
  );
}

export default AffiliateAd;
