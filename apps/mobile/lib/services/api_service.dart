import 'package:dio/dio.dart';
import 'package:dio_smart_retry/dio_smart_retry.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../models/inquiry.dart';
import '../models/quote.dart';

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService();
});

class ApiService {
  late final Dio _dio;
  String? _token;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: dotenv.env['API_URL'] ?? 'https://edumatch.asafarim.com/api',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    ));

    _dio.interceptors.add(RetryInterceptor(
      dio: _dio,
      logPrint: print,
      retries: 3,
      retryDelays: const [
        Duration(seconds: 1),
        Duration(seconds: 2),
        Duration(seconds: 3),
      ],
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        if (_token != null) {
          options.headers['Authorization'] = 'Bearer $_token';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          // Handle auth error
        }
        return handler.next(error);
      },
    ));
  }

  void setToken(String token) {
    _token = token;
  }

  void clearToken() {
    _token = null;
  }

  // Auth
  Future<String> signInWithGoogle({
    required String accessToken,
    required String idToken,
  }) async {
    final response = await _dio.post('/auth/google', data: {
      'accessToken': accessToken,
      'idToken': idToken,
    });
    return response.data['token'];
  }

  Future<User> getMe() async {
    final response = await _dio.get('/me');
    return User.fromJson(response.data);
  }

  Future<User> updateProfile(Map<String, dynamic> data) async {
    final response = await _dio.patch('/me', data: data);
    return User.fromJson(response.data);
  }

  // Inquiries
  Future<List<Inquiry>> getInquiries() async {
    final response = await _dio.get('/inquiries');
    return (response.data['items'] as List)
        .map((e) => Inquiry.fromJson(e))
        .toList();
  }

  Future<Inquiry> createInquiry({
    required String subject,
    required String gradeLevel,
    required String description,
    List<String>? attachments,
  }) async {
    final response = await _dio.post('/inquiries', data: {
      'subject': subject,
      'gradeLevel': gradeLevel,
      'description': description,
      'attachments': attachments ?? [],
    });
    return Inquiry.fromJson(response.data);
  }

  Future<Inquiry> getInquiry(String id) async {
    final response = await _dio.get('/inquiries/$id');
    return Inquiry.fromJson(response.data);
  }

  // AI Response
  Stream<String> streamAIResponse(String inquiryId) async* {
    final response = await _dio.get<ResponseBody>(
      '/inquiries/$inquiryId/ai?stream=1',
      options: Options(responseType: ResponseType.stream),
    );

    await for (final chunk in response.data!.stream) {
      yield String.fromCharCodes(chunk);
    }
  }

  // Quotes
  Future<void> requestQuotes(String inquiryId) async {
    await _dio.post('/inquiries/$inquiryId/quote-request');
  }

  Future<List<Quote>> getQuotes(String inquiryId) async {
    final response = await _dio.get('/inquiries/$inquiryId/quotes');
    return (response.data['items'] as List)
        .map((e) => Quote.fromJson(e))
        .toList();
  }

  Future<Quote> submitQuote({
    required String quoteRequestId,
    required int hourlyRateCents,
    required int estimatedHours,
    required List<String> availabilitySlots,
    String? notes,
  }) async {
    final response = await _dio.post(
      '/quote-requests/$quoteRequestId/quotes',
      data: {
        'hourlyRateCents': hourlyRateCents,
        'estimatedHours': estimatedHours,
        'availabilitySlots': availabilitySlots,
        'notes': notes,
      },
    );
    return Quote.fromJson(response.data);
  }

  Future<void> acceptQuote(String quoteId) async {
    await _dio.post('/quotes/$quoteId/accept');
  }

  Future<void> declineQuote(String quoteId) async {
    await _dio.post('/quotes/$quoteId/decline');
  }

  // Booking
  Future<Map<String, dynamic>> createCheckout(String quoteId) async {
    final response = await _dio.post('/quotes/$quoteId/checkout');
    return response.data;
  }

  // Wallet
  Future<Map<String, dynamic>> getWallet() async {
    final response = await _dio.get('/tutors/wallet');
    return response.data;
  }

  Future<void> requestPayout() async {
    await _dio.post('/tutors/wallet');
  }

  // Quote Requests (for tutors)
  Future<List<Map<String, dynamic>>> getQuoteRequests() async {
    final response = await _dio.get('/tutors/quote-requests');
    return List<Map<String, dynamic>>.from(response.data['items']);
  }
}
