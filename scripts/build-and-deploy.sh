#!/usr/bin/env bash

echo -e "\n==================== Linting ====================\n"

ENV=$1
SKIP_ITEST=$2
SOURCE_DIR=`pwd`
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"


npm install


echo -e "\n==================== Unit testing ====================\n"
npm run jenkins-test

if [ "$2" != true ] ; then
    npm run jenkins-itest
    echo -e "\n==================== Integration testing ====================\n"
else
    echo -e "\n==================== Skipping integration tests ========================\n"
fi

echo -e "\n==================== Packaging ====================\n"
mkdir dist
echo date > dist/artifact.txt
echo "Build: ${BUILD_NUMBER}" >> dist/artifact.txt

