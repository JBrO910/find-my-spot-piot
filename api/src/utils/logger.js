const LogLevel = {
    TRACE: 0, DEBUG: 1, INFO: 2, WARN: 3, ERROR: 4,
}
const LogLevelNames = {
    [LogLevel.TRACE]: 'trace', [LogLevel.DEBUG]: 'debug', [LogLevel.INFO]: 'info', [LogLevel.WARN]: 'warn', [LogLevel.ERROR]: 'error',
}

const RawConsoleColors = {
    'Reset': '\x1b[0m',
    'Bright': '\x1b[1m',
    'Dim': '\x1b[2m',
    'Underscore': '\x1b[4m',
    'Blink': '\x1b[5m',
    'Reverse': '\x1b[7m',
    'Hidden': '\x1b[8m',

    'FgBlack': '\x1b[30m',
    'FgRed': '\x1b[31m',
    'FgGreen': '\x1b[32m',
    'FgYellow': '\x1b[33m',
    'FgBlue': '\x1b[34m',
    'FgMagenta': '\x1b[35m',
    'FgCyan': '\x1b[36m',
    'FgWhite': '\x1b[37m',

    'BgBlack': '\x1b[40m',
    'BgRed': '\x1b[41m',
    'BgGreen': '\x1b[42m',
    'BgYellow': '\x1b[43m',
    'BgBlue': '\x1b[44m',
    'BgMagenta': '\x1b[45m',
    'BgCyan': '\x1b[46m',
    'BgWhite': '\x1b[47m',
}

const ConsoleColors = {
    [LogLevel.WARN]: [229, 192, 123],
    [LogLevel.INFO]: [97, 175, 239],
    success: [152, 195, 121],
    default: [171, 178, 191],
    [LogLevel.TRACE]: [171, 178, 191],
    [LogLevel.ERROR]: [224, 108, 117],
    [LogLevel.DEBUG]: [86, 182, 194],
}

const asciiForeground = ([r, g, b]) => `\x1b[38;2;${ r };${ g };${ b }m`

const LevelColors = (level) => asciiForeground(
    ConsoleColors[level]) + RawConsoleColors.Bright + RawConsoleColors.Reverse
const formatLevel = (level) => `${ LevelColors(level) } ${ LogLevelNames[level].toUpperCase()
    .padEnd(5) } ${ RawConsoleColors.Reset } `
const formatMessagePrefix = (level, meta) => {
    const LEVEL = formatLevel(level)

    const COLOR_RESET = RawConsoleColors.Reset
    const COLOR_DATE = asciiForeground(ConsoleColors[level])
    const COLOR_TAG = asciiForeground(ConsoleColors.success) + RawConsoleColors.Underscore

    const date = new Date().toLocaleTimeString("en-us", {
        year: "numeric",
        month: "short",
        day: "numeric"
    })

    return `${ LEVEL }${ COLOR_DATE }[${ date }]${ COLOR_RESET } ${ COLOR_TAG }${ meta.tag }${ COLOR_RESET }:`
}

const makeLog = (level) => (message, meta, ...additionalInfo) => console.log(
    formatMessagePrefix(level, meta), message, ...additionalInfo)
const traceLog = makeLog(LogLevel.TRACE)
const debugLog = makeLog(LogLevel.DEBUG)
const infoLog = makeLog(LogLevel.INFO)
const warnLog = makeLog(LogLevel.WARN)
const errorLog = makeLog(LogLevel.ERROR)

const defaultTag = 'FindMySpot'

export const Log = {
    meta: {
        tag: defaultTag,
    },
    level: LogLevel.TRACE,
    // level: LogLevel.DEBUG,
    tag(tag) {
        this.meta.tag = tag
        return this
    },
    trace(message, ...additionalInfo) {
        if (this.level > LogLevel.TRACE) {
            return
        }
        traceLog(message, this.meta, ...additionalInfo)
        this.tag(defaultTag)
    },
    info(message, ...additionalInfo) {
        if (this.level > LogLevel.INFO) {
            return
        }
        infoLog(message, this.meta, ...additionalInfo)
        this.tag(defaultTag)
    },
    debug(message, ...additionalInfo) {
        if (this.level > LogLevel.DEBUG) {
            return
        }
        debugLog(message, this.meta, ...additionalInfo)
        this.tag(defaultTag)
    },
    warn(message, ...additionalInfo) {
        if (this.level > LogLevel.WARN) {
            return
        }
        warnLog(message, this.meta, ...additionalInfo)
        this.tag(defaultTag)
    },
    error(message, ...additionalInfo) {
        if (this.level > LogLevel.ERROR) {
            return
        }
        errorLog(message, this.meta, ...additionalInfo)
        this.tag(defaultTag)
    },
}
