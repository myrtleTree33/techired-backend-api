import _ from 'lodash';
import City from '../models/City';

export async function findNearestCities(city, distance = 0) {
  if (!city) {
    return [];
  }

  const citySanitized = city.trim().toLowerCase();
  const distSanitized = parseInt(distance, 10);

  const query = {
    cityName: citySanitized
  };

  const rootCity = await City.findOne(query);

  if (!rootCity) {
    return [];
  }

  const { coordinates } = rootCity.loc;

  const nearestCities = await City.find({
    loc: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $minDistance: 0,
        $maxDistance: distSanitized
      }
    }
  });

  return nearestCities;
}

export async function findNearestCitiesMultiple(cities = [], distance = 0) {
  let cities2 = cities.map(c => c.trim().toLowerCase());
  cities2 = _.uniq(cities2);
  const promises = cities2.map(c => findNearestCities(c, distance));
  let results = await Promise.all(promises);
  results = _.flatten(results);
  return results.map(c => c.cityName);
}
