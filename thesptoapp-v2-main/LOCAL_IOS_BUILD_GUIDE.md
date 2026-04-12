# Local iOS Build Guide for The Spot App

This guide provides the necessary steps to build the iOS app (`.ipa` file) on a local machine. This is necessary because the EAS Build service has reached its free-tier quota.

## A. Core Requirement: macOS

Building an iOS application requires Apple's software (Xcode), which only runs on macOS. You have a few options:
1.  **Use a physical Mac**: A MacBook, iMac, or Mac Mini. This is the most straightforward option.
2.  **Use a cloud-based Mac service**: Services like MacinCloud or MacStadium rent remote access to a Mac.
3.  **Use a virtual machine**: Set up a macOS virtual machine on your PC using software like VMWare or VirtualBox. This can be technically complex.

**The rest of this guide assumes you are operating within a macOS environment.**

## B. Software Installation

Open the `Terminal` app on your Mac and run the following commands one by one.

### 1. Install Homebrew
Homebrew is a package manager that simplifies installing other software.
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js and Watchman
Node.js is the JavaScript runtime, and Watchman is a file watcher used by the build tools.
```bash
brew install node watchman
```

### 3. Install Xcode Command Line Tools
These are required for many development tasks.
```bash
xcode-select --install
```
*A system dialog will appear. Click "Install" and agree to the terms.*

### 4. Install Xcode
Xcode is Apple's main development environment and contains the iOS SDKs.
*   Open the **App Store** on your Mac.
*   Search for **Xcode** and install it.
*   After installation, **open Xcode** once to agree to its terms and let it install any additional components.

### 5. Install Global Command Line Tools (CLIs)
These are the tools for interacting with Expo and EAS services.
```bash
npm install -g eas-cli
```

## C. Project Setup

1.  **Get the Code**: Make sure the latest version of your project code is on the Mac.
2.  **Open Terminal in Project**: Open a terminal window and navigate into your project directory.
    ```bash
    cd /path/to/your/project/thesptoapp-v2-main
    ```
3.  **Install Dependencies**: This installs all the necessary libraries for the project.
    ```bash
    npm install
    ```

## D. Run the Local Build

This is the final command that will start the build process. It will create the `.ipa` file in your project directory.

1.  **Log in to EAS**:
    ```bash
    eas login
    ```
    *You will be prompted to enter your Expo account username and password (`emmanuel4534`).*

2.  **Start the Build**:
    ```bash
    eas build --platform ios --local
    ```

This command will start the build process on your Mac. It will take some time. If it is successful, you will find the new `.ipa` file in your project folder. You can then upload this file to the App Store Connect.
