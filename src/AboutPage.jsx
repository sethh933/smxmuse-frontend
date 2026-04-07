export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <p className="about-kicker">ABOUT SMXMUSE</p>
        <p>
          Smxmuse is a brand I started to showcase stats and analysis on social media for all
          things Supercross and Motocross from a database I created. This website is an extension of that work and
          will allow the average fan to have access to every rider's results and stats at their fingertips. When I was building the database,
          I realized how there wasn't an in depth Sports-Reference style site for our sport, and I wanted to create that for the people who are as obsessed
          with numbers as I am or for those who want to bench race at a higher level than ever before. If you want to see the type of content I create, please
          follow my social media pages (@smxmuse) where you will find pre
          race notes, race recaps, and general analysis and breakdowns of our
          sport.
        </p>
      </section>

      <section className="about-section">
        <p className="about-kicker">ABOUT SMXMUSE GRIDS</p>
        <p>
          Smxmuse grids is a daily 3x3 grid trivia game powered by my database
          to test your knowledge about Supercross and Motocross. New grids are generated daily but all grids are accessible and playable via the grid archive.
        </p>
      </section>

      <section className="about-section">
        <p className="about-kicker">SITE NOTES</p>
        <ul className="about-notes-list">
          <li>Laps led and start position data are only available starting from 2003 for Supercross and 2004 for Motocross.</li>
          <li>Qualifying data such as pole positions and average qual are available from the start of the timed qualifying era. This is 2007 in Supercross and 2009 in Motocross.</li>
          <li>Holeshot data is something I have been working on. It is complete for 450 MX but varied in all other classes and sports.</li>
          <li>Semi data is something I have not prioritized and do not have in the database yet but it is something I plan to add in the future.</li>
          <li>I have the SMX Playoff data in my database but not on the website. I focused on getting SX/MX covered and will add SMX data to this site in the future.</li>
          <li>Heat, LCQ, and individual moto data prior to 1990 is pulled from the CycleNews Archives which did not start listing the full field in each race until 1990.</li>
        </ul>
      </section>
    </div>
  );
}
