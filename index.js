const fs = require('fs')
const _path = require('path')
const crypto = require('crypto')

const ALGORITHM = 'sha1'
const SERVER_MANIFEST_BASE = fs.readFileSync('modpack/server-manifest.base.json',{encoding:'utf8'});
// const BACK = fs.readFileSync('modpack/server-manifest.json.back',{encoding:'utf8'})
function hashFile(filepath, rootpath) {
    let files = fs.readdirSync(filepath, {withFileTypes: true})
    let result = [];
    files.forEach((file) => {
        if (file.isDirectory()) {
            result.push(...hashFile(_path.join(filepath, file.name), rootpath))
        } else if (file.isFile()) {
            let path = _path.join(filepath, file.name)
            let bin = fs.readFileSync(path)
            let hash = crypto.createHash(ALGORITHM).update(bin).digest('hex')
            result.push(
                {
                    path: _path.relative(_path.normalize(rootpath), path),
                    hash: hash
                })
        }
    })
    return result;
}

let fileHashes = hashFile('modpack/overrides', 'modpack/overrides');
let server_manifest = JSON.parse(SERVER_MANIFEST_BASE)
server_manifest.files = fileHashes;
console.log('总计'+server_manifest.files.length+'个文件')
console.log('写入server-manifest.json')
fs.writeFileSync('modpack/server-manifest.json',JSON.stringify(server_manifest,null,'\t'),{encoding:'utf8'})
