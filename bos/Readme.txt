## Requirements

Node 8 (or newer) and any modern web-browser.

## Installation

> `localhost:8000` by default.

### Demo

Make a Copy of local.js from local.js.example under the client and server project. 

You can run a demo using docker without checkout out any source-code:

```
docker run -p 8000:8000 osjs/osjs:v3
```

# Install dependencies
npm install
# To override client config.js values
Create a file called local.js and override any property that can be added in config.js
This local.js is specific to the local instance and never checked in.

# It's recommended that you keep your dependencies (including OS.js) up-to-date
npm update

# Optionally install extra packages:
# For a list of packages, see https://manual.os-js.org/v3/resource/official/
npm install --production @osjs/example-application

# Discover installed packages
npm run package:discover

# Build your client
npm run build

# Start serving
npm run serve
``` 

#### Docker

You can also build a Docker image yourself or use docker-compose:

```
cp .env.example .env
docker-compose up
```