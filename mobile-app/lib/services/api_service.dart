import "package:flutter/foundation.dart";
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_response.dart';
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:8080/api/v1';
  final Dio _dio;

  ApiService({Dio? dio}) : _dio = dio ?? Dio() {
    _dio.options.baseUrl = baseUrl;
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('jwt_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  Future<UserResponse?> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      // NOTE: baseUrl is http://10.0.2.2:8080/api/v1, so full path = /api/v1/auth/login ✓

      if (response.statusCode == 200) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt_token', response.data['token']);

        return UserResponse.fromJson(response.data['user']);
      }
    } catch (e) {
      debugPrint('Login Error: $e');
      throw Exception('Failed to login. Please check credentials.');
    }
    return null;
  }

  Future<UserResponse?> register({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
    required String nationalId,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/register',
        data: {
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'phone': phone,
          'identityDocument': nationalId,
          'password': password,
        },
      );
      if (response.statusCode == 200) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt_token', response.data['token']);
        return UserResponse.fromJson(response.data['user']);
      }
    } catch (e) {
      debugPrint('Register Error: $e');
      throw Exception(
        'Error al registrar. Verifique los datos e intente de nuevo.',
      );
    }
    return null;
  }

  Future<Map<String, dynamic>?> registerRaw({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
    required String nationalId,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/register',
        data: {
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'phone': phone,
          'identityDocument': nationalId,
          'password': password,
        },
      );
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('Register Error: $e');
      throw Exception(
        'Error al registrar. Verifique los datos e intente de nuevo.',
      );
    }
    return null;
  }

  Future<Map<String, dynamic>?> verifyOtp(String phone, String code) async {
    try {
      final response = await _dio.post(
        '/auth/verify-otp',
        data: {'phone': phone, 'code': code},
      );
      if (response.statusCode == 200) {
        final prefs = await SharedPreferences.getInstance();
        final token = response.data['token'];
        if (token != null) {
          await prefs.setString('jwt_token', token);
        }
        return response.data as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('VerifyOtp Error: $e');
      throw Exception('Código OTP inválido o expirado.');
    }
    return null;
  }

  Future<Map<String, dynamic>?> resendOtp(String phone) async {
    try {
      final response = await _dio.post(
        '/auth/resend-otp',
        queryParameters: {'phone': phone},
      );
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('ResendOtp Error: $e');
      throw Exception('No se pudo reenviar el código OTP.');
    }
    return null;
  }

  /// Parses the HMAC QR payload and returns the preview data
  Map<String, dynamic>? getCheckoutPreview(String payloadBase64) {
    try {
      final String decoded = utf8.decode(base64.decode(payloadBase64));
      // decoded should be: merchantId:amount:nonce:timestamp|signature
      final parts = decoded.split('|');
      if (parts.length != 2) return null;

      final dataParts = parts[0].split(':');
      if (dataParts.length != 4) return null;

      return {
        'merchantId': dataParts[0],
        'amount': double.parse(dataParts[1]),
        'nonce': dataParts[2],
        'timestamp': dataParts[3],
        'signature': parts[1],
      };
    } catch (e) {
      debugPrint('QR Parse Error: $e');
      return null;
    }
  }

  Future<List<dynamic>?> getMyInstallments() async {
    try {
      final response = await _dio.get('/patient/transactions/my');
      if (response.statusCode == 200) {
        return response.data as List<dynamic>;
      }
    } catch (e) {
      debugPrint('GetInstallments Error: $e');
    }
    return null;
  }

  /// Calls /patient/transactions/preview to get real installment breakdown from backend
  Future<Map<String, dynamic>?> previewTransaction({
    required String merchantId,
    required double amount,
    required int requestedInstallments,
    required String qrToken,
  }) async {
    try {
      final response = await _dio.post(
        '/patient/transactions/preview',
        data: {
          'merchantId': merchantId,
          'amount': amount,
          'requestedInstallments': requestedInstallments,
          'qrToken': qrToken,
        },
      );
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('Preview Error: $e');
    }
    return null;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
  }

  Future<List<Map<String, dynamic>>?> getCreditLines() async {
    try {
      final response = await _dio.get('/patient/credit-lines');
      if (response.statusCode == 200) {
        return (response.data as List).cast<Map<String, dynamic>>();
      }
    } catch (e) {
      debugPrint('CreditLines Error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> getCreditLine() async {
    try {
      final response = await _dio.get('/patient/credit-lines');
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        if (list.isNotEmpty) return list.first as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('CreditLine Error: $e');
    }
    return null;
  }

  Future<List<dynamic>?> getPendingInstallments() async {
    try {
      final response = await _dio.get(
        '/patient/transactions/my/installments/pending',
      );
      if (response.statusCode == 200) {
        return response.data as List<dynamic>;
      }
    } catch (e) {
      debugPrint('PendingInstallments Error: $e');
    }
    return null;
  }

  Future<List<Map<String, dynamic>>?> getSubscriptions() async {
    try {
      final response = await _dio.get('/patient/subscriptions');
      if (response.statusCode == 200) {
        return (response.data as List).cast<Map<String, dynamic>>();
      }
    } catch (e) {
      debugPrint('Subscriptions Error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> submitTriage(String symptoms, int severity) async {
    try {
      final response = await _dio.post(
        '/patient/triage',
        data: {'symptoms': symptoms, 'perceivedSeverity': severity},
      );
      if (response.statusCode == 201) {
        return response.data as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('SubmitTriage Error: $e');
    }
    return null;
  }

  Future<List<Map<String, dynamic>>?> getMyTriages() async {
    try {
      final response = await _dio.get('/patient/triage');
      if (response.statusCode == 200) {
        return (response.data as List).cast<Map<String, dynamic>>();
      }
    } catch (e) {
      debugPrint('GetMyTriages Error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> payInstallment({
    required String installmentId,
    required String method,
    String? phone,
    String? reference,
    String? email,
  }) async {
    try {
      final response = await _dio.post(
        '/patient/payments',
        data: {
          'installmentId': installmentId, 
          'method': method,
          if (phone != null) 'phone': phone,
          if (reference != null) 'reference': reference,
          if (email != null) 'email': email,
        },
      );
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('PayInstallment Error: $e');
      rethrow;
    }
    return null;
  }

  Future<bool> processQrPayment(String payloadBase64) async {
    try {
      final Map<String, dynamic>? data = getCheckoutPreview(payloadBase64);
      if (data == null) return false;

      final response = await _dio.post(
        '/patient/transactions',
        data: {
          'merchantId': data['merchantId'],
          'amount': data['amount'],
          'requestedInstallments': 3,
          'qrToken': payloadBase64,
        },
      );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Payment Error: $e');
      return false;
    }
  }

  // ── Elder Care Subscriptions ────────────────────────────────────────────────

  Future<List<Map<String, dynamic>>?> getElderCareSubscriptions() async {
    try {
      final response = await _dio.get('/patient/elder-care/subscriptions');
      if (response.statusCode == 200) {
        return (response.data as List).cast<Map<String, dynamic>>();
      }
    } catch (e) {
      debugPrint('GetElderCareSubscriptions Error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> createElderCareSubscription({
    required String merchantId,
    required String serviceType,
    required double monthlyAmount,
  }) async {
    try {
      final response = await _dio.post(
        '/patient/elder-care/subscriptions',
        data: {
          'merchantId': merchantId,
          'serviceType': serviceType,
          'monthlyAmount': monthlyAmount,
        },
      );
      if (response.statusCode == 201) {
        return response.data as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('CreateElderCareSubscription Error: $e');
      rethrow;
    }
    return null;
  }

  Future<bool> cancelElderCareSubscription(String id) async {
    try {
      final response = await _dio.delete('/patient/elder-care/subscriptions/$id');
      return response.statusCode == 204;
    } catch (e) {
      debugPrint('CancelElderCareSubscription Error: $e');
      return false;
    }
  }

  // ── Pharmacy Subscription cancel ───────────────────────────────────────────

  Future<bool> cancelSubscription(String id) async {
    try {
      final response = await _dio.delete('/patient/subscriptions/$id');
      return response.statusCode == 204;
    } catch (e) {
      debugPrint('CancelSubscription Error: $e');
      return false;
    }
  }

  // ── Triage enhanced methods ────────────────────────────────────────────────

  Future<Map<String, dynamic>?> getTriageById(String triageId) async {
    try {
      final response = await _dio.get('/patient/triage/$triageId');
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('GetTriageById Error: $e');
    }
    return null;
  }

  Future<List<Map<String, dynamic>>?> getRecommendedMerchants(String triageId) async {
    try {
      final response = await _dio.get('/patient/triage/$triageId/recommended-merchants');
      if (response.statusCode == 200) {
        return (response.data as List).cast<Map<String, dynamic>>();
      }
    } catch (e) {
      debugPrint('GetRecommendedMerchants Error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> bookFromTriage({
    required String triageId,
    required String merchantId,
    required double amount,
    required int installments,
    required String qrToken,
  }) async {
    try {
      final response = await _dio.post(
        '/patient/triage/$triageId/book',
        data: {
          'merchantId': merchantId,
          'amount': amount,
          'requestedInstallments': installments,
          'qrToken': qrToken,
        },
      );
      if (response.statusCode == 201) {
        return response.data as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('BookFromTriage Error: $e');
      rethrow;
    }
    return null;
  }
}

