#!/usr/bin/env node

const chalk = require('chalk')
const argv = require('minimist')(process.argv.slice(2))
const terminalLink = require('terminal-link')
const ora = require('ora')
const { subDays, format, parseISO, formatDistance } = require('date-fns')

const { getPackage, getPackageStats, getDownloadStats } = require('./services/api')
const clear = require('./utils/clear')
const br = require('./utils/br')
const downloadSum = require('./utils/downloadSum')
const readablizeBytes = require('./utils/readablizeBytes')

const spinner = ora('Loading package details...')

// handle unhandled rejections
process.on('unhandledRejection', (err) => {
  // clear()
  spinner.clear()
  console.log(chalk.red(`Failed while fetching package details :(`))
  process.exit()
})

const log = console.log

const tl = (...args) => chalk.blueBright(terminalLink(...args))

if (!Array.isArray(argv._) || !argv._.length) {
  log(chalk.bold.red('Please provide package name.'))
  return
}

const pkgName = argv._[0]

const init = async () => {
  // fetch package stats
  spinner.start()
  const [package, packageStats, weeklyDownloadStats, monthlyDownloadStats] = await Promise.all([
    await getPackage(pkgName),
    await getPackageStats(pkgName),
    await getDownloadStats(pkgName, format(subDays(new Date(), 7), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')),
    await getDownloadStats(pkgName, format(subDays(new Date(), 28), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')),
  ])
  spinner.stop()

  const npmhome = `https://www.npmjs.com/package/${pkgName}`
  const homepage = package.homepage || npmhome
  const tlConfig = { fallback: false }
  const latestVersion = `${package['dist-tags'].latest}`
  const numberOfDeps = Object.keys(package.versions[latestVersion].dependencies).length
  const numberOfVersions = Object.keys(package.versions).length
  const repositoryUrl = package.repository.url.replace('git+', '')
  const lastPublished = package.time[latestVersion]

  // printout
  clear()
  br()
  log(
    chalk.green.underline.bold(`${pkgName}@v${latestVersion}`),
    `| ${package.license} | deps: ${chalk.cyan(numberOfDeps)} | versions: ${chalk.cyan(numberOfVersions)}`,
    `| minified: ${chalk.cyan(readablizeBytes(packageStats.size))} | gzip: ${chalk.cyan(
      readablizeBytes(packageStats.gzip)
    )}`
  )
  console.log(`${package.description}`)
  br()

  console.log(chalk.yellow.bold('versions:'))
  for (const key in package['dist-tags']) {
    console.log(`${key}: ${chalk.cyan(package['dist-tags'][key])}`)
  }
  br()

  console.log(chalk.yellow.bold('downloads:'))
  console.log(`weekly: ${chalk.cyan(downloadSum(weeklyDownloadStats.downloads))}`)
  console.log(`monthly: ${chalk.cyan(downloadSum(monthlyDownloadStats.downloads))}`)

  br()
  console.log(chalk.yellow.bold('links:'))
  console.log(`README: ${tl(homepage, homepage, tlConfig)}`)
  console.log(`npm: ${tl(npmhome, npmhome, tlConfig)}`)
  console.log(`repository: ${tl(repositoryUrl, repositoryUrl, tlConfig)}`)

  br()
  console.log(chalk.yellow.bold('dates:'))
  // 2020-03-19T19:53:13.309Z
  console.log(`last published: ${formatDistance(parseISO(lastPublished), new Date())}`)
  console.log(`created at: ${formatDistance(parseISO(package.time.created), new Date())}`)

  br()
  console.log(chalk.yellow.bold('maintainers:'))
  package.maintainers.forEach((maintainer) => {
    console.log(`- ${maintainer.name} [${tl(maintainer.email, `mailto:${maintainer.email}`)}]`)
  })
}

init()
