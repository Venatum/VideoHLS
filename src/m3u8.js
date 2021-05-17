const fs = require('fs');
const path = require('path');

// https://en.wikipedia.org/wiki/M3U

class M3u8 {
    constructor(outputDir) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        this.outputDir = outputDir;
        this.output = "#EXTM3U\n#EXT-X-VERSION:3\n";
    }

    /**
     * Add audio in M3U8 file
     * @param {string} language
     * @param {string} name
     * @param {string | null} uri
     * @param {boolean} autoselect
     * @param {boolean} useDefault
     * @param {string} groupId
     */
    // #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="bipbop_audio",LANGUAGE="eng",NAME="BipBop Audio 2",AUTOSELECT=NO,DEFAULT=NO,URI="alternate_audio_aac_sinewave/prog_index.m3u8"
    addAudio(language, name, uri = null, autoselect = false, useDefault = false, groupId = "audio") {
        this.output += `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="${ groupId }",LANGUAGE="${ language }",NAME="${ name }",AUTOSELECT=${ autoselect ? "YES" : "NO" },DEFAULT=${ useDefault ? "YES" : "NO" }`;
        if (uri)
            this.output += `,URI="${ uri }"`;
        this.output += "\n";
    }

    /**
     * Add subs in M3U8 file
     * @param {string} language
     * @param {string} name
     * @param {string | null} uri
     * @param {boolean} autoselect
     * @param {boolean} forced
     * @param {boolean} useDefault
     * @param {string} groupId
     */
    // #EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="Français",DEFAULT=NO,AUTOSELECT=YES,FORCED=NO,LANGUAGE="fr",CHARACTERISTICS="public.accessibility.transcribes-spoken-dialog, public.accessibility.describes-music-and-sound",URI="subtitles/fra/prog_index.m3u8"
    // #EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="Français (Forced)",DEFAULT=NO,AUTOSELECT=NO,FORCED=YES,LANGUAGE="fr",URI="subtitles/fra_forced/prog_index.m3u8"
    addSubs(language, name, uri = null, autoselect = false, forced = false, useDefault = false, groupId = "subs") {
        this.output += `#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="${ groupId }",NAME="${ name }",DEFAULT=${ useDefault ? "YES" : "NO" },AUTOSELECT=${ autoselect ? "YES" : "NO" },FORCED=${ forced ? "YES" : "NO" },LANGUAGE="${ language }"`;
        if (uri)
            this.output += `,URI="${ uri }"`;
        this.output += "\n";
    }

    /**
     * Add video in M3U8 file
     * @param {string} uri
     * @param {number | null} bandwidth
     * @param {string | null} codecs
     * @param {string} resolution
     * @param {string} audioId
     * @param {string} subId
     */
    // #EXT-X-STREAM-INF:BANDWIDTH=1924009,CODECS="mp4a.40.2, avc1.4d401f",RESOLUTION=1920x1080,AUDIO="bipbop_audio",SUBTITLES="subs"
    // gear5/prog_index.m3u8
    addVideo(uri, bandwidth = null, codecs = null, resolution = "1920x1080", audioId = "audio", subId = "subs") {
        this.output += '#EXT-X-STREAM-INF:';
        if (bandwidth)
            this.output += `BANDWIDTH=${ bandwidth },`;
        if (codecs)
            this.output += `CODECS="${ codecs }",`;
        this.output += `RESOLUTION=${ resolution },AUDIO="${ audioId }",SUBTITLES="${ subId }"\n`;
        this.output += `${ uri }\n`;
    }

    addNewLine() {
        this.output += '\n';
    }

    writeFile() {
        // TODO: errors
        fs.writeFileSync(path.join(this.outputDir, "master.m3u8"), this.output);
    }

    debug() {
        console.log(this.output);
    }
}

module.exports = M3u8;