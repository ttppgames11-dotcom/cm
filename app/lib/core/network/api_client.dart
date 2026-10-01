import 'dart:async';
import 'dart:convert';
import 'dart:io';

import '../config/api_config.dart';
import '../storage/secure_token_store.dart';

/// A failed API call, already translated into a message that is safe to show
/// to the user (never a stack trace or raw server text for 5xx errors).
class ApiException implements Exception {
  ApiException(this.message, {this.statusCode, this.code});

  final String message;
  final int? statusCode;

  /// Machine-readable reason from the backend, e.g. `USER_NOT_FOUND`,
  /// `INVALID_PASSWORD`, `ALREADY_REGISTERED`, or a client-side reason
  /// (`NO_INTERNET`, `TIMEOUT`, `SESSION_EXPIRED`, `BAD_RESPONSE`).
  final String? code;

  bool get isNetworkError => code == 'NO_INTERNET' || code == 'TIMEOUT';

  @override
  String toString() => message;
}

/// Single place for HTTP: timeouts, error mapping, bearer token injection and
/// transparent refresh-token rotation on 401. Never logs request or response
/// bodies (they contain passwords and tokens).
class ApiClient {
  ApiClient(this._tokens);

  final SecureTokenStore _tokens;

  static const _connectTimeout = Duration(seconds: 10);
  static const _requestTimeout = Duration(seconds: 20);
  static const _uploadTimeout = Duration(seconds: 60);

  /// Largest picture the server accepts.
  static const maxImageBytes = 5 * 1024 * 1024;

  /// Called when the session can no longer be refreshed (revoked, expired,
  /// account suspended). The app should return to the logged-out state.
  void Function()? onSessionExpired;

  Future<_Refresh>? _refreshing;

