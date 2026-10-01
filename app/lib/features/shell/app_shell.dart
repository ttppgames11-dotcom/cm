import 'package:flutter/material.dart';

import '../../shared/widgets/coming_soon_screen.dart';
import '../home/home_screen.dart';

/// The authenticated app's mobile shell: bottom navigation across the
/// primary feature areas. Only the Home tab is fully built in Phase 2 —
/// the rest are placeholders until their features are implemented.
class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;

  static const _screens = [
    HomeScreen(),
    ComingSoonScreen(title: 'समुदाय', icon: Icons.forum_rounded),
    ComingSoonScreen(title: 'व्यवसाय', icon: Icons.storefront_rounded),
    ComingSoonScreen(title: 'मेसेजेस', icon: Icons.chat_rounded),
    ComingSoonScreen(title: 'प्रोफाईल', icon: Icons.person_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_rounded), label: 'होम'),
          NavigationDestination(
            icon: Icon(Icons.forum_rounded),
            label: 'समुदाय',
          ),
          NavigationDestination(
            icon: Icon(Icons.storefront_rounded),
            label: 'व्यवसाय',
          ),
          NavigationDestination(
            icon: Icon(Icons.chat_rounded),
            label: 'मेसेजेस',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_rounded),
            label: 'प्रोफाईल',
          ),
        ],
      ),
    );
  }
}
