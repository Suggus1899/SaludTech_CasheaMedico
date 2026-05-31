import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../core/theme.dart';
import '../services/api_service.dart';

class PayInstallmentScreen extends StatefulWidget {
  final Map<String, dynamic> installment;

  const PayInstallmentScreen({super.key, required this.installment})
     ;

  @override
  State<PayInstallmentScreen> createState() => _PayInstallmentScreenState();
}

class _PayInstallmentScreenState extends State<PayInstallmentScreen> {
  final ApiService _api = ApiService();
  bool _isLoading = false;
  bool _success = false;
  String? _error;

  String _selectedMethod = 'PAGO_MOVIL';
  
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _refController = TextEditingController();

  @override
  void dispose() {
    _phoneController.dispose();
    _emailController.dispose();
    _refController.dispose();
    super.dispose();
  }

  static const _methods = [
    {'value': 'PAGO_MOVIL', 'label': 'Pago Móvil', 'icon': LucideIcons.smartphone},
    {'value': 'TRANSFERENCIA', 'label': 'Transferencia', 'icon': LucideIcons.building2},
    {'value': 'ZELLE', 'label': 'Zelle', 'icon': LucideIcons.dollarSign},
  ];

  Future<void> _confirmPayment() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final id = widget.installment['id']?.toString() ?? '';
      await _api.payInstallment(
        installmentId: id,
        method: _selectedMethod,
        phone: _selectedMethod == 'PAGO_MOVIL' ? _phoneController.text : null,
        email: _selectedMethod == 'ZELLE' ? _emailController.text : null,
        reference: _refController.text,
      );
      setState(() => _success = true);
      await Future.delayed(const Duration(milliseconds: 1800));
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      setState(() {
        _error = 'No se pudo procesar el pago. Intenta de nuevo.';
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final inst = widget.installment;
    final amount = (inst['amount'] ?? 0.0).toDouble();
    final fee = (inst['reactivationFee'] ?? 0.0).toDouble();
    final total = amount + fee;
    final num = inst['installmentNum'] ?? 1;
    final dueDate = inst['dueDate'] ?? '';
    final isOverdue = inst['status'] == 'OVERDUE';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
        title: Text(
          'Pagar Cuota',
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
      ),
      body: _success
          ? _buildSuccessState()
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Resumen de cuota ────────────────────────────────────
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isOverdue
                            ? Colors.red.shade200
                            : AppColors.border,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: isOverdue
                                    ? Colors.red.shade50
                                    : AppColors.primary.withValues(alpha: 0.1),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                isOverdue
                                    ? LucideIcons.alertTriangle
                                    : LucideIcons.creditCard,
                                color: isOverdue
                                    ? Colors.red
                                    : AppColors.primaryDark,
                                size: 22,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Cuota #$num',
                                  style: GoogleFonts.outfit(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                Text(
                                  dueDate.isNotEmpty
                                      ? 'Vence: $dueDate'
                                      : isOverdue
                                          ? 'En mora'
                                          : 'Pendiente',
                                  style: GoogleFonts.outfit(
                                    fontSize: 13,
                                    color: isOverdue
                                        ? Colors.red
                                        : AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        const SizedBox(height: 16),
                        _buildAmountRow('Monto cuota', '\$${amount.toStringAsFixed(2)}'),
                        if (fee > 0) ...[
                          const SizedBox(height: 8),
                          _buildAmountRow(
                            'Recargo mora',
                            '\$${fee.toStringAsFixed(2)}',
                            valueColor: Colors.red.shade600,
                          ),
                        ],
                        const SizedBox(height: 12),
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        const SizedBox(height: 12),
                        _buildAmountRow(
                          'Total a pagar',
                          '\$${total.toStringAsFixed(2)}',
                          isBold: true,
                          valueColor: AppColors.textPrimary,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // ── Método de pago ──────────────────────────────────────
                  Text(
                    'Método de Pago',
                    style: GoogleFonts.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...(_methods.map(
                    (m) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _buildMethodTile(m),
                    ),
                  )),

                  const SizedBox(height: 12),

                  // ── Campos de Reporte ──────────────────────────────────
                  if (_selectedMethod == 'PAGO_MOVIL') ...[
                    _buildTextField('Teléfono', _phoneController, TextInputType.phone),
                    const SizedBox(height: 10),
                    _buildTextField('Nro. Referencia', _refController, TextInputType.number),
                  ] else if (_selectedMethod == 'ZELLE') ...[
                    _buildTextField('Correo Zelle', _emailController, TextInputType.emailAddress),
                    const SizedBox(height: 10),
                    _buildTextField('Referencia', _refController, TextInputType.text),
                  ] else ...[
                    _buildTextField('Nro. Referencia', _refController, TextInputType.number),
                  ],

                  const SizedBox(height: 16),

                  // ── Aviso ───────────────────────────────────────────────
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(LucideIcons.info,
                            size: 16, color: AppColors.primaryDark),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'El pago se registra en el sistema. Tu cuenta se reactivará automáticamente una vez confirmado.',
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              color: AppColors.primaryDark,
                              height: 1.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  if (_error != null) ...[
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.error.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Icon(LucideIcons.alertCircle,
                              size: 16, color: AppColors.error),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              _error!,
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                color: AppColors.error,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 32),

                  // ── Confirmar ───────────────────────────────────────────
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _confirmPayment,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.black,
                        disabledBackgroundColor:
                            AppColors.primary.withValues(alpha: 0.5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 0,
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                color: Colors.black,
                              ),
                            )
                          : Text(
                              'Confirmar Pago · \$${total.toStringAsFixed(2)}',
                              style: GoogleFonts.outfit(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
    );
  }

  Widget _buildSuccessState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                LucideIcons.checkCircle2,
                size: 56,
                color: AppColors.success,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              '¡Pago Confirmado!',
              style: GoogleFonts.outfit(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Tu cuota ha sido registrada exitosamente.',
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(
                fontSize: 15,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMethodTile(Map<dynamic, dynamic> method) {
    final isSelected = _selectedMethod == method['value'];
    return GestureDetector(
      onTap: () => setState(() => _selectedMethod = method['value'] as String),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withValues(alpha: 0.08) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? AppColors.primaryDark : AppColors.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              method['icon'] as IconData,
              size: 20,
              color: isSelected ? AppColors.primaryDark : AppColors.textSecondary,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                method['label'] as String,
                style: GoogleFonts.outfit(
                  fontWeight:
                      isSelected ? FontWeight.w600 : FontWeight.normal,
                  color: isSelected
                      ? AppColors.textPrimary
                      : AppColors.textSecondary,
                ),
              ),
            ),
            if (isSelected)
              const Icon(
                LucideIcons.checkCircle2,
                size: 18,
                color: AppColors.primaryDark,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildAmountRow(
    String label,
    String value, {
    bool isBold = false,
    Color? valueColor,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.outfit(
            fontSize: isBold ? 18 : 14,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            color: valueColor ?? AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, TextInputType type) {
    return TextField(
      controller: controller,
      keyboardType: type,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.outfit(color: AppColors.textSecondary),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primaryDark),
        ),
      ),
    );
  }
}
