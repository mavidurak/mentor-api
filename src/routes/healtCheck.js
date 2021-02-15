const express = require('express');

module.exports = function(app) {
  const router = express.Router();

  router.get('/', function (req, res, next) {
    res.status(200).send({
      message: 'OK',
    });
  });

  app.use("/health-check", router);
}
