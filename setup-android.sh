#!/bin/bash
# Android Build Setup Script for Character Battle Arena
# Run this script: chmod +x setup-android.sh && ./setup-android.sh

set -e

echo "🚀 Setting up Android build environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/home/shivganesh/Public/shivganesh/competition"
ANDROID_DIR="$PROJECT_DIR/android"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Check/Install Java
if command_exists java; then
    JAVA_VERSION=$(java -version 2>&1 | head -n1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -ge 17 ]; then
        echo -e "${GREEN}✅ Java $JAVA_VERSION found${NC}"
    else
        echo -e "${YELLOW}⚠️  Java $JAVA_VERSION found, need 17+${NC}"
        NEED_JAVA=true
    fi
else
    echo -e "${YELLOW}⚠️  Java not found${NC}"
    NEED_JAVA=true
fi

# Install Java if needed (using SDKMAN - no sudo required)
if [ "$NEED_JAVA" = true ]; then
    echo -e "${YELLOW}📦 Installing Java 17 via SDKMAN...${NC}"

    if [ ! -d "$HOME/.sdkman" ]; then
        curl -s "https://get.sdkman.io" | bash
    fi

    # Source SDKMAN
    source "$HOME/.sdkman/bin/sdkman-init.sh"

    # Install Java 17
    sdk install java 17.0.12-tem

    # Verify
    java -version
    echo -e "${GREEN}✅ Java installed${NC}"
fi

# 2. Verify JAVA_HOME
if [ -z "$JAVA_HOME" ]; then
    # Try to find it
    if [ -d "/usr/lib/jvm/java-17-openjdk-amd64" ]; then
        export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
    elif [ -d "$HOME/.sdkman/candidates/java/current" ]; then
        export JAVA_HOME="$HOME/.sdkman/candidates/java/current"
    fi

    if [ -n "$JAVA_HOME" ]; then
        echo "export JAVA_HOME=$JAVA_HOME" >> ~/.bashrc
        echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
        export PATH=$JAVA_HOME/bin:$PATH
        echo -e "${GREEN}✅ JAVA_HOME set to $JAVA_HOME${NC}"
    fi
fi

# 3. Build the web app
echo -e "${YELLOW}🔨 Building Next.js app...${NC}"
cd "$PROJECT_DIR"
npm run build

# 4. Sync Capacitor
echo -e "${YELLOW}🔄 Syncing Capacitor...${NC}"
npx cap sync android

# 5. Build Android APK
echo -e "${YELLOW}📱 Building Android APK...${NC}"
cd "$ANDROID_DIR"
./gradlew assembleDebug --no-daemon

# 6. Show result
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    echo -e "${GREEN}📦 APK location: $APK_PATH${NC}"
    echo ""
    echo "Next steps:"
    echo "  • Install on device: npx cap run android"
    echo "  • Open in Android Studio: npx cap open android"
    echo "  • Copy APK to phone and install manually"
else
    echo -e "${RED}❌ Build failed - APK not found${NC}"
    exit 1
fi