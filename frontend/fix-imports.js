const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src/pages');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/..\/..\/components\/ui\/Button/g, '../../components/buttons/Button');
    content = content.replace(/..\/..\/components\/ui\/Card/g, '../../components/cards/Card');
    content = content.replace(/..\/..\/components\/ui\/Input/g, '../../components/forms/Input');
    content = content.replace(/..\/..\/components\/ui\/Badge/g, '../../components/common/Badge');
    content = content.replace(/..\/..\/components\/ui\/Modal/g, '../../components/modals/Modal');
    fs.writeFileSync(filePath, content, 'utf8');
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            replaceInFile(fullPath);
        }
    }
}

traverse(directoryPath);
console.log("Imports updated successfully!");
