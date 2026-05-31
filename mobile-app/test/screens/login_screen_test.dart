import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:mobile_app/screens/login_screen.dart';

void main() {
  setUpAll(() async {
    await loadAppFonts();
  });

  group('LoginScreen Widget & Golden Tests', () {
    testWidgets('Renders LoginScreen and interacts with fields', (WidgetTester tester) async {
      await tester.pumpWidget(const MaterialApp(home: LoginScreen()));

      // Basic sanity checks for UI elements (adjust strings to match actual UI)
      expect(find.byType(TextFormField), findsWidgets);
      expect(find.byType(ElevatedButton), findsWidgets);
      
      // Enter text
      await tester.enterText(find.byType(TextFormField).first, 'test@example.com');
      
      // Tap login button (will not trigger actual API without mocking provider, but UI works)
      final loginBtn = find.byType(ElevatedButton).first;
      expect(loginBtn, findsOneWidget);
    });

    testGoldens('LoginScreen golden test', (WidgetTester tester) async {
      final builder = DeviceBuilder()
        ..overrideDevicesForAllScenarios(devices: [
          Device.phone,
          Device.iphone11,
        ])
        ..addScenario(
          widget: const LoginScreen(),
          name: 'default_state',
        );

      await tester.pumpDeviceBuilder(builder);
      await screenMatchesGolden(tester, 'login_screen_golden');
    });
  });
}
