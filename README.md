# Dotify

In backend, provide your .mp3 assets in the <i>public</i> directory:
```
backend/public/DarudeSandstorm.mp3
```
Dotify backend uses provided .mp3 metadata to display information to the end user, thus empty metadata will result in the song showing as grayed out.

Provide a <i>db.json</i> file in the root directory of the backend of given structure:

```json
{
  "songs": [
    {
      "id": 1,
      "name": "DarudeSandstorm.mp3",
      "deezer_artist_id": 25
    },
  ...
  ]
}
```
Failing to provide this data will result in no fetching of additional artist data. (fancounts, banners, etc.)

Dev server start:

```bash
ng serve
```

Backend dev start:
```bash
npm run dev
```

Compile production build:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

```bash
ng test
```

## Running end-to-end tests

```bash
ng e2e
```

This project does not have testing as of now.
