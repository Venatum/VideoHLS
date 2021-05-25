const fs = require("fs");
const path = require("path");
const process = require('process');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv))
    .usage('Convert video to HLS')
    .option('input', {
        alias: 'i',
        type: 'string',
        description: 'Path to your video',
        demandOption: true,
        coerce: path.resolve
    })
    .option('output', {
        alias: 'o',
        type: 'string',
        description: 'Output directory path',
        demandOption: true,
        coerce: path.resolve
    })
    .option('ffmpeg', {
        type: 'string',
        description: 'Path to ffmpeg',
    })
    .option('ffprobe', {
        type: 'string',
        description: 'Path to ffmpeg',
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging',
    })
    .check(argv => {
        if (fs.lstatSync(argv.input).isFile())
            return true;
        throw new Error('Argument check failed: Input is not a file.');
    })
    .help()
    .alias('help', 'h')
    .argv

const { whereis, myExec } = require("./src/cmd")
const { generateHLS } = require("./src/ffmpeg");
const M3u8 = require('./src/m3u8');

function getMediaInfos(input, FFPROBE) {
    // ffprobe -v error -print_format json -show_entries stream=index,codec_name,codec_type -show_entries stream_tags MOVIE
    let infos = myExec(FFPROBE, `-v error -print_format json -show_entries stream=index,codec_name,codec_type -show_entries stream_tags ${ input }`)
    return JSON.parse(infos);
}

function cleanPath(path, name) {
    let clean = path.split(name)[1];
    return (clean.charAt(0) === "/") ? clean.substring(1) : clean;
}

function processHLS(outputDir, data) {
    let outputDirName = path.basename(outputDir);
    let m3u8 = new M3u8(outputDir);

    m3u8.addNewLine();
    for (const audio of data.audios) {
        m3u8.addAudio(
            audio.language,
            audio.name,
            cleanPath(audio.file, outputDirName),
            audio.default,
            audio.default,
        );
    }
    m3u8.addNewLine();
    for (const sub of data.subs) {
        m3u8.addSubs(
            sub.language,
            sub.name,
            cleanPath(sub.file, outputDirName));
    }
    m3u8.addNewLine();
    for (const video of data.videos) {
        m3u8.addVideo(
            cleanPath(video.file, outputDirName)
        );
    }
    if (argv.verbose)
        m3u8.debug();
    m3u8.writeFile();
}

function main() {
    const inputPath = argv.input;
    const outputDir = argv.output;

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const FFMPEG = (argv.ffmpeg) ? argv.ffmpeg : whereis("ffmpeg");
    if (!FFMPEG) {
        console.error("ffmpeg not found!");
        process.exit(1)
    }
    if (argv.verbose)
        console.log("You are using ffmpeg from:", FFMPEG);

    const FFPROBE = (argv.ffprobe) ? argv.ffprobe : whereis("ffprobe");
    if (!FFPROBE) {
        console.error("ffprobe not found!");
        process.exit(1)
    }
    if (argv.verbose)
        console.log("You are using ffprobe from:", FFPROBE);

    const infos = getMediaInfos(inputPath, FFPROBE);
    const data = generateHLS(outputDir, inputPath, infos, FFMPEG, argv.verbose);
    processHLS(outputDir, data);
}

main()
