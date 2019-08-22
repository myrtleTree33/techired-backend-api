import { Router } from 'express';
import _ from 'lodash';
import moment from 'moment';

import Authify from 'authifyjs';

import Profile from '../models/Profile';
import { findNearestCitiesMultiple } from '../services/geolocationService';
import logger from '../logger';

const { PER_PAGE, QUERY_DISTANCE_MAX } = process.env;
const PER_PAGE2 = parseInt(PER_PAGE, 10);
const QUERY_DISTANCE_MAX2 = parseInt(QUERY_DISTANCE_MAX, 10);

const routes = Router();

const addCompanyFilter = company => (!company ? {} : { company: new RegExp(company, 'i') });

const addBioFilter = bio => (!bio ? {} : { bio: new RegExp(bio, 'i') });

const addRemoveUnscrapedEntries = () => ({ createdAt: { $exists: true } });

const addLocationFilter = location => (!location ? {} : { $text: { $search: `${location}` } });

const addCities = cities => {
  if (cities.length === 0) {
    return {};
  }

  const cities2 = cities.map(c => c.trim().toLowerCase());
  return { cities: { $in: cities2 } };
};

const addCountries = countries => {
  if (countries.length === 0) {
    return {};
  }

  const countries2 = countries.map(c => c.trim().toLowerCase());
  return { countries: { $in: countries2 } };
};

const processTuple = val => {
  if (!val) {
    return [0, 0];
  }

  if (!Array.isArray(val)) {
    try {
      const min = parseInt(val, 10);
      return [min, null];
    } catch (err) {
      return [0, 0];
    }
  }

  if (val.length >= 2) {
    try {
      return [parseInt(val[0], 10), parseInt(val[1], 10)];
    } catch (err) {
      return [0, 0];
    }
  }

  try {
    return [parseInt(val[0], 10), null];
  } catch (err) {
    return [0, 0];
  }
};

const genMonthsQuery = tuple => {
  const query = {};
  if (tuple[0]) {
    query['$lte'] = moment()
      .subtract(tuple[0], 'months')
      .toDate();
  }

  if (tuple[1]) {
    query['$gte'] = moment()
      .subtract(tuple[1], 'months')
      .toDate();
  }

  return query;
};

const addLangExperience = ownedReposLangs => {
  if (Object.keys(ownedReposLangs).length === 0) {
    return {};
  }

  const keys = Object.keys(ownedReposLangs);
  const query = keys.map(k => {
    const tuple = processTuple(ownedReposLangs[k]);
    return {
      [`ownedReposLangsEarliest.${k}`]: genMonthsQuery(tuple)
    };
  });

  return {
    $or: query
  };
};

const addNumFollowers = (numFollowers = []) => {
  const query = {};
  const numFollowersArr = Array.isArray(numFollowers) ? numFollowers : [numFollowers, null];

  if (!numFollowersArr || numFollowersArr.length === 0) {
    return {};
  }

  // ensure min and max bounds always present
  if (numFollowersArr.length === 1) {
    numFollowersArr.push(null);
  }

  const [min, max] = numFollowersArr;

  if (min && !isNaN(min)) {
    query['$gte'] = min;
  }

  if (max && !isNaN(max)) {
    query['$lte'] = max;
  }

  return {
    numFollowers: query
  };
};

const addNumFollowing = (numFollowing = []) => {
  const query = {};
  const numFollowingArr = Array.isArray(numFollowing) ? numFollowing : [numFollowing, null];

  if (!numFollowingArr || numFollowingArr.length === 0) {
    return {};
  }

  // ensure min and max bounds always present
  if (numFollowingArr.length === 1) {
    numFollowingArr.push(null);
  }

  const [min, max] = numFollowingArr;
  if (min) {
    query['$gte'] = min;
  }

  if (max) {
    query['$lte'] = max;
  }

  return {
    numFollowing: query
  };
};

const findNearestCities = async (req, res) => {
  const { cities = [], distance } = req.body;
  const results = await findNearestCitiesMultiple(cities, distance);
  res.json(results);
};

const superSearch = async (req, res, next) => {
  try {
    const {
      page,
      location,
      cities = [],
      company,
      bio,
      countries = [],
      ownedReposLangsMonths = {},
      distance,
      numFollowers = [],
      numFollowing = []
    } = req.body;

    logger.info(page, location, distance, cities);

    const pageInt = parseInt(page || 1, 10);
    const pagination = { limit: PER_PAGE2, skip: PER_PAGE2 * (pageInt - 1) };

    const _cities = cities.map(c => c.toLowerCase());
    let citiesResolved = _cities;
    if (distance) {
      const _distance = Math.min(parseInt(distance, 10), QUERY_DISTANCE_MAX2);
      const nearestCities = await findNearestCitiesMultiple(_cities, _distance);
      citiesResolved = [..._cities, ...nearestCities];
    }

    citiesResolved = _.uniq(citiesResolved);

    const profiles = await Profile.find({
      $and: _.uniq([
        addLocationFilter(location),
        addRemoveUnscrapedEntries(),
        // addCities(citiesResolved),
        // addCountries(countries),
        addLangExperience(ownedReposLangsMonths),
        addNumFollowers(numFollowers),
        addNumFollowing(numFollowing),
        addCompanyFilter(company),
        addBioFilter(bio)
      ])
    })
      .sort({ _id: -1 })
      .limit(pagination.limit)
      .skip(pagination.skip);

    logger.info(`${profiles.length} profiles found.`);
    res.json(profiles);
  } catch (err) {
    logger.error(err);
    res.json([]);
  }
};

routes.post('/nearestcities', findNearestCities);
routes.post('/', Authify.ensureAuth, superSearch);

export default routes;
