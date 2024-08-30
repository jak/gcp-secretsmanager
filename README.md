# @jakspalding/gcp-secretsmanager

Utility to easily fetch secrets from Google's Secret Manager, and to automatically convert environment variables
from a [Berglas](https://github.com/GoogleCloudPlatform/berglas)-style format to their actual values.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation
```sh
npm install @jakspalding/gcp-secretsmanager
```

## API

### retrieveSecret(uri)

Fetches a secret from GCP's Secret Manager

You will need `roles/secretmanager.secretAccessor` role to access secrets.

#### Arguments
- `uri` (string): A URI following Berglas format, e.g. sm://project/name or sm://project/name#version

#### Returns
A string or binary data (Uint8Array). If you know the type, and you are using Typescript, you can provide it
e.g. `retrieveSecret<string>('sm://my-google-project/mysql-password')`


### resolveProcessEnv()
 
Converts all process.env variables from their `sm://` format to the actual secret value.

## Examples

### retrieveSecret

```typescript
const secretsManager = require('@jakspalding/gcp-secretsmanager');

async function printSecret() {
  const secret = 'sm://google-project-name/secret-name'; // you could use process.env here
  const value = await secretsManager.getSecret<string>(secret);
  console.log(secret);
}

printSecret();
```

### resolveProcessEnv

For NextJS, you can use it in `nextjs.config.mjs`:

```js
import { resolveProcessEnv } from '@jakspalding/gcp-secretsmanager';

await resolveProcessEnv();

...nextjs config...
```

This would resolve all environment variables before they are used.


## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.