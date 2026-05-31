import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../core/theme.dart';
import '../core/responsive.dart';
import '../services/api_service.dart';

class ElderCareScreen extends StatefulWidget {
  const ElderCareScreen({super.key});

  @override
  State<ElderCareScreen> createState() => _ElderCareScreenState();
}

class _ElderCareScreenState extends State<ElderCareScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;
  List<Map<String, dynamic>> _subscriptions = [];
  bool _isCancelling = false;

  // Service type definitions
  static final List<Map<String, dynamic>> _services = [
    {
      'type': 'NURSE',
      'label': 'Enfermera',
      'icon': LucideIcons.heart,
      'description': 'Cuidado de salud profesional en el hogar',
      'defaultAmount': 120.0,
      'color': const Color(0xFF8B5CF6),
    },
    {
      'type': 'CAREGIVER',
      'label': 'Cuidador/a',
      'icon': LucideIcons.heartHandshake,
      'description': 'Acompañamiento y asistencia diaria',
      'defaultAmount': 90.0,
      'color': const Color(0xFF6366F1),
    },
    {
      'type': 'PHYSIOTHERAPY',
      'label': 'Fisioterapia',
      'icon': LucideIcons.activity,
      'description': 'Rehabilitación y ejercicio terapéutico',
      'defaultAmount': 100.0,
      'color': const Color(0xFF7C3AED),
    },
    {
      'type': 'GERIATRIC_SPECIALIST',
      'label': 'Geriatría',
      'icon': LucideIcons.stethoscope,
      'description': 'Consulta especializada en adultos mayores',
      'defaultAmount': 150.0,
      'color': const Color(0xFF5B21B6),
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadSubscriptions();
  }

  Future<void> _loadSubscriptions() async {
    final subs = await ApiService().getElderCareSubscriptions();
    if (mounted) {
      setState(() {
        _subscriptions = subs ?? [];
        _isLoading = false;
      });
    }
  }

  Future<void> _cancelSubscription(String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          'Cancelar Suscripción',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
        content: Text(
          '¿Estás seguro? El cobro del próximo mes no se realizará.',
          style: GoogleFonts.outfit(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('No', style: GoogleFonts.outfit()),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: Text(
              'Cancelar',
              style: GoogleFonts.outfit(color: Colors.white),
            ),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    setState(() => _isCancelling = true);
    final success = await ApiService().cancelElderCareSubscription(id);
    if (mounted) {
      setState(() => _isCancelling = false);
      if (success) {
        _loadSubscriptions();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Suscripción cancelada'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
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
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Cuidado Mayor',
          style: GoogleFonts.outfit(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF7C3AED),
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: const Color(0xFF7C3AED),
          labelStyle: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
          tabs: const [
            Tab(text: 'Servicios'),
            Tab(text: 'Mis Suscripciones'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [_buildServicesTab(), _buildSubscriptionsTab()],
      ),
    );
  }

  Widget _buildServicesTab() {
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(
        horizontal: Responsive.horizontalPadding(context),
        vertical: 20,
      ),
      child: Responsive.constrained(
        context,
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildElderCareHero(),
            const SizedBox(height: 24),
            Text(
              'Servicios Disponibles',
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            ..._services.map((s) => _buildServiceCard(s)),
          ],
        ),
      ),
    );
  }

  Widget _buildElderCareHero() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF7C3AED), Color(0xFF5B21B6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(LucideIcons.shield, color: Colors.white, size: 36),
          const SizedBox(height: 12),
          Text(
            'Cuidado para tus seres queridos',
            style: GoogleFonts.outfit(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Suscripciones mensuales para adultos mayores usando tu línea MAYOR CUIDADO. Requiere nivel 4+.',
            style: GoogleFonts.outfit(
              fontSize: 13,
              color: Colors.white.withValues(alpha: 0.85),
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceCard(Map<String, dynamic> service) {
    final color = service['color'] as Color;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(service['icon'] as IconData, color: color, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  service['label'] as String,
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  service['description'] as String,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '\$${service['defaultAmount']}/mes',
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () => _showSubscribeDialog(service),
            style: ElevatedButton.styleFrom(
              backgroundColor: color,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            ),
            child: Text(
              'Suscribir',
              style: GoogleFonts.outfit(
                fontSize: 12,
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showSubscribeDialog(Map<String, dynamic> service) async {
    final amount = service['defaultAmount'] as double;
    // For MVP: use a hardcoded elder care merchant UUID
    // In production: load from /api/v1/merchants?category=ELDER_CARE
    const placeholderMerchantId = '00000000-0000-0000-0000-000000000001';

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(service['icon'] as IconData, color: service['color'] as Color),
            const SizedBox(width: 8),
            Text(
              service['label'] as String,
              style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Se cargará \$$amount/mes a tu línea MAYOR CUIDADO.',
              style: GoogleFonts.outfit(),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: (service['color'] as Color).withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  Icon(
                    LucideIcons.info,
                    size: 14,
                    color: service['color'] as Color,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Puedes cancelar en cualquier momento.',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancelar', style: GoogleFonts.outfit()),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: service['color'] as Color,
            ),
            child: Text(
              'Confirmar',
              style: GoogleFonts.outfit(color: Colors.white),
            ),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    try {
      await ApiService().createElderCareSubscription(
        merchantId: placeholderMerchantId,
        serviceType: service['type'] as String,
        monthlyAmount: amount,
      );
      if (mounted) {
        _loadSubscriptions();
        _tabController.animateTo(1);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('¡Suscripción activada! ${service['label']}'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Widget _buildSubscriptionsTab() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFF7C3AED)),
      );
    }
    if (_subscriptions.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                LucideIcons.shield,
                size: 56,
                color: Color(0xFFDDD6FE),
              ),
              const SizedBox(height: 16),
              Text(
                'Sin suscripciones activas',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Activa un servicio de cuidado en la pestaña "Servicios".',
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadSubscriptions,
      color: const Color(0xFF7C3AED),
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _subscriptions.length,
        itemBuilder: (_, i) => _buildSubscriptionCard(_subscriptions[i]),
      ),
    );
  }

  Widget _buildSubscriptionCard(Map<String, dynamic> sub) {
    final status = sub['status'] ?? 'ACTIVE';
    final isActive = status == 'ACTIVE';
    const purple = Color(0xFF7C3AED);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isActive
              ? purple.withValues(alpha: 0.2)
              : const Color(0xFFE2E8F0),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  sub['merchantName'] ?? 'Proveedor',
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: isActive
                      ? purple.withValues(alpha: 0.1)
                      : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  isActive ? 'Activa' : 'Cancelada',
                  style: GoogleFonts.outfit(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isActive ? purple : Colors.grey,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(
                LucideIcons.activity,
                size: 14,
                color: AppColors.textSecondary,
              ),
              const SizedBox(width: 4),
              Text(
                _translateServiceType(sub['serviceType'] ?? ''),
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
              const Spacer(),
              Text(
                '\$${(sub['monthlyAmount'] ?? 0).toStringAsFixed(2)}/mes',
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.w700,
                  color: purple,
                ),
              ),
            ],
          ),
          if (sub['nextBillingDate'] != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(
                  LucideIcons.calendar,
                  size: 14,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: 4),
                Text(
                  'Próximo cobro: ${_formatDate(sub['nextBillingDate'])}',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ],
          if (isActive) ...[
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: _isCancelling
                    ? null
                    : () => _cancelSubscription(sub['id']),
                icon: const Icon(LucideIcons.x, size: 14),
                label: Text(
                  'Cancelar',
                  style: GoogleFonts.outfit(fontSize: 13),
                ),
                style: TextButton.styleFrom(foregroundColor: AppColors.error),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _translateServiceType(String type) {
    const map = {
      'NURSE': 'Enfermera',
      'CAREGIVER': 'Cuidador/a',
      'PHYSIOTHERAPY': 'Fisioterapia',
      'GERIATRIC_SPECIALIST': 'Geriatría',
    };
    return map[type] ?? type;
  }

  String _formatDate(String? iso) {
    if (iso == null) return '—';
    try {
      final dt = DateTime.parse(iso).toLocal();
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return '—';
    }
  }
}
