# VideoHLS

## Requirements

- [ffmpeg](https://ffmpeg.org/) with ffprobe

## Installation

Use the package manager [npm](https://www.npmjs.com/get-npm) to dependencies.

```bash
npm install
```

## Usage

```bash
$> npm run start -- --help
# OR
$> node app.js --help
Convert video to HLS

Options:
      --version  Show version number                                   [boolean]
  -i, --input    Path to your video                          [string] [required]
  -o, --output   Output directory path                       [string] [required]
      --ffmpeg   Path to ffmpeg                                         [string]
      --ffprobe  Path to ffmpeg                                         [string]
  -v, --verbose  Run with verbose logging                              [boolean]
  -h, --help     Show help                                             [boolean]

# Example
$> npm run start -- -i bbb.mkv -o media/bbb -v
```

## Demo

You can use [VideoJS player](https://github.com/videojs/http-streaming) from http-streaming in demo folder with:

```bash
npx http-server --cors="*" -c-1 .
```

## License
>You can check out the full license [here](LICENSE)

This project is licensed under the terms of the **MIT** license.
