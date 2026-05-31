import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile_app/services/api_service.dart';
import 'api_service_test.mocks.dart';

@GenerateMocks([Dio])
void main() {
  late ApiService apiService;
  late MockDio mockDio;

  setUp(() {
    SharedPreferences.setMockInitialValues({});
    mockDio = MockDio();
    when(mockDio.options).thenReturn(BaseOptions());
    when(mockDio.interceptors).thenReturn(Interceptors());
    apiService = ApiService(dio: mockDio);
  });

  group('ApiService Login Tests', () {
    test('login returns UserResponse on success', () async {
      when(mockDio.post('/auth/login', data: anyNamed('data'))).thenAnswer(
        (_) async => Response(
          data: {
            'token': 'fake_jwt_token',
            'user': {
              'id': '1',
              'email': 'juan@test.com',
              'firstName': 'Juan',
              'lastName': 'Perez',
              'level': 2,
              'points': 150,
            },
          },
          statusCode: 200,
          requestOptions: RequestOptions(path: '/auth/login'),
        ),
      );

      final result = await apiService.login('juan@test.com', 'password');

      expect(result, isNotNull);
      expect(result!.firstName, 'Juan');
      expect(result.level, 2);

      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getString('jwt_token'), 'fake_jwt_token');
    });
  });
}
