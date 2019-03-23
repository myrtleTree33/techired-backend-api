import { Router } from 'express';
import moment from 'moment';

import { ensureAuth } from '../utils/socialAuth';
import Profile from '../models/Profile';
import Repo from '../models/Repo';

const routes = Router();

function addLocationFilter(location) {
  if (!location) {
    return {};
  }

  return {
    $or: [
      {
        location: { $regex: `${location}`, $options: 'i' }
      },
      {
        countries: { $elemMatch: { $regex: `${location}`, $options: 'i' } }
      },
      {
        cities: { $elemMatch: { $regex: `${location}`, $options: 'i' } }
      }
    ]
  };
}

function addCities(cities) {
  if (cities.length === 0) {
    return {};
  }

  const cities2 = cities.map(c => c.trim().toLowerCase());

  return {
    cities: {
      $in: cities2
    }
  };
}

function addCountries(countries) {
  if (countries.length === 0) {
    return {};
  }

  const countries2 = countries.map(c => c.trim().toLowerCase());

  return {
    countries: {
      $in: countries2
    }
  };
}

function addEarliestLangs(ownedReposLangs) {
  if (Object.keys(ownedReposLangs).length === 0) {
    return {};
  }

  const keys = Object.keys(ownedReposLangs);
  const query = keys.map(k => {
    const numMonths = ownedReposLangs[k];
    return {
      [`ownedReposLangsEarliest.${k}`]: {
        $lte: moment()
          .subtract(numMonths, 'months')
          .toDate()
      }
    };
  });

  console.log(query);

  return {
    $or: query
  };
}

/**
 * Meta search
 */
routes.post('/', async (req, res, next) => {
  const PER_PAGE = parseInt(process.env.PER_PAGE, 10);
  const { page, location, cities = [], countries = [], ownedReposLangsMonths = {} } = req.body;
  console.log(page, location, cities);
  const pageInt = parseInt(page || 1, 10);
  const pagination = {
    limit: PER_PAGE, // max 20
    skip: PER_PAGE * (pageInt - 1)
  };

  const profiles = await Profile.find({
    $and: [
      addLocationFilter(location),
      addCities(cities),
      addCountries(countries),
      addEarliestLangs(ownedReposLangsMonths)
    ]
  })
    .sort({ _id: -1 })
    .limit(pagination.limit)
    .skip(pagination.skip);

  console.log(`${profiles.length} profiles found.`);
  res.json(profiles);
});

export default routes;
