# Atsuo Coder

## Environment

- Ubuntu 20.04 or 22.04
- Node.js (v18~)
- Docker
- MySQL 8.0
- Redis

## Install

### Node Packages

### AtsuoCoder

```sh
git clone https://github.com/atsuo-tech/atsuo-coder
```

- `api/static/testcases/.gitkeep` を削除してください。
-  `sample.env` を参考に同じ内容のファイル `.env`、`front/.env` を作成してください。
- `judge-docker/dockerfile` において `CMD ["npm", "start", "localhost", "6431"]` の行のうち `localhost` をサーバーのIP等に変更してください。ただし、ローカルの際は `localhost` となります。また、`6431` はポート番号です。`api/src/index.ts:72` にサーバーの起動命令とともにポートの指定があります。

#### TypeScript, MySQL, Redis (AS RQRD)

```sh
npm run install:develop
```

#### FrontEnd Packages

```sh
cd front
npm install
```

#### API Packages

```sh
cd api
npm install
```

## Initialize

### MySQL

```sh
npm run init:mysql
```

### AtsuoCoder

```sh
npm run build
```

## Run

```sh
npm run start
```

### Development

```sh
npm run dev
```
