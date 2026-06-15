import 'dart:async';
import 'package:google_identity_services_web/oauth2.dart' as gis_oauth2;
import 'package:google_identity_services_web/loader.dart' as loader;
import '../config/api_config.dart';
import 'api_service.dart';

Future<Map<String, dynamic>?> signInWithGoogle() async {
  await loader.loadWebSdk().timeout(const Duration(seconds: 15));

  final completer = Completer<Map<String, dynamic>?>();

  final tokenClient = gis_oauth2.oauth2.initTokenClient(gis_oauth2.TokenClientConfig(
    client_id: ApiConfig.googleClientId,
    scope: ['openid', 'email', 'profile'],
    callback: (response) {
      if (completer.isCompleted) return;
      final token = response.access_token;
      if (token != null && token.isNotEmpty) {
        ApiService().googleAuth(accessToken: token).then((userData) {
          if (!completer.isCompleted) completer.complete(userData);
        }).catchError((e) {
          if (!completer.isCompleted) completer.completeError(e);
        });
      } else {
        if (!completer.isCompleted) completer.complete(null);
      }
    },
    error_callback: (error) {
      if (!completer.isCompleted) completer.complete(null);
    },
  ));

  tokenClient.requestAccessToken();

  Timer(const Duration(seconds: 120), () {
    if (!completer.isCompleted) completer.complete(null);
  });

  return completer.future;
}
