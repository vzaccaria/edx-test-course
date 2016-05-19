let chalk = require('chalk')
let _ = require('zaccaria-cli')._

function warn(msg) {
    if(_.isUndefined(process.env['SILENT'])) {
        console.error(chalk.yellow('WARN: ') + msg);
    }
}

function info(msg) {
    if(_.isUndefined(process.env['SILENT'])) {
        console.error(chalk.blue('INFO: ') + msg);
    }
}

function error(msg) {
    if(_.isUndefined(process.env['SILENT'])) {
        console.error(chalk.red(' ERR: ') + msg);
    }
}

function ok(msg) {
    if(_.isUndefined(process.env['SILENT'])) {
        console.error(chalk.green('  OK: ') + msg);
    }
}

module.exports = { warn, info, error, ok }
