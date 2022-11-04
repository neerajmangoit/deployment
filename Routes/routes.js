const express = require('express');
const countryController = require('../Controllers/countryList');

const router = express.Router();

router.get('/', (req, res) => res.send("HOME"));

router.get('/ndhs-master/country-list', countryController.getCountryList);

router.post('/ndhs-master/comparative-information', countryController.getComparativeInfo);

router.get('/ndhs-master/:year/:country_id/:governance_id', countryController.getGovernanceStats);

router.post('/ndhs-master/top-countries', countryController.getTopCountries);

router.post('/ndhs-master/stats-graph', countryController.getStatsGraph);

router.post('/ndhs-master/stats-table', countryController.getStatsTable);

router.post('/ndhs-master/overview', countryController.getOverview);

router.post('/ndhs-master/comparative', countryController.getComapative);

router.get('/testing', countryController.testing);

module.exports = router;