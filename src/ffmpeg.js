const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function generateHlsSubs(FFMPEG, input, is, dir, file, verbose = false) {
    if (verbose)
        console.log(`# Subs:${ is } -> ${ path.basename(dir) } working...`)
    const out = spawnSync("sh", ["-c", `${ FFMPEG } -hide_banner -loglevel quiet -i '${ input }' -map 0:s:${ is } -f webvtt -  | ${ FFMPEG } -i -  -f segment -segment_time 1800 -segment_list_size 0 -segment_list '${ file }' -segment_format webvtt -scodec copy '${ dir }/sub-%04d.vtt'`], { encoding: 'utf8' });
    if (out.status === 0) {
        if (verbose)
            console.log(`# Subs:${ is } -> done`)
    } else {
        throw out?.stderr
    }
}

// TODO: fix frame size not set
// TODO: Multichannel (stereo, 2.1, 5.1, 5.2, 7.1...)
function generateHlsAudio(FFMPEG, input, ia, dir, file, verbose = false) {
    if (verbose)
        console.log(`# Audio:${ ia } -> ${ path.basename(dir) } working...`)
    const out = spawnSync("sh", ["-c", `${ FFMPEG } -hide_banner -y -loglevel quiet -i '${ input }' -muxdelay 0 -map 0:a:${ ia } -c aac -b:a 128k -ac 2 -vn -sn -f segment -segment_time 6 -segment_list_size 0 -segment_list ${ file } -segment_format mpegts ${ dir }/audio_%04d.aac`], { encoding: 'utf8' });
    if (out.status === 0) {
        if (verbose)
            console.log(`# Audio:${ ia } -> done`)
    } else {
        throw out?.stderr
    }
}

function generateHlsVideo(FFMPEG, input, iv, dir, file, verbose = false) {
    if (verbose)
        console.log(`# Video:${ iv } -> ${ path.basename(dir) } working...`)
    const out = spawnSync("sh", ["-c", `${ FFMPEG } -hide_banner -loglevel quiet -y -i '${ input }' -muxdelay 0 -c:v libx264 -crf 20 -preset veryfast -profile:v main -an -sn -f hls -hls_time 6 -hls_list_size 0 -hls_playlist_type vod -hls_segment_filename ${ dir }/video_%04d.ts ${ file }`], { encoding: 'utf8' });
    if (out.status === 0) {
        if (verbose)
            console.log(`# Video:${ iv } -> done`)
    } else {
        throw out?.stderr
    }
}

module.exports.generateHLS = (outputDir, input, infos, FFMPEG, verbose = false) => {
    const VIDEO_PATH = path.join(outputDir, "video");
    const AUDIO_PATH = path.join(outputDir, "audio");
    const SUBTITLE_PATH = path.join(outputDir, "subtitle");

    let name, dir, file, iv = 0, ia = 0, is = 0, data = {
        videos: [],
        audios: [],
        subs: [],
    };

    for (const stream of infos.streams) {
        switch (stream.codec_type) {
            case "subtitle":
                if (!fs.existsSync(SUBTITLE_PATH)) {
                    fs.mkdirSync(SUBTITLE_PATH);
                }
                name = stream.tags.title || stream.tags.language;
                dir = path.join(SUBTITLE_PATH, name);
                file = path.join(dir, "sub.m3u8");

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }

                data.subs.push({
                    language: stream.tags.language,
                    name: stream.tags.title || stream.tags.language,
                    dir: dir,
                    file: file
                });
                generateHlsSubs(FFMPEG, input, is, dir, file, verbose);
                is++;
                break;
            case "audio":
                if (!fs.existsSync(AUDIO_PATH)) {
                    fs.mkdirSync(AUDIO_PATH);
                }
                name = stream.tags.title || stream.tags.language;
                dir = path.join(AUDIO_PATH, name);
                file = path.join(dir, "audio.m3u8");

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }

                data.audios.push({
                    language: stream.tags.language,
                    name: stream.tags.title || stream.tags.language,
                    dir: dir,
                    file: file,
                    default: ia === 0
                });
                generateHlsAudio(FFMPEG, input, ia, dir, file, verbose);
                ia++;
                break;
            case "video":
                if (stream.codec_name !== "mjpeg") {
                    if (!fs.existsSync(VIDEO_PATH)) {
                        fs.mkdirSync(VIDEO_PATH);
                    }
                    name = stream.tags.title || stream.tags.language;
                    dir = path.join(VIDEO_PATH, name);
                    file = path.join(dir, "video.m3u8");

                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }

                    data.videos.push({
                        language: stream.tags.language,
                        name: stream.tags.title || stream.tags.language,
                        dir: dir,
                        file: file
                    });
                    generateHlsVideo(FFMPEG, input, iv, dir, file, verbose);
                    iv++;
                }
                break;
        }
    }
    return data;
}
