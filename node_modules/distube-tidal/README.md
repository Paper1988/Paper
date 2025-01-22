[![NPM](https://nodei.co/npm/distube-tidal.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/distube-tidal/)

![NPM peer Dependency Version](https://img.shields.io/npm/dependency-version/distube-tidal/peer/distube?style=flat-square)
![NPM Downloads](https://img.shields.io/npm/dt/distube-tidal?style=flat-square&logo=npm)
![GitHub Repo stars](https://img.shields.io/github/stars/LakhindarPal/distube-tidal?style=flat-square&logo=github&logoColor=white)

# distube-tidal

A DisTube info extractor plugin for supporting Tidal Music.

[_What is an info extractor plugin?_](https://github.com/skick1234/DisTube/wiki/Projects-Hub#plugins)

## Installation

```sh
npm install distube-tidal@latest
```

## Usage

```ts
import { DisTube } from "distube";
import { TidalPlugin } from "distube-tidal";

const distube = new DisTube(client, {
  plugins: [new TidalPlugin()],
});
```
