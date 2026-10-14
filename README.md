# Fukhara

Fukhara analyses Android apps (APKs) for threats. You upload an APK, and you get back a report with a verdict.

- [`fukhara-web/`](fukhara-web/) is the web frontend (Nuxt).
- [`awesome-analysis-engine/`](awesome-analysis-engine/) is the backend API and analysis engine (FastAPI).

## What you need

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://docs.docker.com/desktop/) on macOS or Windows, or Docker Engine with the Compose plugin on Linux
- About 15 GB of free disk space and 8 GB of RAM for Docker

You don't need to install anything else. Everything runs in Docker.

## Run it

**1. Clone the repo**

```sh
git clone https://github.com/wlaith/fukhara-bnn-monorepo.git fukhara
cd fukhara
```

**2. Create your `.env` file**

```sh
cp .env.example .env
```

Open `.env` and set these values:

- `MONGO_PASSWORD`: any password you like.
- `MOBSF_API_KEY`: any random string. You can generate one with `openssl rand -hex 32`.
- `VIRUSTOTAL_API_KEY` and `MALWAREBAZAAR_API_KEY`: optional, so you can leave them empty.

**3. Start everything**

Make sure Docker is running, then:

```sh
docker compose up -d --build
```

The first run takes 10 to 20 minutes while the images build. Later starts take seconds.

**4. Open the app**

Go to <http://localhost:3000> and upload an APK.

## Useful links

| URL | What |
| --- | --- |
| <http://localhost:3000> | Fukhara web app |
| <http://localhost:8000/docs> | API docs |
| <http://localhost:8181> | MobSF (login `mobsf` / `mobsf`) |

## Everyday commands

| Command | What it does |
| --- | --- |
| `docker compose up -d` | Start the app |
| `docker compose down` | Stop the app (your data is kept) |
| `docker compose ps` | Show which services are running |
| `docker compose logs -f api` | Show the API logs |
| `docker compose down -v` | Stop the app and **delete all data** |

After pulling new code, start the app with `docker compose up -d --build`. This rebuilds the images so you run the latest version.

## Good to know

- After `docker compose up`, the services `apkid`, `quark-engine`, `androcfg`, `ssdeep`, `apk-info` and `yara-analyzer` show as **Exited**. That's normal. They only build the analysis tools, which the API then runs when needed.
- If a port is already in use, change it in `.env`. The variables are `WEB_PORT`, `API_PORT` and `MOBSF_PORT`.
- If you change `MONGO_USER` or `MONGO_PASSWORD` after the first run, run `docker compose down -v` to reset the database. Otherwise the API can't connect to it.
- This setup is for local use only. You'll be uploading real malware samples, so treat the machine accordingly.
