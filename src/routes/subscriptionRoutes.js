import { Router } from 'express';
import chargebee from 'chargebee';
import { ensureAuth } from '../utils/socialAuth';
import { rejects } from 'assert';
import logger from '../logger';
import { verifyToken } from '../utils/initOkta';

const { CHARGEBEE_SITE, CHARGEBEE_API_KEY } = process.env;

chargebee.configure({
  site: CHARGEBEE_SITE,
  api_key: CHARGEBEE_API_KEY
});

// chargebee.subscription.retrieve('<<PAYMENT ID HERE>>').request(function(error, result) {
//   if (error) {
//     //handle error
//     console.log(error);
//   } else {
//     console.log(result);
//     var subscription = result.subscription;
//     var customer = result.customer;
//     var card = result.card;
//   }
// });

const routes = Router();

routes.post('/new', verifyToken, (req, res) => {
  const { plan } = req.body;

  if (!plan) {
    return res.error({ error: 'No plan specified' });
  }

  chargebee.hosted_page
    .checkout_new({
      billing_address: {
        first_name: 'John',
        last_name: 'Doe',
        line1: 'PO Box 9999',
        city: 'Walnut',
        state: 'California',
        zip: '91789',
        country: 'US'
      },
      subscription: {
        plan_id: 'cbdemo_grow'
      },
      customer: {
        email: 'john@user.com',
        first_name: 'John',
        last_name: 'Doe',
        locale: 'fr-CA',
        phone: '+1-949-999-9999'
      }
    })
    .request((error, result) => {
      // handle error if found
      if (error) {
        logger.error(error);
        return res.error({
          error: 'No plan specified'
        });
      }

      // successful response
      logger.info(result);
      return res.json({
        page: result.hosted_page
      });
    });

  res.json({ message: 'Payment routes backend' });
});

routes.get('/curr', ensureAuth, (req, res, next) => {
  res.json({ user: req.user });
});

export default routes;
