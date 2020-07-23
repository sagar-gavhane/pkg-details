const downloadSum = (downloads) => {
  return downloads.reduce((prev, currentValue) => prev + currentValue.downloads, 0)
}

module.exports = downloadSum
