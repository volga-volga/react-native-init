'use strict';
const Generator = require('yeoman-generator');
const mkdirp = require('mkdirp');
const prompts = require('./prompts');
const path = require('path');
const fs = require('fs');

function copyFiles(newSource, newTarget) {

  function copyFileSync(source, target) {
    var targetFile = target;
    if (fs.existsSync(target)) {
      if (fs.lstatSync(target).isDirectory()) {
        targetFile = path.join(target, path.basename(source));
      }
    }
    fs.writeFileSync(targetFile, fs.readFileSync(source));
  }
  function copyFolderRecursiveSync(source, target) {
    var files = [];
    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder);
    }
    if (fs.lstatSync(source).isDirectory()) {
      files = fs.readdirSync(source);
      files.forEach(function(file) {
        var curSource = path.join(source, file);
        if (fs.lstatSync(curSource).isDirectory()) {
          copyFolderRecursiveSync(curSource, targetFolder);
        } else {
          copyFileSync(curSource, targetFolder);
        }
      });
    }
  }
  copyFolderRecursiveSync(newSource, newTarget);
}

function syncNpmInstall(spawnCommandSync, packageName) {
  spawnCommandSync('npm', ['install', '--save', packageName]);
}

class AppGenerator extends Generator {
  constructor(args, options) {
    super(args, options);
  }

  prompting() {
    return this.prompt(prompts).then(answers => {
      console.log(answers);
      this.appName = answers.title;
      this.redux = answers.redux;
      this.icons = answers.icons;
      this.apiKey = answers.apiKey;
      this.buildSecrect = answers.buildSecrect;
      this.packageName = answers.packageName;
      this.IOS_DIR = this.contextRoot + '/' + this.appName + '/ios';
      this.APP_DIR = this.contextRoot + '/' + this.appName;
      this.copyDirectory = path.join(this._sourceRoot, '../../copy/app');
    });
  }

  initApp() {
    this.spawnCommandSync('react-native', ['init', this.appName]);
    process.chdir(this.contextRoot + '/' + this.appName);
  }

  copyStructure() {
    copyFiles(this.copyDirectory, `${this.contextRoot}/${this.appName}/`);
  }

  async installingDependencies() {
    process.chdir(this.contextRoot + '/' + this.appName);
    await syncNpmInstall(this.spawnCommandSync, 'react-native-firebase');
    this.npmInstall(['react-navigation'], { save: true });
    if (this.redux) {
      this.npmInstall(
        [
          'redux',
          'redux-thunk',
          'redux-logger',
          'react-redux',
          'react-navigation-redux-helpers'
        ],
        {
          save: true
        }
      );
    }
    if (this.icons) {
      await syncNpmInstall(this.spawnCommandSync, 'react-native-vector-icons');
    }
  }

  async initPod() {
    console.log(this.IOS_DIR);
    process.chdir(this.IOS_DIR);
    this.spawnCommandSync('pod', ['init']);
    await fs.writeFileSync(
      this.IOS_DIR + '/' + 'Podfile',
      `target '${this.appName}' do
        require 'xcodeproj'
        pod 'Firebase/Core'
        pod 'Fabric', '~> 1.7.5'
        pod 'Crashlytics', '~> 3.10.4'
        rn_path = '../node_modules/react-native'
        pod 'yoga', path: "#{rn_path}/ReactCommon/yoga/yoga.podspec"
        pod 'React', path: rn_path, subspecs: [
          'Core',
          'DevSupport',
          'RCTActionSheet',
          'RCTAnimation',
          'RCTGeolocation',
          'RCTImage',
          'RCTLinkingIOS',
          'RCTNetwork',
          'RCTSettings',
          'RCTText',
          'RCTVibration',
          'RCTWebSocket'
        ]
        end
        # REPLACE
        path_to_project = "${this.IOS_DIR}/${this.appName}.xcodeproj"
                project = Xcodeproj::Project.open(path_to_project)
                main_target = project.targets.first
                phase = main_target.new_shell_script_build_phase("FABRIC")
                phase.shell_script = '"${'${PODS_ROOT}'}/Fabric/run" ${
        this.apiKey
      } ${this.buildSecrect}'
                project.save()
        # REPLACE

          post_install do |installer|
              installer.pods_project.targets.each do |target|
                  if target.name == "React"
                      target.remove_from_project
                  end
              end
          end\n`
    );
    console.log('Podfile saved');
  }

  linkDependences() {
    process.chdir(this.APP_DIR);
    this.spawnCommandSync('react-native', ['link', 'react-native-firebase']);
    if (this.icons) {
      this.spawnCommandSync('react-native', [
        'link',
        'react-native-vector-icons'
      ]);
    }
  }

