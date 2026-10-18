# Building Character Battle Arena for Android

## Prerequisites (one-time setup)

### Option 1: SDKMAN (Recommended - no sudo needed)
```bash
# Install SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install Java 17
sdk install java 17.0.12-tem
```

### Option 2: Manual Download
```bash
# Download and extract JDK 17
mkdir -p ~/.local/jdk
cd ~/.local/jdk
wget https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz
tar -xzf openjdk-17.0.2_linux-x64_bin.tar.gz
rm openjdk-17.0.2_linux-x64_bin.tar.gz
```

Then add to `~/.bashrc`:
```bash
export JAVA_HOME="$HOME/.local/jdk/jdk-17.0.2"
export PATH="$JAVA_HOME/bin:$PATH"
```

Then reload:
```bash
source ~/.bashrc
```

### Option 3: System Package (requires sudo)
```bash
sudo apt update && sudo apt install -y openjdk-17-jdk
```

## Verify Java
```bash
java -version
# Should show: openjdk version "17.x.x"
```

## Build the Android App

```bash
cd /home/shivganesh/Public/shivganesh/competition

# 1. Build web app (already done, but run if you made changes)
npm run build

# 2. Sync Capacitor
npx cap sync android

# 3. Build APK
cd android
./gradlew assembleDebug --no-daemon

# 4. Find your APK
ls -la app/build/outputs/apk/debug/app-debug.apk
```

## Install on Device

### Option A: USB Debugging (recommended)
```bash
# Enable USB debugging on phone, connect via USB
npx cap run android
```

### Option B: Manual Install
```bash
# Copy APK to phone and install
# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### Option C: Android Studio
```bash
npx cap open android
# Then use Android Studio's Run button
```

## Common Issues

| Issue | Solution |
|-------|----------|
| `JAVA_HOME not set` | Add export to ~/.bashrc and `source ~/.bashrc` |
| `gradle: command not found` | Use `./gradlew` (wrapper) instead |
| `SDK location not found` | Create `android/local.properties` with `sdk.dir=/home/$USER/Android/Sdk` |
| Build fails | Run `./gradlew clean assembleDebug` |

## Project Structure
```
/home/shivganesh/Public/shivganesh/competition/
├── android/                 # Android project (generated)
│   ├── app/
│   │   ├── build/outputs/apk/debug/app-debug.apk  # YOUR APK
│   │   └── src/main/
│   │       ├── assets/public/  # Web assets (synced from out/)
│   │       ├── java/com/shivganesh/battlearena/MainActivity.java
│   │       └── AndroidManifest.xml
│   └── gradlew
├── out/                     # Next.js static export (web assets)
├── src/app/page.tsx         # Main React component
├── capacitor.config.ts      # Capacitor config
└── next.config.ts           # Next.js config (output: "export")
```

## Next Steps After Build

1. **Customize app icon**: Replace files in `android/app/src/main/res/mipmap-*/`
2. **Splash screen**: Add `@capacitor/splash-screen` plugin
3. **Permissions**: Edit `android/app/src/main/AndroidManifest.xml`
4. **Release build**: `./gradlew assembleRelease` (requires signing config)
5. **Google Play**: Follow [Capacitor deployment guide](https://capacitorjs.com/docs/guides/deploying-to-google-play)
