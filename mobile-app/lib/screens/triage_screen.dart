import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../core/theme.dart';
import '../services/api_service.dart';

class TriageScreen extends StatefulWidget {
  const TriageScreen({super.key});

  @override
  State<TriageScreen> createState() => _TriageScreenState();
}

class _TriageScreenState extends State<TriageScreen> {
  final TextEditingController _symptomsController = TextEditingController();
  double _severity = 5.0;
  bool _isLoading = true;
  bool _isSubmitting = false;
  List<Map<String, dynamic>> _triages = [];

  // Symptom category checkboxes
  final Map<String, bool> _categories = {
    'Dental': false,
    'Visión': false,
    'Cardíaco': false,
    'Fiebre': false,
    'Dolor pecho': false,
    'General': false,
  };

  @override
  void initState() {
    super.initState();
    _loadTriages();
  }

  Future<void> _loadTriages() async {
    final triages = await ApiService().getMyTriages();
    if (mounted) {
      setState(() {
        _triages = triages ?? [];
        _isLoading = false;
      });
    }
  }

  Future<void> _submitTriage() async {
    if (_symptomsController.text.trim().isEmpty) return;
    setState(() => _isSubmitting = true);

    // Append selected categories to symptoms text
    final selected = _categories.entries
        .where((e) => e.value)
        .map((e) => e.key)
        .join(', ');
    final fullSymptoms = selected.isEmpty
        ? _symptomsController.text.trim()
        : '${_symptomsController.text.trim()} [Categorías: $selected]';

    final res = await ApiService().submitTriage(fullSymptoms, _severity.toInt());

    if (mounted) {
      setState(() => _isSubmitting = false);
      if (res != null) {
        _symptomsController.clear();
        setState(() {
          _severity = 5.0;
          _categories.forEach((k, v) => _categories[k] = false);
        });
        _loadTriages();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Solicitud enviada. Un especialista la revisará pronto.'),
            backgroundColor: AppColors.success,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error al enviar la solicitud.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _loadRecommendedMerchants(String triageId) async {
    final merchants = await ApiService().getRecommendedMerchants(triageId);
    if (!mounted) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _MerchantsSheet(merchants: merchants ?? []),
    );
  }

  @override
  void dispose() {
    _symptomsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        title: Text(
          'Triaje Médico',
          style: GoogleFonts.outfit(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildNewTriageForm(),
            const SizedBox(height: 32),
            Text(
              'Historial de Consultas',
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 16),
            if (_isLoading)
              const Center(child: CircularProgressIndicator(color: AppColors.primary))
            else if (_triages.isEmpty)
              _buildEmptyState()
            else
              ..._triages.map((t) => _buildTriageCard(t)),
          ],
        ),
      ),
    );
  }

