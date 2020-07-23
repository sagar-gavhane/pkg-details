const readablizeBytes = (bytes) => {
  var s = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  var e = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + s[e]
}

module.exports = readablizeBytes
