echo "Feching origin..."

git pull

yarn

echo "Building project..."

yarn build

pm2 restart ecosystem.config.js

echo "Done."