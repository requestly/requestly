echo "Installing sentry-cli"
curl -sL https://sentry.io/get-cli/ | SENTRY_CLI_VERSION="2.20.3" sh

echo "Injecting sentry debug ids"
sentry-cli sourcemaps inject ./build

echo "Uploading sourcemaps to sentry with release=${GITHUB_COMMIT_SHA}"
sentry-cli sourcemaps upload --release=${GITHUB_COMMIT_SHA} ./build

echo "Creating sentry release"
sentry-cli releases new "${GITHUB_COMMIT_SHA}" --finalize