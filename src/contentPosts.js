import { slugify } from "./seo";

export const POST_TYPES = {
  preRace: "Pre-Race Notes",
  raceRecap: "Race Recap",
  leaderboard: "Leaderboard",
  analysis: "Analysis"
};

/*
  Add new social-to-site posts here.

  Template:
  {
    title: "2026 Anaheim 1 Pre-Race Notes",
    date: "2026-01-10",
    type: "preRace",
    sport: "Supercross",
    season: 2026,
    round: 1,
    race: "Anaheim 1",
    raceId: 1234,
    summary: "Short preview text shown on the notes page.",
    tags: ["450SX", "250SX West", "Anaheim"],
    instagramUrl: "https://www.instagram.com/p/...",
    body: [
      "Paste the main note text here as paragraph one.",
      {
        heading: "450 Class",
        subsections: [
          {
            heading: "Rider Name",
            paragraphs: [
              "Use subsections when the post has rider notes, class notes, or different angles.",
              "Each paragraph renders as normal blog text."
            ]
          }
        ]
      },
      {
        heading: "Numbers To Watch",
        bullets: [
          "Bullet points are good for stat-heavy social posts.",
          "Keep each thought short and punchy."
        ]
      }
    ]
  }
*/

export const contentPosts = [
  {
    title: "2026 Hangtown Pre-Race Notes",
    date: "2026-06-05",
    type: "preRace",
    sport: "Motocross",
    season: 2026,
    race: "Hangtown",
    raceId: 1492,
    summary:
      "Hunter Lawrence carries the 450 red plate into Hangtown while Seth Hammaker leads the 250 class after his Fox Raceway breakout.",
    tags: ["450MX", "250MX", "Hangtown", "Pre-Race"],
    body: [
      {
        heading: "450 Class",
        subsections: [
          {
            heading: "Hunter Lawrence",
            paragraphs: [
              "Hunter Lawrence enters Hangtown with the red plate for the first time in motocross since Red Bud in 2024. Hunter has finished in the top five at Hangtown in four straight visits, including three podiums and a victory on a 250 in 2023. He averages a finish of 3.50 there on a 450 and his fifth there in 2025 was tied for his worst finish of the season.",
              "If Hunter can win Hangtown, history suggests he would be a good bet for the championship. Riders that win the first two overalls of the season in the 450 class go on to win the championship 72.00% of the time. If both victories are 1-1s, that percentage slightly jumps up to 75.00%."
            ]
          },
          {
            heading: "Jorge Prado",
            paragraphs: [
              "Jorge Prado earned his first career AMA top five moto finish in moto two at Hangtown in 2025. That was tied for his best moto finish during that season. Foreign riders have had success at Hangtown in recent memory as they have won four of the previous six races there. Chase Sexton in 2024 and Jason Anderson in 2022 are the only Americans to win in that span.",
              "Riders that open the season with a 2-2 finish tend to keep the good performance up at the following round. Six of the last seven times a rider started the season with a 2-2, they finished on the overall podium at round two as well, two of those being wins.",
              "Prado showed a lot of pace last weekend at Fox Raceway. In moto two, he had a top three fastest lap in ten of the fourteen full laps. He also had the fastest lap of the moto in moto one."
            ]
          },
          {
            heading: "Jett Lawrence",
            paragraphs: [
              "Jett Lawrence finished third overall for the first time in his 450 career one week ago at Fox Raceway. It was only the second time in his career he did not earn a moto win at a race on a 450. At Hangtown, he will try and become the first rider since Eli Tomac in 2017-18 to win back to back Hangtown nationals. He has won there twice on a 450, 2023 and 2025.",
              "There have only been two times in his 450 career where Jett finished off the overall podium and he responded by winning the overall at the following round both times. Jett will hope his poor starts were an anomaly at Fox Raceway because it was the first time in his 450 career he rounded lap one eighth or worse in both motos."
            ]
          },
          {
            heading: "Chase Sexton",
            paragraphs: [
              "Chase Sexton has only raced Hangtown two times on a 450 and has never finished worse than second place in a moto. He went 2-2 for second overall in 2022 and 1-1 for first overall in 2024. In 2024, he had his infamous 40th to 1st charge to salvage his overall victory.",
              "His average at the venue is 1.50 which is his second best for any track on a 450. His best is 1.20 at Washougal. Sexton is one overall victory away from tying Jeremy McGrath for eleventh all time with fifteen 450 class wins."
            ]
          },
          {
            heading: "Haiden Deegan",
            paragraphs: [
              "Going back to his 250 days, the last four times Haiden Deegan finished off the podium, he responded with a podium at the following race, the most recent two being victories at such races. Hangtown was Deegan's second best venue in terms of average overall finish in the 250 class. His average was 1.67. He finished third in his first appearance there in 2023 and then won back to back years after that. He had a perfect day in 2025, winning both motos and earning the pole position in qualifying."
            ]
          },
          {
            heading: "Justin Cooper",
            paragraphs: [
              "Justin Cooper's second best venue on the circuit, counting 250 and 450 results, is Hangtown. He averages a finish of 2.71 there. On a 450, he scored a fourth overall in his rookie season and bested that in 2025 by going 4-2 for third overall.",
              "Cooper finished qualifying on pole position three years in a row on a 250 from 2021 through 2023 and earned one overall victory during that stretch in 2021. On a 450, his qualifying pace is not far off. He qualified third in 2024 and second in 2025."
            ]
          }
        ]
      },
      {
        heading: "250 Class",
        subsections: [
          {
            heading: "Seth Hammaker",
            paragraphs: [
              "Seth Hammaker rides into Hangtown boasting the red plate and a thirteen point points lead. He has never finished in the top five of a moto at Hangtown, he has a sixth, two eighths, and one DNF, the latter coming in moto two last season. He only had one top five moto finish in four prior visits to Fox Raceway last weekend before bursting onto the scene with 2-1 moto scores.",
              "A second straight win to begin the season would be a huge championship boost for Hammaker. In the 250 class, riders who win the first two rounds go on to win the championship 83.33% of the time. The last nine times a rider has won the first two rounds, they have won the title. The last time it did not happen was Grant Langston in 2001."
            ]
          },
          {
            heading: "Levi Kitchen",
            paragraphs: [
              "Levi Kitchen will look to bounce back to the podium after going 1-13 at Fox Raceway and missing out on second overall due to the second moto tie breaker. He might be in luck for a podium at Hangtown because he has finished on the box two straight seasons, going 3-3 for third overall in both of them.",
              "Despite the fair results there, it is one of just two tracks that he has raced where he does not have a moto finish of second or better. Kawasaki is the winningest 250 brand at Hangtown. They have 14 wins, two more than the next closest brand, Suzuki with 12."
            ]
          },
          {
            heading: "Jo Shimoda",
            paragraphs: [
              "Jo Shimoda's second best track in terms of average overall finish is Hangtown. His average there is 3.80 but he has not won an overall or a moto there. He has finished in the top five four times in five starts, including two podiums. In 2025, he had his best points haul with 44 and tied his best overall finish of second there. Hangtown is one of three tracks where Shimoda has raced three or more times but does not have a lap led."
            ]
          },
          {
            heading: "Julien Beaumer",
            paragraphs: [
              "Julien Beaumer had his career best overall finish at Hangtown one year ago. His 8-4 moto scores earned him that career best fourth overall. In the last two races he has finished, Unadilla in 2025 and Fox Raceway, Beaumer has finished in the top five overall. His second place finish in moto two at Fox Raceway was his career best moto finish so he will be entering Hangtown with plenty of momentum. The last time a KTM won in the 250 class at Hangtown was with Ken Roczen in 2013."
            ]
          },
          {
            heading: "Chance Hymas",
            paragraphs: [
              "Chance Hymas will be aiming for redemption at Hangtown this season because in 2025, he went 13-DNS as he could not line up for the second moto. Prior to 2025, Hymas had made some good results at Hangtown. In his rookie season in 2023, he earned his first ever top ten moto finish by finishing sixth in moto two. In 2024, he went 2-4 for fourth overall in a career day at the time. Second was his best ever moto finish and the fourth overall tied his career best going into the race."
            ]
          },
          {
            heading: "Star Racing Yamaha",
            paragraphs: [
              "The Star Racing Yamaha teammates, Caden Dudney and Cole Davies, are tied for second in points and enter Hangtown with no professional starts at the venue. Their other teammate, Kayden Minear, does have a little experience there going 1-1 in the SMX Next Moto Combine just one year ago.",
              "Yamaha has some good history at the storied venue in the 250 class. They have won the two most recent races, thanks to Haiden Deegan, and nine all time which ranks fourth among manufacturers. However, they have 35 overall podiums there which ranks second most all time at the venue behind Honda's 38."
            ]
          }
        ]
      }
    ]
  }
];

export function getPostTypeLabel(type) {
  return POST_TYPES[type] || type || "Notes";
}

export function buildPostSlug(post) {
  return post.slug || slugify([post.date, post.title].filter(Boolean).join(" "));
}

export function getPostTags(post) {
  return post.tags || [];
}

export function getPublishedPosts() {
  return contentPosts
    .filter((post) => !post.draft)
    .map((post) => ({
      ...post,
      slug: buildPostSlug(post)
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPostsForRace(raceId) {
  const normalizedRaceId = Number(raceId);

  return getPublishedPosts().filter((post) => Number(post.raceId) === normalizedRaceId);
}
