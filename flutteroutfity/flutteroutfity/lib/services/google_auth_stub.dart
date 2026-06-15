import 'package:google_sign_in/google_sign_in.dart';
import '../config/api_config.dart';
import 'api_service.dart';

Future<Map<String, dynamic>?> signInWithGoogle() async {
  final googleSignIn = GoogleSignIn(clientId: ApiConfig.googleClientId);
  final account = await googleSignIn.signIn();
  if (account == null) return null;
  final auth = await account.authentication;
  final userData = await ApiService().googleAuth(idToken: auth.idToken);
  return userData;
}
