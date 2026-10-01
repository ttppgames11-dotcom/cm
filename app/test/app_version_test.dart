// The version shown in the app must be the version that is actually built.
import 'dart:io';

import 'package:app/core/config/app_version.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('displayed version equals pubspec.yaml', () {
    final line = File(
      'pubspec.yaml',
    ).readAsLinesSync().firstWhere((l) => l.startsWith('version:'));
    expect(
      line.split(':').last.trim(),
      '$appVersionName+$appBuildNumber',
      reason: 'update lib/core/config/app_version.dart with pubspec.yaml',
    );
  });
}
