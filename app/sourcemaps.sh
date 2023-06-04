echo "Installing sentry-cli"
curl -sL https://sentry.io/get-cli/ | sh

echo "Injecting sentry debug ids"
sentry-cli sourcemaps inject ./build

echo "Uploading sourcemaps to sentry with release=${GITHUB_SHA}"
sentry-cli sourcemaps upload --release=${GITHUB_SHA} ./build
