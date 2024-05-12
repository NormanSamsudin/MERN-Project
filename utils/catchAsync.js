// method to remove try and catch block and make code more easy to understand
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
