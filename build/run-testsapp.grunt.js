module.exports = {

    run: function(grunt) {
        var pathModule = require("path");

        var localCfg = {
            tnsPath: "tns",
            emulatorProcessIdentifier:".*emulator64-x86",
            emuAvdName:"Api19",
            androidRuntimePath:"/Users/erjan/tns-android.tgz",
            outfile:"./TestRunResult.txt",
            androidRuntimePath: "/Users/erjan/tns-android.tgz",
            androidFrameworkArgument: " --frameworkPath=/Users/erjan/tns-android.tgz",

            workingDir:".testsapprun",
            testsAppName:"TestsApp",
            applicationDir: pathModule.join(".testsapprun", "TestsApp"),
            appDir: pathModule.join(".testsapprun", "TestsApp", "app"),
            pathToApk:"./platforms/android/build/outputs/apk/TestsApp-debug.apk",
            deployedAppName:"org.nativescript.$testsAppName",
            mainActivityName:"com.tns.NativeScriptActivity",
            pathToCompiledTests: "bin/dist/apps/tests"
        }

        grunt.initConfig({
            clean: {
                workingDir: {
                    src: localCfg.workingDir
                },
                originalAppDir: {
                    src: pathModule.join(localCfg.applicationDir, "app") + "/"
                }
            },
            mkdir: {
                workingDir: {
                    options: {
                        create: [localCfg.workingDir],
                        mode: 0700
                    }
                }
            },
            copy: {
                testsAppToRunDir: {
                    src: "**/*.*",
                    dest: localCfg.appDir,
                    cwd: localCfg.pathToCompiledTests,
                    expand: true
                },
                addAndroidPermissions: {
                    src: "AndroidManifest.xml",
                    dest: localCfg.applicationDir + "/platforms/android/src/main/",
                    cwd: localCfg.applicationDir + "/platforms/android/src/main",
                    expand: true,
                    options: {
                        process: function(content, srcPath) {
                            var newContent = content;

                            var internetPermissionFinder = /((\s*)<uses-permission[^>]*android\.permission\.INTERNET[^>]*>)/;

                            if (!/uses-permission[^>]*android\.permission\.ACCESS_NETWORK_STATE/.test(content)) {
                                newContent = newContent.replace(internetPermissionFinder, "$1$2<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>");
                            }
                            if (!/uses-permission[^>]*android\.permission\.ACCESS_FINE_LOCATION/.test(content)) {
                                newContent = newContent.replace(internetPermissionFinder, "$1$2<uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\"/>");
                            }
                            return newContent;
                        }
                    }
                }
            },
            exec: {
                killEmulator: {
                    cmd: "pkill '" + localCfg.emulatorProcessIdentifier + "'",
                    exitCode: [0, 1]
                },
                runTestsApp: {
                    cmd: "./runtestsapp.sh",
                    stdout: false
                },
                startEmulator: {
                    cmd: "emulator -avd " + localCfg.emuAvdName + " -no-audio -no-window &",
                    stdout: true
                },
                createApp: {
                    cmd: localCfg.tnsPath + " create " + localCfg.testsAppName,
                    cwd: localCfg.workingDir
                },
                addAndroidPlatform: {
                    cmd: "tns platform add android " + localCfg.androidFrameworkArgument,
                    cwd: localCfg.applicationDir
                }
            }
        });

//        grunt.loadNpmTasks("grunt-tslint");
//        grunt.loadNpmTasks("grunt-multi-dest");
//        grunt.loadNpmTasks("grunt-shell");
//        grunt.loadNpmTasks("grunt-env");
//        grunt.loadNpmTasks("grunt-simple-mocha");
        grunt.loadNpmTasks("grunt-exec");
        grunt.loadNpmTasks("grunt-mkdir");
        grunt.loadNpmTasks("grunt-contrib-clean");
        grunt.loadNpmTasks("grunt-contrib-copy");

        grunt.registerTask("testsapp", [
                "clean:workingDir",
                "mkdir:workingDir",
                "exec:killEmulator",
                "exec:startEmulator",
//                "exec:runTestsApp",

                "exec:createApp",
                "clean:originalAppDir",
                "copy:testsAppToRunDir",

                "exec:addAndroidPlatform",
                "copy:addAndroidPermissions",


//                "exec:killEmulator",
//                "clean:workingDir"
        ]);
    }
}
