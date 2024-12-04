/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.ts',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Test-Debug-iphonesimulator/Hibi.app',
      build:
        'xcodebuild -workspace ios/Hibi.xcworkspace -scheme Hibi -configuration Test-Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Test-Release-iphonesimulator/Hibi.app',
      build:
        'xcodebuild -workspace ios/Hibi.xcworkspace -scheme Hibi -configuration Test-Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath:
        'android/app/build/outputs/apk/endToEndTest/debug/app-endToEndTest-debug.apk',
      build:
        'cd android && ./gradlew assembleEndToEndTestDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081],
    },
    'android.release': {
      type: 'android.apk',
      binaryPath:
        'android/app/build/outputs/apk/endToEndTest/release/app-endToEndTest-release.apk',
      build:
        'cd android && ./gradlew assembleEndToEndTestRelease assembleAndroidTest -DtestBuildType=release',
    },
  },
  devices: {
    'android:attached': {
      type: 'android.attached',
      device: {
        adbName: '.*',
      },
    },
    'android:34:pixel': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_API_34',
      },
    },
    'android:34:pixel-8': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_8_API_34',
      },
    },
    'android:34:pixel-fold': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_Fold_API_34',
      },
    },
    'ios:15:ipod': {
      type: 'ios.simulator',
      device: {
        type: 'iPod touch (7th generation)',
        os: '15.0',
      },
    },
    'ios:15:iphone-13-pro-max': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 13 Pro Max',
        os: '15.0',
      },
    },
    'ios:latest:iphone-se': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone SE (3rd generation)',
        os: '18.0',
      },
    },
    'ios:latest:iphone-15-pro': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15 Pro',
        os: '18.0',
      },
    },
    'ios:latest:iphone-16-pro-max': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 16 Pro Max',
        os: '18.0',
      },
    },
  },
  configurations: {
    'android:attached:debug': {
      device: 'android:attached',
      app: 'android.debug',
    },
    'android:attached:release': {
      device: 'attached',
      app: 'android.release',
    },
    'android:34:pixel:debug': {
      device: 'android:34:pixel',
      app: 'android.debug',
    },
    'android:34:pixel:release': {
      device: 'android:34:pixel',
      app: 'android.release',
    },
    'android:34:pixel-8:debug': {
      device: 'android:34:pixel-8',
      app: 'android.debug',
    },
    'android:34:pixel-8:release': {
      device: 'android:34:pixel-8',
      app: 'android.release',
    },
    'android:34:pixel-fold:debug': {
      device: 'android:34:pixel-fold',
      app: 'android.debug',
    },
    'android:34:pixel-fold:release': {
      device: 'android:34:pixel-fold',
      app: 'android.release',
    },
    'ios:15:ipod:debug': {
      device: 'ios:15:ipod',
      app: 'ios.debug',
    },
    'ios:15:ipod.release': {
      device: 'ios:15:ipod',
      app: 'ios.release',
    },
    'ios:15:iphone-13-pro-max:debug': {
      device: 'ios:15:iphone-13-pro-max',
      app: 'ios.debug',
    },
    'ios:15:iphone-13-pro-max:release': {
      device: 'ios:15:iphone-13-pro-max',
      app: 'ios.release',
    },
    'ios:latest:iphone-se:debug': {
      device: 'ios:latest:iphone-se',
      app: 'ios.debug',
    },
    'ios:latest:iphone-se:release': {
      device: 'ios:latest:iphone-se',
      app: 'ios.release',
    },
    'ios:latest:iphone-15-pro:debug': {
      device: 'ios:latest:iphone-15-pro',
      app: 'ios.debug',
    },
    'ios:latest:iphone-15-pro:release': {
      device: 'ios:latest:iphone-15-pro',
      app: 'ios.release',
    },
    'ios:latest:iphone-16-pro-max:debug': {
      device: 'ios:latest:iphone-16-pro-max',
      app: 'ios.debug',
    },
    'ios:latest:iphone-16-pro-max:release': {
      device: 'ios:latest:iphone-16-pro-max',
      app: 'ios.release',
    },
  },
}
