# Start Scripts Guide

This project includes two launcher scripts for local development:

- `start.sh` for Bash/Git Bash/WSL/macOS/Linux-style shells
- `start.ps1` for PowerShell on Windows

Both scripts are intended to install dependencies when needed and then start the selected development workflow.

## Default workflow

### Bash

```bash
./start.sh
```

### PowerShell

```powershell
.\start.ps1
```

The default behavior runs:

1. `install`
2. `dev`

The `dev` command starts:

- Portal web app in the browser
- Content Generator web app in the browser
- Ops Hub web app in the browser
- EduMatch web app in the browser
- `mobile-next` dev server for Capacitor
- `mobile-next` Android app on a connected Android device or emulator

The old Flutter `apps/mobile` app is not started by these scripts.

## Commands

| Command | Description |
| --- | --- |
| `install` | Install workspace dependencies using `pnpm install`. |
| `build` | Build all apps using the workspace build command. |
| `dev` | Start all browser apps plus `mobile-next` on Android. |
| `dev:web` | Start browser apps only, without running Android. |
| `dev:portal` | Start only the portal app. |
| `dev:ops` | Start only the ops-hub app. |
| `dev:edumatch` | Start only the edumatch app. |
| `dev:mobile-next` | Start only the `mobile-next` Next.js dev server. |
| `mobile-next:android` | Build `mobile-next`, sync Capacitor Android, then open Android Studio. |
| `mobile-next:run:android` | Build `mobile-next`, sync Capacitor Android, then run on an Android device or emulator. |
| `db:push` | Push the Prisma schema to the configured local database. |
| `db:seed` | Run the database seed. |
| `db:reset` | Force-reset the database, push schema, and seed. |
| `clean` | Run the workspace clean command. |

## Common usage

### Start everything

Bash:

```bash
./start.sh
```

PowerShell:

```powershell
.\start.ps1
```

### Start browser apps only

Bash:

```bash
./start.sh dev:web
```

PowerShell:

```powershell
.\start.ps1 dev:web
```

### Start only mobile-next web server

Bash:

```bash
./start.sh dev:mobile-next
```

PowerShell:

```powershell
.\start.ps1 dev:mobile-next
```

### Open mobile-next in Android Studio

Bash:

```bash
./start.sh mobile-next:android
```

PowerShell:

```powershell
.\start.ps1 mobile-next:android
```

### Run mobile-next on Android

Bash:

```bash
./start.sh mobile-next:run:android
```

PowerShell:

```powershell
.\start.ps1 mobile-next:run:android
```

If multiple Android devices or emulators are available, Capacitor may ask you to choose one.

## Configuration

### Change mobile-next port

The default `mobile-next` port is `3002`.

Bash:

```bash
PORT=3003 ./start.sh dev
```

PowerShell:

```powershell
$env:PORT = "3003"
.\start.ps1 dev
```

### Select a specific Android target

Use `ANDROID_TARGET` when you know the target device or emulator id.

To find available Capacitor Android targets, run:

Bash:

```bash
pnpm --dir ./apps/mobile-next exec cap run android --list
```

PowerShell:

```powershell
pnpm --dir .\apps\mobile-next exec cap run android --list
```

The output will show target names/ids for connected devices and emulators. Use the exact target id with `ANDROID_TARGET`.

You can also check Android Debug Bridge directly:

Bash or PowerShell:

```bash
adb devices
```

Example output:

```text
List of devices attached
ZY22JS2RFH    device
emulator-5554 device
```

In this example, valid device ids are:

- `ZY22JS2RFH`
- `emulator-5554`

Bash:

```bash
ANDROID_TARGET=ZY22JS2RFH ./start.sh dev
```

PowerShell:

```powershell
$env:ANDROID_TARGET = "ZY22JS2RFH"
.\start.ps1 dev
```

## Requirements

For browser app development:

- Node.js `>=20`
- pnpm `10.x`

For Android mobile development:

- Android Studio installed
- Android SDK installed
- An Android emulator or USB-connected Android phone
- USB debugging enabled on the phone when using a physical device

## Troubleshooting

### `bash` is not available on Windows

Use PowerShell instead:

```powershell
.\start.ps1 dev
```

Or install/use Git Bash or WSL to run:

```bash
./start.sh dev
```

### Android device is not detected

Check that your device is visible to ADB:

```powershell
adb devices
```

If it is not listed:

- Enable Developer Options on the phone
- Enable USB debugging
- Accept the USB debugging prompt on the phone
- Restart Android Studio or the terminal

### Multiple Android targets are shown

Either select one interactively, or set `ANDROID_TARGET` before running the script.

### Port already in use

Set another `PORT` value before running `dev` or `dev:mobile-next`.

### You only want web apps

Use:

```powershell
.\start.ps1 dev:web
```

or:

```bash
./start.sh dev:web
```
