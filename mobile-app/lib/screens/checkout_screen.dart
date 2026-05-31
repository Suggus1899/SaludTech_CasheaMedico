import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:local_auth/local_auth.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../core/theme.dart';
import '../services/api_service.dart';

class CheckoutScreen extends StatefulWidget {
  final Map<String, dynamic> qrData;
  final String rawQrToken;

  const CheckoutScreen({
    super.key,
    required this.qrData,
    required this.rawQrToken,
  });

  @override
  CheckoutScreenState createState() => CheckoutScreenState();
}

class CheckoutScreenState extends State<CheckoutScreen> {
  final ApiService _apiService = ApiService();
  final LocalAuthentication _localAuth = LocalAuthentication();
  bool _isProcessing = false;

  Future<bool> _authenticateWithBiometrics() async {
    try {
      final bool canCheck = await _localAuth.canCheckBiometrics;
      final bool isDeviceSupported = await _localAuth.isDeviceSupported();
      if (!canCheck && !isDeviceSupported) return true;
      return await _localAuth.authenticate(
        localizedReason: 'Confirma tu identidad para procesar el pago',
        options: const AuthenticationOptions(
          biometricOnly: false,
          stickyAuth: true,
        ),
      );
    } catch (_) {
      return true;
    }
  }

  void _confirmPayment() async {
    final authenticated = await _authenticateWithBiometrics();
    if (!authenticated) return;
    setState(() => _isProcessing = true);
    final success = await _apiService.processQrPayment(widget.rawQrToken);

    if (!mounted) return;

    setState(() => _isProcessing = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pago exitoso y financiado!'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.popUntil(context, (route) => route.isFirst);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Error en el pago. Revisa tu límite disponible.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final double amount =
        (widget.qrData['totalAmount'] ?? widget.qrData['amount'] ?? 0.0)
            .toDouble();
    final double downPayment = (widget.qrData['downPayment'] ?? amount * 0.40)
        .toDouble();
    final String merchantName =
        widget.qrData['merchantName'] ??
        widget.qrData['merchantId'] ??
        'Comercio';
    final List<dynamic>? schedule = widget.qrData['schedule'] as List<dynamic>?;
    final int numInstallments = widget.qrData['requestedInstallments'] ?? 3;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Resumen de Financiamiento',
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    const Icon(
                      LucideIcons.store,
                      size: 48,
                      color: AppColors.primary,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      merchantName,
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '\$${amount.toStringAsFixed(2)}',
                      style: GoogleFonts.outfit(
                        fontSize: 42,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Monto Total a Financiar',
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Desglose de Pago ($numInstallments cuotas)',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),

              _buildInstallmentRow(
                'Inicial (Al instante)',
                '\$${downPayment.toStringAsFixed(2)}',
                true,
              ),

              if (schedule != null)
                ...schedule.map((inst) {
                  final num = inst['number'] ?? 0;
                  final amt = (inst['amount'] ?? 0.0).toDouble();
                  final due = inst['dueDate'] ?? 'en ${num * 14} días';
                  return _buildInstallmentRow(
                    'Cuota $num ($due)',
                    '\$${amt.toStringAsFixed(2)}',
                    false,
                  );
                })
              else
                ...List.generate(numInstallments, (i) {
                  final instAmt = (amount - downPayment) / numInstallments;
                  return _buildInstallmentRow(
                    'Cuota ${i + 1} (en ${(i + 1) * 14} días)',
                    '\$${instAmt.toStringAsFixed(2)}',
                    false,
                  );
                }),

              const Spacer(),
              ElevatedButton(
                onPressed: _isProcessing ? null : _confirmPayment,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: _isProcessing
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(
                        'Confirmar y Pagar',
                        style: GoogleFonts.outfit(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryForeground,
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInstallmentRow(String label, String value, bool isBold) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.outfit(
              fontSize: 16,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: AppColors.textSecondary,
            ),
          ),
          Text(
            value,
            style: GoogleFonts.outfit(
              fontSize: 16,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
