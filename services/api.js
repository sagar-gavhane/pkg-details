const got = require('got')

const getPackage = async (packageName) => {
  return await got(`https://registry.npmjs.org/${packageName}`, {
    responseType: 'json',
  }).then((r) => r.body)
}

const getPackageStats = async (packageName) => {
  return await got(`https://bundlephobia.com/api/size?package=${packageName}`, {
    responseType: 'json',
  }).then((r) => r.body)
}

const getDownloadStats = async (packageName, startDate, endDate) => {
  return await got(`https://api.npmjs.org/downloads/range/${startDate}:${endDate}/${packageName}`, {
    responseType: 'json',
  }).then((r) => r.body)
}

module.exports = {
  getPackage,
  getPackageStats,
  getDownloadStats,
}
