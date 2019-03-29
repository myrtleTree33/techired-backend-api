import { Router } from 'express';
import _ from 'lodash';
import moment from 'moment';

import { ensureAuth } from '../utils/socialAuth';
import Profile from '../models/Profile';
import Repo from '../models/Repo';
import { findNearestCitiesMultiple } from '../services/geolocationService';

const { PER_PAGE, QUERY_DISTANCE_MAX } = process.env;

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

  return {
    $or: query
  };
}

routes.post('/nearestcities', async (req, res, next) => {
  const { cities = [], distance } = req.body;
  const results = await findNearestCitiesMultiple(cities, distance);
  res.json(results);
});

/**
 * Meta search
 */
routes.post('/', async (req, res, next) => {
  const PER_PAGE2 = parseInt(PER_PAGE, 10);
  const {
    page,
    location,
    cities = [],
    countries = [],
    ownedReposLangsMonths = {},
    distance
  } = req.body;
  console.log(page, location, distance, cities);
  const pageInt = parseInt(page || 1, 10);
  const pagination = {
    limit: PER_PAGE2, // max 20
    skip: PER_PAGE2 * (pageInt - 1)
  };

  const _cities = cities.map(c => c.toLowerCase());
  let citiesResolved = _cities;
  if (distance) {
    const QUERY_DISTANCE_MAX2 = parseInt(QUERY_DISTANCE_MAX, 10);
    const _distance = Math.min(parseInt(distance, 10), QUERY_DISTANCE_MAX2);
    const nearestCities = await findNearestCitiesMultiple(_cities, _distance);
    citiesResolved = [..._cities, ...nearestCities];
  }
  citiesResolved = _.uniq(citiesResolved);

  const profiles = await Profile.find({
    $and: [
      addLocationFilter(location),
      addCities(citiesResolved),
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
