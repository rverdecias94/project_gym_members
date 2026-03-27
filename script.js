const fs = require('fs');
const path = require('path');

const files = [
  'src/components/StoreManagmentGym.jsx',
  'src/components/TrainersForm.jsx',
  'src/components/SettingsAccountShop.jsx',
  'src/components/SettingsAccountGym.jsx',
  'src/components/MembersForm.jsx'
];

files.forEach(file => {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/<span className="text-(red-500|destructive)">\*<\/span>/g, '<span className="text-red-600 font-extrabold text-lg ml-1">*</span>');
    fs.writeFileSync(fullPath, content);
    console.log('Updated ' + file);
  } else {
    console.log('Not found: ' + file);
  }
});
