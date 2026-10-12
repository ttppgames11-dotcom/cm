import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:app/widgets/home/custom_bottom_nav_bar.dart';

void main() {
  group('CustomBottomNavBar Navigation Tests', () {
    testWidgets('renders all 5 tabs and footer tagline', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            bottomNavigationBar: CustomBottomNavBar(currentIndex: 0),
          ),
        ),
      );

      expect(find.byType(CustomBottomNavBar), findsOneWidget);
      expect(find.text('होम'), findsOneWidget);
      expect(find.text('समुदाय'), findsOneWidget);
      expect(find.text('व्यवसाय'), findsOneWidget);
      expect(find.text('शोध'), findsOneWidget);
      expect(find.text('प्रोफाईल'), findsOneWidget);
      expect(find.text('|| जय शिवराय ||'), findsOneWidget);
    });

    testWidgets('calls custom onTap when provided', (tester) async {
      int tappedIndex = -1;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            bottomNavigationBar: CustomBottomNavBar(
              currentIndex: 0,
              onTap: (index) => tappedIndex = index,
            ),
          ),
        ),
      );

      await tester.tap(find.text('व्यवसाय'));
      await tester.pump();
      expect(tappedIndex, 2);

      await tester.tap(find.text('समुदाय'));
      await tester.pump();
      expect(tappedIndex, 1);
    });

    testWidgets('default navigation routes cleanly with GoRouter', (tester) async {
      final router = GoRouter(
        initialLocation: '/home',
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const Scaffold(
              body: Text('Home Screen'),
              bottomNavigationBar: CustomBottomNavBar(currentIndex: 0),
            ),
          ),
          GoRoute(
            path: '/community',
            builder: (context, state) => const Scaffold(
              body: Text('Community Screen'),
              bottomNavigationBar: CustomBottomNavBar(currentIndex: 1),
            ),
          ),
          GoRoute(
            path: '/business',
            builder: (context, state) => const Scaffold(
              body: Text('Business Screen'),
              bottomNavigationBar: CustomBottomNavBar(currentIndex: 2),
            ),
          ),
          GoRoute(
            path: '/search',
            builder: (context, state) => const Scaffold(
              body: Text('Search Screen'),
              bottomNavigationBar: CustomBottomNavBar(currentIndex: 3),
            ),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const Scaffold(
              body: Text('Profile Screen'),
              bottomNavigationBar: CustomBottomNavBar(currentIndex: 4),
            ),
          ),
        ],
      );

      await tester.pumpWidget(MaterialApp.router(routerConfig: router));
      await tester.pumpAndSettle();
      expect(find.text('Home Screen'), findsOneWidget);

      // Tap Community tab
      await tester.tap(find.text('समुदाय'));
      await tester.pumpAndSettle();
      expect(find.text('Community Screen'), findsOneWidget);

      // Tap Business tab
      await tester.tap(find.text('व्यवसाय'));
      await tester.pumpAndSettle();
      expect(find.text('Business Screen'), findsOneWidget);

      // Tap Search tab
      await tester.tap(find.text('शोध'));
      await tester.pumpAndSettle();
      expect(find.text('Search Screen'), findsOneWidget);

      // Tap Profile tab
      await tester.tap(find.text('प्रोफाईल'));
      await tester.pumpAndSettle();
      expect(find.text('Profile Screen'), findsOneWidget);

      // Tap Home tab
      await tester.tap(find.text('होम'));
      await tester.pumpAndSettle();
      expect(find.text('Home Screen'), findsOneWidget);
    });

    testWidgets('subpage with CustomBottomNavBar navigates to other tabs', (tester) async {
      final router = GoRouter(
        initialLocation: '/business/dairy',
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const Scaffold(
              body: Text('Home Screen'),
              bottomNavigationBar: CustomBottomNavBar(currentIndex: 0),
            ),
          ),
          GoRoute(
            path: '/business',
            builder: (context, state) => const Scaffold(
              body: Text('Business Hub Screen'),
              bottomNavigationBar: CustomBottomNavBar(currentIndex: 2),
            ),
          ),
          GoRoute(
            path: '/business/dairy',
            builder: (context, state) => const Scaffold(
              body: Text('Dairy Subpage'),
              bottomNavigationBar: CustomBottomNavBar(currentIndex: 2),
            ),
          ),
        ],
      );

      await tester.pumpWidget(MaterialApp.router(routerConfig: router));
      await tester.pumpAndSettle();
      expect(find.text('Dairy Subpage'), findsOneWidget);

      // Tapping Business tab returns to Business Hub
      await tester.tap(find.text('व्यवसाय'));
      await tester.pumpAndSettle();
      expect(find.text('Business Hub Screen'), findsOneWidget);

      // Tapping Home tab goes to Home
      await tester.tap(find.text('होम'));
      await tester.pumpAndSettle();
      expect(find.text('Home Screen'), findsOneWidget);
    });
  });
}
