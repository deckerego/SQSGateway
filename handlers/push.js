'use strict';

module.exports.get = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(event)
  };
};
