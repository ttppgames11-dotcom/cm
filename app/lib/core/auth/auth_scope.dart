import 'package:flutter/widgets.dart';

import '../../features/auth/auth_controller.dart';

/// Makes the single app-wide [AuthController] reachable from any descendant
/// widget via `AuthScope.of(context)`, without adding a state-management
/// package. Rebuilds dependents whenever [AuthController] notifies.
class AuthScope extends InheritedNotifier<AuthController> {
  const AuthScope({
    super.key,
    required AuthController controller,
    required super.child,
  }) : super(notifier: controller);

  static AuthController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AuthScope>();
    assert(scope != null, 'No AuthScope found in context');
    return scope!.notifier!;
  }
}
