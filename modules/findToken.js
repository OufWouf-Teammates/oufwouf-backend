function findToken(req) {
  const tokenHere = req.headers.authorization?.split(" ")[1]
  if (tokenHere) {
    return tokenHere
  }
  return false
}

module.exports = { findToken }
