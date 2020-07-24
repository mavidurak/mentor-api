export default (req, res, next) => {
  let url = req._parsedUrl.pathname;
  if (!url.endsWith('/')) {
    url += '/';
  }

  req.fixed_url = url;

  next();
};