  podInstallAndCleanPodfile() {
    process.chdir(this.IOS_DIR);
    this.spawnCommandSync('pod', ['install']);
    const firstData = fs.readFileSync(this.IOS_DIR + '/Podfile', 'utf8');

    let data = firstData
      .toString()
      .replace(/.*# REPLACE(.*\n)*.*# REPLACE/g, '');
    fs.writeFileSync(this.IOS_DIR + '/Podfile', data);
    console.log('Clean Podfile');
  }

  async changeAndroidBundleID() {
    const JAVA_PACKAGE_DIR = `${this.contextRoot}/${
      this.appName
    }/android/app/src/main/java`;
    process.chdir(JAVA_PACKAGE_DIR);

    const dirs = this.packageName.split('.').map(dir => dir.toLowerCase());
    const DEST_PATH = dirs.join('/');
    const JAVA_SOURCE_DIR = `${JAVA_PACKAGE_DIR}/${DEST_PATH}/${this.appName.toLowerCase()}`;
    console.log(JAVA_SOURCE_DIR);
    let now = '/';
    for (let dir of dirs) {
      mkdirp(`${JAVA_PACKAGE_DIR}${now}${dir}`);
      now += dir + '/';
    }
    await new Promise(r => setTimeout(() => r(), 1000));
    console.log(`${JAVA_PACKAGE_DIR}/${DEST_PATH}`);

    copyFiles(
      `${JAVA_PACKAGE_DIR}/com/${this.appName.toLowerCase()}`,
      `${JAVA_PACKAGE_DIR}/${DEST_PATH}`
    );
    this.spawnCommandSync('rm', ['-rf', `${JAVA_PACKAGE_DIR}/com`]);

    const ApplicationStream = fs.readFileSync(
      `${JAVA_SOURCE_DIR}/MainApplication.java`,
      'utf8'
    );
    const ApplicationString = ApplicationStream.toString().replace(
      new RegExp(`com.${this.appName.toLowerCase()}`, 'g'),
      `${this.packageName}.${this.appName.toLowerCase()}`
    );
    fs.writeFileSync(
      `${JAVA_SOURCE_DIR}/MainApplication.java`,
      ApplicationString
    );

    const ActivityStream = fs.readFileSync(
      `${JAVA_SOURCE_DIR}/MainActivity.java`,
      'utf8'
    );
    const ActivityString = ActivityStream.toString().replace(
      new RegExp(`com.${this.appName.toLowerCase()}`, 'g'),
      `${this.packageName}.${this.appName.toLowerCase()}`
    );
    fs.writeFileSync(`${JAVA_SOURCE_DIR}/MainActivity.java`, ActivityString);

    const APP_BUILD_GRADLE = `${this.contextRoot}/${
      this.appName
    }/android/app/build.gradle`;
    const gradleStream = fs.readFileSync(`${APP_BUILD_GRADLE}`, 'utf8');
    const gradleString = gradleStream
      .toString()
      .replace(
        new RegExp(`applicationId "com.${this.appName.toLowerCase()}"`),
        `applicationId "${this.packageName}.${this.appName.toLowerCase()}"`
      );
    fs.writeFileSync(`${APP_BUILD_GRADLE}`, gradleString);

    const BUCK = `${this.contextRoot}/${this.appName}/android/app/BUCK`;
    const buckStream = fs.readFileSync(`${BUCK}`, 'utf8');
    const buckString = buckStream
      .toString()
      .replace(
        new RegExp(`com.${this.appName.toLowerCase()}`, 'g'),
        `${this.packageName}.${this.appName.toLowerCase()}`
      );
    fs.writeFileSync(`${BUCK}`, buckString);

    const MANIFEST = `${this.contextRoot}/${
      this.appName
    }/android/app/src/main/AndroidManifest.xml`;
    const manifestStream = fs.readFileSync(`${MANIFEST}`, 'utf8');
    const manifestString = manifestStream
      .toString()
      .replace(
        new RegExp(`com.${this.appName.toLowerCase()}`),
        `${this.packageName}.${this.appName.toLowerCase()}`
      );
    fs.writeFileSync(`${MANIFEST}`, manifestString);
    console.log('Bundle id changed');
  }

  deepLinkAndroidFirebase() {
    const MANIFEST = `${this.contextRoot}/${
      this.appName
    }/android/app/src/main/AndroidManifest.xml`;
    const manifestStream = fs.readFileSync(`${MANIFEST}`, 'utf8');
    const manifestString = manifestStream.toString().replace(
      new RegExp(`</activity>`),
      `</activity>
      <meta-data
        android:name="io.fabric.ApiKey"
        android:value="${this.apiKey}"
      />
        `
    );
    fs.writeFileSync(`${MANIFEST}`, manifestString);

    process.chdir(this.APP_DIR);
    let firstData = fs.readFileSync(
      `${this.APP_DIR}/android/build.gradle`,
      'utf8'
    );

    let firstBuild = firstData
      .toString()
      .replace(
        new RegExp('dependencies {', 'g'),
        `dependencies {
          classpath 'com.google.gms:google-services:4.0.1'
          classpath 'io.fabric.tools:gradle:1.25.4'`
      )
      .replace(
        /jcenter\(\)/,
        `jcenter()
         maven {url 'https://maven.fabric.io/public'}`
      );
    fs.writeFileSync(`${this.APP_DIR}/android/build.gradle`, firstBuild);

    process.chdir(`${this.APP_DIR}/android/app/`);
    const appBuildGradle = `${this.contextRoot}/${
      this.appName
    }/android/app/build.gradle`;
    const appBuildGradleData = fs.readFileSync(appBuildGradle, 'utf8');
    let newAppBuildGradleData = appBuildGradleData
      .toString()
      .replace(
        /\n/,
        `
      apply plugin: "io.fabric"`
      )
      .replace(/compile project\(':react-native-firebase'\)/g, '')
      .replace(
        new RegExp('dependencies {', 'g'),
        'dependencies {\n' +
          `implementation 'com.google.firebase:firebase-core:16.0.4'
            implementation project(':react-native-firebase')
            implementation('com.crashlytics.sdk.android:crashlytics:2.9.4@aar') {
              transitive = true
            }
            `
      );
    fs.writeFileSync(
      appBuildGradle,
      `${newAppBuildGradleData}
      apply plugin: 'com.google.gms.google-services'`
    );
    const packageName = this.packageName
      .split('.')
      .map(dir => dir.toLowerCase())
      .join('/');
    const APPLICATION = `${this.contextRoot}/${
      this.appName
    }/android/app/src/main/java/${packageName}/${this.appName.toLowerCase()}/MainApplication.java`;
    const ApplicationStream = fs.readFileSync(APPLICATION, 'utf8');
    const ApplicationString = ApplicationStream.toString()
      .replace(
        new RegExp(`import io.invertase.firebase.RNFirebasePackage;`, 'g'),
        `import io.invertase.firebase.RNFirebasePackage;
         import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage;
         import com.crashlytics.android.Crashlytics;
         import io.fabric.sdk.android.Fabric;`
      )
      .replace(
        new RegExp(`new RNFirebasePackage(),`, 'g'),
        `new RNFirebasePackage(),
         new RNFirebaseCrashlyticsPackage()`
      )
      .replace(
        /SoLoader\.init\(this, \/\* native exopackage \*\/ false\)/g,
        `SoLoader.init(this, /* native exopackage */ false);
         Fabric.with(this, new Crashlytics());`
      );
    fs.writeFileSync(APPLICATION, ApplicationString);
  }

  deepLinkIOSFirebase() {
    const IOS_SOURCES = `${this.IOS_DIR}/${this.appName}`;
    process.chdir(IOS_SOURCES);
    const secondData = fs.readFileSync(`${IOS_SOURCES}/AppDelegate.m`, 'utf8');
    let secondBuild = secondData.toString().replace(
      new RegExp(`@implementation AppDelegate`, 'g'),
      `#import <Fabric/Fabric.h>
        #import <Crashlytics/Crashlytics.h>
        @import Firebase;\n\n` + `@implementation AppDelegate`
    );
    let newSecondBuild = secondBuild.replace(
      new RegExp(`return YES`, 'g'),
      `[FIRApp configure];
      [Fabric with:@[[Crashlytics class]]];
      return YES`
    );
    fs.writeFileSync(`${IOS_SOURCES}/AppDelegate.m`, newSecondBuild);

    const infoPlistData = fs.readFileSync(`${IOS_SOURCES}/Info.plist`, 'utf8');
    let newInfoPlist = infoPlistData.toString().replace(
      new RegExp(`dict`),
      `dict>
      <key>Fabric</key>
      <dict>
        <key>APIKey</key>
        <string>${this.apiKey}</string>
        <key>Kits</key>
        <array>
          <dict>
            <key>KitInfo</key>
            <dict/>
            <key>KitName</key>
            <string>Crashlytics</string>
          </dict>
        </array>
      </dict`
    );
    fs.writeFileSync(`${IOS_SOURCES}/Info.plist`, newInfoPlist);
  }
}

module.exports = AppGenerator;