  Future<Map<String, dynamic>> get(String path, {bool auth = false}) =>
      _send('GET', path, auth: auth);

  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
    bool auth = false,
  }) => _send('POST', path, body: body, auth: auth);

  Future<Map<String, dynamic>> put(
    String path, {
    Map<String, dynamic>? body,
    bool auth = false,
  }) => _send('PUT', path, body: body, auth: auth);

  /// Sends a picture (JPEG, PNG or WebP) as the request body. The server
  /// decides the type from the bytes themselves.
  Future<Map<String, dynamic>> uploadImage(String path, List<int> bytes) {
    if (bytes.length > maxImageBytes) {
      throw ApiException(
        'फोटो खूप मोठा आहे. कृपया लहान फोटो निवडा.',
        code: 'PAYLOAD_TOO_LARGE',
      );
    }
    return _send('POST', path, bytes: bytes, auth: true);
  }

  Future<Map<String, dynamic>> delete(
    String path, {
    Map<String, dynamic>? body,
    bool auth = false,
  }) => _send('DELETE', path, body: body, auth: auth);

  Future<Map<String, dynamic>> _send(
    String method,
    String path, {
    Map<String, dynamic>? body,
    List<int>? bytes,
    bool auth = false,
    bool allowRefresh = true,
  }) async {
    try {
      final token = auth ? await _tokens.readAccessToken() : null;
      final result = await _once(
        method,
        path,
        body: body,
        bytes: bytes,
        token: token,
      );
      if (result.status == 401 && auth && allowRefresh) {
        final code = result.json['code'];
        if (code == 'TOKEN_EXPIRED' || code == 'UNAUTHORIZED') {
          final outcome = await _refreshTokens();
          if (outcome == _Refresh.refreshed) {
            return _send(
              method,
              path,
              body: body,
              bytes: bytes,
              auth: true,
              allowRefresh: false,
            );
          }
          if (outcome == _Refresh.offline) {
            throw ApiException(
              'इंटरनेट कनेक्शन नाही. कृपया कनेक्शन तपासून पुन्हा प्रयत्न करा.',
              code: 'NO_INTERNET',
            );
          }
          onSessionExpired?.call();
          throw ApiException(
            'सत्र संपले आहे. कृपया पुन्हा लॉगिन करा.',
            statusCode: 401,
            code: 'SESSION_EXPIRED',
          );
        }
      }
      return _unwrap(result);
    } on ApiException {
      rethrow;
    } on SocketException {
      throw ApiException(
        'इंटरनेट कनेक्शन नाही. कृपया कनेक्शन तपासून पुन्हा प्रयत्न करा.',
        code: 'NO_INTERNET',
      );
    } on HandshakeException {
      throw ApiException(
        'सुरक्षित कनेक्शन स्थापित करता आले नाही.',
        code: 'NO_INTERNET',
      );
    } on TimeoutException {
      throw ApiException(
        'सर्व्हरने वेळेत उत्तर दिले नाही. कृपया पुन्हा प्रयत्न करा.',
        code: 'TIMEOUT',
      );
    } on HttpException {
      throw ApiException(
        'नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.',
        code: 'NO_INTERNET',
      );
    }
  }

  Future<_Raw> _once(
    String method,
    String path, {
    Map<String, dynamic>? body,
    List<int>? bytes,
    String? token,
  }) async {
    final timeout = bytes == null ? _requestTimeout : _uploadTimeout;
    final client = HttpClient()..connectionTimeout = _connectTimeout;
    try {
      final req = await client.openUrl(
        method,
        Uri.parse('${ApiConfig.baseUrl}$path'),
      );
      req.headers.set(HttpHeaders.acceptHeader, 'application/json');
      if (token != null) {
        req.headers.set(HttpHeaders.authorizationHeader, 'Bearer $token');
      }
      if (body != null) {
        req.headers.contentType = ContentType.json;
        req.add(utf8.encode(jsonEncode(body)));
      } else if (bytes != null) {
        req.headers.contentType = ContentType('image', 'jpeg');
        req.contentLength = bytes.length;
        req.add(bytes);
      }
      final res = await req.close().timeout(timeout);
      final text = await res.transform(utf8.decoder).join().timeout(timeout);
      Map<String, dynamic> json = {};
      if (text.isNotEmpty) {
        try {
          final decoded = jsonDecode(text);
          if (decoded is Map<String, dynamic>) json = decoded;
        } on FormatException {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            throw ApiException(
              'सर्व्हरकडून अवैध प्रतिसाद मिळाला.',
              statusCode: res.statusCode,
              code: 'BAD_RESPONSE',
            );
          }
        }
      }
      return _Raw(res.statusCode, json);
    } finally {
      client.close(force: true);
    }
  }

  Map<String, dynamic> _unwrap(_Raw r) {
    if (r.status >= 200 && r.status < 300) return r.json;
    final code = r.json['code']?.toString();
    final serverMsg = r.json['error']?.toString();
    final message = switch (r.status) {
      // The backend's own message is user-safe for these client errors.
      400 || 401 || 403 || 404 || 409 || 422 => serverMsg,
      413 => 'फोटो खूप मोठा आहे. कृपया लहान फोटो निवडा.',
      429 => serverMsg ?? 'खूप विनंत्या. कृपया थोड्या वेळाने प्रयत्न करा.',
      _ => null,
    };
    throw ApiException(
      message ??
          (r.status >= 500
              ? 'सर्व्हर सध्या उपलब्ध नाही. कृपया थोड्या वेळाने प्रयत्न करा.'
              : 'काहीतरी चुकले (${r.status}). कृपया पुन्हा प्रयत्न करा.'),
      statusCode: r.status,
      code: code,
    );
  }

  /// Exchanges the stored refresh token for a new pair. Concurrent callers
  /// share one refresh so the rotating token is only used once.
  Future<_Refresh> _refreshTokens() {
    return _refreshing ??= () async {
      try {
        final refresh = await _tokens.readRefreshToken();
        if (refresh == null || refresh.isEmpty) return _Refresh.rejected;
        final r = await _once('POST', '/api/auth/refresh', body: {'refreshToken': refresh});
        if (r.status == 200 && r.json['token'] != null) {
          await _tokens.save(
            accessToken: r.json['token'].toString(),
            refreshToken: r.json['refreshToken']?.toString(),
          );
          return _Refresh.refreshed;
        }
        await _tokens.clear();
        return _Refresh.rejected;
      } catch (_) {
        return _Refresh.offline; // keep tokens; the caller reports the network error
      } finally {
        _refreshing = null;
      }
    }();
  }
}

enum _Refresh { refreshed, rejected, offline }

class _Raw {
  _Raw(this.status, this.json);
  final int status;
  final Map<String, dynamic> json;
}
