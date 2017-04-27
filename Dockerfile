FROM node:6.10.0-slim
MAINTAINER "Tim Evans <tim.c.evans@me.com>"

RUN apt-key adv --fetch-keys http://dl.yarnpkg.com/debian/pubkey.gpg && \
    echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update

WORKDIR /usr/src/app

COPY engine.json package.json yarn.lock ./

RUN apt-get install -y git jq yarn && \
    yarn install && \
    version="v$(npm -j ls ember-template-lint | jq -r '.dependencies["ember-template-lint"].version')" && \
    cat engine.json | jq ".version = \"$version\"" > /engine.json && \
    apt-get purge -y git jq yarn && \
    apt-get autoremove --yes

RUN adduser -u 9000 --disabled-password app

COPY . ./
RUN chown -R app:app ./

USER app
VOLUME /code
WORKDIR /code

CMD ["/usr/src/app/bin/ember-template-lint.js"]
