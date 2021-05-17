const { spawnSync } = require("child_process");

/**
 * Get path with wheris
 * @returns {string} path
 */
module.exports.whereis = (cmd) => {
    const out = spawnSync("whereis", [cmd], { encoding : 'utf8' });
    if (out.status === 0) {
        let tab = out.stdout.split(" ");
        return tab[1];
    } else {
        throw out.stderr
    }
}

/**
 * Exec cmd
 * @param bin
 * @param cmd
 * @returns {any}
 */
module.exports.myExec = (bin, cmd) => {
    let options = cmd.split(" ");
    const out = spawnSync(bin, options, { encoding : 'utf8' });
    if (out.status === 0) {
        return out.stdout;
    } else {
        throw out.stderr
    }
}
