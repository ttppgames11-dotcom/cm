/// Small pieces of navigation state shared by the router and the auth screens.
/// They live here (not in app_router.dart) so screens can use them without
/// importing the router, which itself imports those screens.
library;

/// True while a member who has just registered is still on the sign-up
/// success page (the one showing their member ID). They are already
/// authenticated, and /register sits on top of /login, so without this the
/// "logged in → /home" redirect would skip that page. Set and cleared by
/// `RegisterScreen`.
bool registrationSuccessOnScreen = false;

String? _pendingDeepLink;

/// Remembers a shared-post link (`/post/<id>`) that was opened while signed
/// out; the router sends the visitor to login first.
void rememberDeepLink(String location) => _pendingDeepLink = location;

/// Where to go after a successful login: the shared post that was opened
/// before signing in, otherwise [fallback]. The link is used only once.
String takePendingDeepLink(String fallback) {
  final link = _pendingDeepLink;
  _pendingDeepLink = null;
  return link ?? fallback;
}