  Widget _buildNewTriageForm() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(LucideIcons.stethoscope, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Nueva Consulta',
                style: GoogleFonts.outfit(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Category checkboxes
          Text(
            'Tipo de síntoma',
            style: GoogleFonts.outfit(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 4,
            children: _categories.keys.map((cat) {
              return FilterChip(
                label: Text(cat, style: GoogleFonts.outfit(fontSize: 13)),
                selected: _categories[cat]!,
                onSelected: (val) => setState(() => _categories[cat] = val),
                selectedColor: AppColors.primary.withValues(alpha: 0.15),
                checkmarkColor: AppColors.primaryDark,
                labelStyle: GoogleFonts.outfit(
                  color: _categories[cat]! ? AppColors.primaryDark : AppColors.textSecondary,
                  fontWeight: _categories[cat]! ? FontWeight.w600 : FontWeight.normal,
                ),
                side: BorderSide(
                  color: _categories[cat]! ? AppColors.primary : const Color(0xFFE2E8F0),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _symptomsController,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Describe tus síntomas con detalle...',
              hintStyle: GoogleFonts.outfit(color: AppColors.textSecondary),
              filled: true,
              fillColor: AppColors.background,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Nivel de malestar',
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: _getSeverityColor(_severity.toInt()).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${_severity.toInt()}/10',
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold,
                    color: _getSeverityColor(_severity.toInt()),
                  ),
                ),
              ),
            ],
          ),
          Slider(
            value: _severity,
            min: 1,
            max: 10,
            divisions: 9,
            activeColor: _getSeverityColor(_severity.toInt()),
            onChanged: (val) => setState(() => _severity = val),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _submitTriage,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : Text(
                      'Enviar Síntomas',
                      style: GoogleFonts.outfit(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getSeverityColor(int severity) {
    if (severity >= 8) return AppColors.error;
    if (severity >= 5) return const Color(0xFFF97316);
    return AppColors.success;
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Text(
          'No tienes consultas de triaje previas.',
          style: GoogleFonts.outfit(color: AppColors.textSecondary),
        ),
      ),
    );
  }

  Widget _buildTriageCard(Map<String, dynamic> triage) {
    final status = triage['status'] ?? 'UNKNOWN';
    final urgency = triage['urgencyLevel'] ?? 'LOW';
    final specialty = triage['specialtyRecommended'];
    final doctorNotes = triage['doctorNotes'];
    final triageId = triage['id']?.toString() ?? '';

    Color statusColor = Colors.grey;
    String statusLabel = status;
    if (status == 'PENDING') { statusColor = Colors.orange; statusLabel = 'Pendiente'; }
    else if (status == 'REVIEWING') { statusColor = Colors.blue; statusLabel = 'En Revisión'; }
    else if (status == 'RESOLVED') { statusColor = AppColors.success; statusLabel = 'Resuelto'; }
    else if (status == 'REFERRED') { statusColor = AppColors.primary; statusLabel = 'Derivado'; }

    Color urgencyColor = AppColors.success;
    String urgencyLabel = 'Baja';
    if (urgency == 'EMERGENCY') { urgencyColor = AppColors.error; urgencyLabel = '🚨 EMERGENCIA'; }
    else if (urgency == 'HIGH') { urgencyColor = const Color(0xFFF97316); urgencyLabel = '⚠️ Alta'; }
    else if (urgency == 'MEDIUM') { urgencyColor = Colors.amber; urgencyLabel = '🔶 Media'; }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: urgency == 'EMERGENCY'
              ? AppColors.error.withValues(alpha: 0.4)
              : const Color(0xFFE2E8F0),
          width: urgency == 'EMERGENCY' ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Urgency badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: urgencyColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  urgencyLabel,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: urgencyColor,
                  ),
                ),
              ),
              // Status badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  statusLabel,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            triage['symptoms'] ?? '',
            style: GoogleFonts.outfit(fontSize: 14, color: AppColors.textSecondary),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),

          // AI Summary
          if (triage['aiSummary'] != null) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(LucideIcons.bot, size: 15, color: AppColors.primary),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      triage['aiSummary'],
                      style: GoogleFonts.outfit(fontSize: 12, color: AppColors.primaryDark),
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Specialty + CTA buttons
          if (specialty != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primary.withValues(alpha: 0.08), AppColors.primary.withValues(alpha: 0.02)],
                ),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(LucideIcons.stethoscope, size: 14, color: AppColors.primaryDark),
                      const SizedBox(width: 6),
                      Text(
                        'Especialidad: ${_translateSpecialty(specialty)}',
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryDark,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _loadRecommendedMerchants(triageId),
                          icon: const Icon(LucideIcons.mapPin, size: 14),
                          label: Text('Ver especialistas', style: GoogleFonts.outfit(fontSize: 12)),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.primaryDark,
                            side: const BorderSide(color: AppColors.primary),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],

          // Doctor response
          if (doctorNotes != null && status == 'RESOLVED') ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(LucideIcons.userCheck, size: 15, color: AppColors.successDark),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Respuesta médica',
                          style: GoogleFonts.outfit(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.successDark,
                          ),
                        ),
                        Text(
                          doctorNotes,
                          style: GoogleFonts.outfit(fontSize: 13, color: AppColors.successDark),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _translateSpecialty(String specialty) {
    const map = {
      'GENERAL_PRACTICE': 'Medicina General',
      'CARDIOLOGY': 'Cardiología',
      'DENTISTRY': 'Odontología',
      'OPHTHALMOLOGY': 'Oftalmología',
      'INTERNAL_MEDICINE': 'Medicina Interna',
      'EMERGENCY_MEDICINE': 'Emergencias',
    };
    return map[specialty] ?? specialty;
  }
}

// Bottom sheet for recommended merchants
class _MerchantsSheet extends StatelessWidget {
  final List<Map<String, dynamic>> merchants;
  const _MerchantsSheet({required this.merchants});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40, height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Especialistas Disponibles',
            style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 16),
          if (merchants.isEmpty)
            Center(
              child: Text('No hay especialistas disponibles en tu área.',
                style: GoogleFonts.outfit(color: AppColors.textSecondary)),
            )
          else
            ...merchants.map((m) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(LucideIcons.building2, color: AppColors.primaryDark, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(m['tradeName'] ?? '', style: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                        Text(m['city'] ?? '', style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                ],
              ),
            )),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
