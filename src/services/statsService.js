import Profile from '../models/Profile';

const queryPage = async ({ page = 1, country }) => {
  const perPage = 10000;
  const country2 = !!country ? country.trim().toLowerCase() : null;
  const pagination = {
    limit: perPage,
    skip: perPage * (page - 1)
  };

  const query = country2
    ? {
        countries: { $in: country2 }
      }
    : {};
  return Profile.find(query)
    .limit(pagination.limit)
    .skip(pagination.skip)
    .exec();
};

const findLangsByCountry = async ({ country } = {}) => {
  const langs = {};
  let page = 1;
  let profiles = [];

  while (true) {
    profiles = await queryPage({ page, country });

    if (profiles.length === 0) {
      break;
    }

    profiles.map(p => {
      const ownedReposLangs = p.ownedReposLangs || [];
      for (let k in ownedReposLangs) {
        langs[k] = (langs[k] || 0) + ownedReposLangs[k];
      }
    });

    console.log(langs);
    console.log(`Processed page ${page}`);
    page++;
  }

  console.log('Done processing.');
};

export default findLangsByCountry;
