# Atsuo Coder

## Environment

- Ubuntu 20.04 or 22.04
- Node.js (v18~)
- Docker
- MySQL 8.0
- Redis

## Install

### AtsuoCoder

```sh
git clone https://github.com/atsuo-tech/atsuo-coder
cd atsuo-coder/api
npm run build
```

- `api/static/testcases/.gitkeep` を削除してください。
-  `sample.env` を参考に同じ内容のファイル `.env`、`front/.env` を作成してください。
- `judge-docker/dockerfile` において `CMD ["npm", "start", "judge.w-pcp.net"]` の行のうち `judge.w-pcp.net` をサーバーのIP等に変更してください。ただし、ローカルの際は `localhost` となります。

### MySQL

```sh
npm run install:mysql
```

### Redis

```sh
npm run install:redis
```

## Initialize

### MySQL

```sh
npm run init:mysql
```

## Run

```sh
npm run start
```
