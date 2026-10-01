import 'dart:io';
import 'dart:ui' show ImageByteFormat;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

/// Renders the Google Play feature graphic (1024×500) with the app's own
/// fonts, so Marathi text is shaped correctly. Skipped unless STORE_ASSETS is
/// set to an output folder:
///   STORE_ASSETS=E:/ConnectMaratha-PlayStore flutter test test/store_assets_test.dart
void main() {
  final outDir = Platform.environment['STORE_ASSETS'];

  testWidgets(
    'feature graphic 1024x500',
    (tester) async {
      GoogleFonts.config.allowRuntimeFetching = false;
      await tester.runAsync(
        () => GoogleFonts.pendingFonts([
          GoogleFonts.mukta(fontWeight: FontWeight.w800),
          GoogleFonts.mukta(fontWeight: FontWeight.w600),
          GoogleFonts.cinzel(fontWeight: FontWeight.w800),
        ]),
      );
      tester.view.physicalSize = const Size(1024, 500);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);

      final key = GlobalKey();
      await tester.pumpWidget(
        MaterialApp(
          debugShowCheckedModeBanner: false,
          home: Material(
            child: RepaintBoundary(key: key, child: const _FeatureGraphic()),
          ),
        ),
      );
      // Let the logo image decode.
      await tester.runAsync(
        () => precacheImage(
          const AssetImage('assets/images/connect_maratha_logo.webp'),
          tester.element(find.byType(_FeatureGraphic)),
        ),
      );
      await tester.pump();

      final boundary =
          tester.renderObject(find.byKey(key)) as RenderRepaintBoundary;
      await tester.runAsync(() async {
        final image = await boundary.toImage();
        final bytes = await image.toByteData(format: ImageByteFormat.png);
        File('$outDir/feature-graphic-1024x500.png')
          ..createSync(recursive: true)
          ..writeAsBytesSync(bytes!.buffer.asUint8List());
      });
    },
    skip: outDir == null,
  );
}

class _FeatureGraphic extends StatelessWidget {
  const _FeatureGraphic();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1024,
      height: 500,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF2A0709), Color(0xFF5C1414), Color(0xFFB84A12)],
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 56),
      child: Row(
        children: [
          Image.asset(
            'assets/images/connect_maratha_logo.webp',
            width: 360,
            height: 360,
          ),
          const SizedBox(width: 44),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: 'CONNECT ',
                        style: GoogleFonts.cinzel(
                          fontSize: 50,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      TextSpan(
                        text: 'मराठा',
                        style: GoogleFonts.mukta(
                          fontSize: 60,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFFFFB347),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'आधुनिक युगातील आधुनिक संघटन',
                  style: GoogleFonts.mukta(
                    fontSize: 34,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFFFDEBD3),
                  ),
                ),
                const SizedBox(height: 26),
                Text(
                  'इतिहास  •  संस्कृती  •  समुदाय  •  व्यवसाय',
                  style: GoogleFonts.mukta(
                    fontSize: 28,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFFF0B866),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
