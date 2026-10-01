import java.util.Properties

plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

// Release signing comes from android/key.properties (never committed). Without
// it the release bundle is left UNSIGNED so a debug-signed build can never be
// mistaken for a production artifact.
val keystoreProperties = Properties().apply {
    val file = rootProject.file("key.properties")
    if (file.exists()) file.inputStream().use { load(it) }
}
val hasReleaseKeystore = keystoreProperties.getProperty("storeFile") != null

android {
    namespace = "com.connectmaratha.app"
    compileSdk = 36
    ndkVersion = "27.0.12077973"

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_11.toString()
    }

    defaultConfig {
        // FINAL application ID: it cannot be changed after the first Play upload.
        applicationId = "com.connectmaratha.app"
        minSdk = 23 // flutter_secure_storage requires API 23+
        targetSdk = 36
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        if (hasReleaseKeystore) {
            create("release") {
                storeFile = rootProject.file(keystoreProperties.getProperty("storeFile"))
                storePassword = keystoreProperties.getProperty("storePassword")
                keyAlias = keystoreProperties.getProperty("keyAlias")
                keyPassword = keystoreProperties.getProperty("keyPassword")
            }
        }
    }

    // Flutter ships its engine for arm64-v8a, armeabi-v7a and x86_64 only. A
    // plugin dependency (androidx.datastore) also brings a 32-bit x86 library;
    // packaging it made the bundle claim x86 support, and Play then delivered
    // an app without libflutter.so to x86 devices (crash on launch).
    packaging {
        jniLibs {
            excludes += "lib/x86/**"
        }
    }

    buildTypes {
        release {
            if (hasReleaseKeystore) {
                signingConfig = signingConfigs.getByName("release")
            } else {
                logger.warn("WARNING: android/key.properties not found - release build is UNSIGNED.")
            }
        }
    }
}

flutter {
    source = "../.."
}
