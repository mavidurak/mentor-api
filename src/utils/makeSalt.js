import crypto from 'crypto';

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
export default (length) => crypto
  .randomBytes(Math.ceil(length / 2))
  .toString('hex') /** convert to hexadecimal format */
  .slice(0, length); /** return required number of characters */
