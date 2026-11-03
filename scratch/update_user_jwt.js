const fs = require('fs');
const file = '../backend-quantri-longwedding/backend-admin-longwedding/src/services/user.service.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'const token = jwt.sign(\r\n            { username: user.username, fullname: user.fullname, isRemember },',
    'const token = jwt.sign(\r\n            { username: user.username, fullname: user.fullname, positon: user.positon, permission: user.permission, isRemember },'
);

content = content.replace(
    'const token = jwt.sign(\n            { username: user.username, fullname: user.fullname, isRemember },',
    'const token = jwt.sign(\n            { username: user.username, fullname: user.fullname, positon: user.positon, permission: user.permission, isRemember },'
);

content = content.replace(
    'const newToken = jwt.sign(\r\n            { username: user.username, fullname: user.fullname, isRemember: true },',
    'const newToken = jwt.sign(\r\n            { username: user.username, fullname: user.fullname, positon: user.positon, permission: user.permission, isRemember: true },'
);

content = content.replace(
    'const newToken = jwt.sign(\n            { username: user.username, fullname: user.fullname, isRemember: true },',
    'const newToken = jwt.sign(\n            { username: user.username, fullname: user.fullname, positon: user.positon, permission: user.permission, isRemember: true },'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Updated user.service.js successfully!');

