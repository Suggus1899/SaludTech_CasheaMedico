import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../core/theme.dart';
import '../services/api_service.dart';
import 'elder_care_screen.dart';

class SubscriptionsScreen extends StatefulWidget {
  const SubscriptionsScreen({super.key});

  @override
  State<SubscriptionsScreen> createState() => _SubscriptionsScreenState();
}

class _SubscriptionsScreenState extends State<SubscriptionsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoadingPharmacy = true;
  bool _isLoadingElderCare = true;
  bool _isCancelling = false;
  List<Map<String, dynamic>> _pharmacySubs = [];
  List<Map<String, dynamic>> _elderCareSubs = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadAll();
  }

  Future<void> _loadAll() async {
    final pharmacy = ApiService().getSubscriptions();
    final elderCare = ApiService().getElderCareSubscriptions();
    final results = await Future.wait([pharmacy, elderCare]);
    if (mounted) {
      setState(() {
        _pharmacySubs =
            (results[0] as List?)?.cast<Map<String, dynamic>>() ?? [];
        _elderCareSubs =
            (results[1] as List?)?.cast<Map<String, dynamic>>() ?? [];
        _isLoadingPharmacy = false;
        _isLoadingElderCare = false;
      });
    }
  }

  Future<void> _cancelPharmacy(String id) async {
    final confirmed = await _confirmCancel(context);
    if (confirmed != true) return;
    setState(() => _isCancelling = true);
    final ok = await ApiService().cancelSubscription(id);
    if (mounted) {
      setState(() => _isCancelling = false);
      if (ok) _loadAll();
    }
  }

  Future<void> _cancelElderCare(String id) async {
    final confirmed = await _confirmCancel(context);
    if (confirmed != true) return;
    setState(() => _isCancelling = true);
    final ok = await ApiService().cancelElderCareSubscription(id);
    if (mounted) {
      setState(() => _isCancelling = false);
      if (ok) _loadAll();
    }
  }

  Future<bool?> _confirmCancel(BuildContext ctx) {
    return showDialog<bool>(
      context: ctx,
      builder: (c) => AlertDialog(
        title: Text(
          'Cancelar Suscripción',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
        content: Text(
          '¿El próximo cobro mensual no se realizará.',
          style: GoogleFonts.outfit(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(c, false),
            child: Text('No', style: GoogleFonts.outfit()),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(c, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: Text(
              'Sí, cancelar',
              style: GoogleFonts.outfit(color: Colors.white),
            ),
          ),
        ],
      ),
    );
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
        title: Text(
          'Mis Suscripciones',
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
        actions: [
          IconButton(
            icon: const Icon(
              LucideIcons.refreshCw,
              color: AppColors.textSecondary,
            ),
            onPressed: _loadAll,
            tooltip: 'Actualizar',
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryDark,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          labelStyle: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
          tabs: [
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(LucideIcons.pill, size: 14),
                  const SizedBox(width: 4),
                  const Text('Farmacia'),
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(LucideIcons.shield, size: 14),
                  const SizedBox(width: 4),
                  const Text('Elder Care'),
                ],
              ),
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [_buildPharmacyTab(), _buildElderCareTab()],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          if (_tabController.index == 1) {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ElderCareScreen()),
            ).then((_) => _loadAll());
          }
          // Pharmacy creation handled in a different flow (QR scan)
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(LucideIcons.plus, color: Colors.white),
        label: Text(
          _tabController.index == 0 ? 'Desde QR' : 'Nuevo Servicio',
          style: GoogleFonts.outfit(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildPharmacyTab() {
    if (_isLoadingPharmacy) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }
    if (_pharmacySubs.isEmpty) {
      return _emptyState(
        icon: LucideIcons.pill,
        title: 'Sin suscripciones de farmacia',
        subtitle: 'Vincula tu farmacia preferida escaneando un código QR.',
        color: AppColors.success,
      );
    }
    return RefreshIndicator(
      onRefresh: _loadAll,
      color: AppColors.primary,
      child: ListView.separated(
        padding: const EdgeInsets.all(20),
        physics: const AlwaysScrollableScrollPhysics(),
        itemCount: _pharmacySubs.length,
        separatorBuilder: (_, _) => const SizedBox(height: 12),
        itemBuilder: (_, i) => _pharmacyCard(_pharmacySubs[i]),
      ),
    );
  }

  Widget _pharmacyCard(Map<String, dynamic> sub) {
    final status = sub['status'] ?? 'UNKNOWN';
    final isActive = status == 'ACTIVE';
    final nextBilling = sub['nextBillingDate'];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isActive
              ? AppColors.success.withValues(alpha: 0.3)
              : const Color(0xFFE2E8F0),
        ),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  sub['productName'] ?? 'Medicina',
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              _statusBadge(isActive),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(
                LucideIcons.store,
                size: 14,
                color: AppColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(
                sub['merchantName'] ?? '—',
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
              const Spacer(),
              Text(
                '\$${(sub['amount'] ?? 0).toStringAsFixed(2)}/mes',
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.w700,
                  color: AppColors.success,
                ),
              ),
            ],
          ),
          if (nextBilling != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(
                  LucideIcons.calendar,
                  size: 14,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: 6),
                Text(
                  'Próximo cobro: ${_fmtDate(nextBilling)}',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ],
          if (isActive) ...[
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: _isCancelling
                    ? null
                    : () => _cancelPharmacy(sub['id']),
                icon: const Icon(LucideIcons.x, size: 13),
                label: Text(
                  'Cancelar',
                  style: GoogleFonts.outfit(fontSize: 12),
                ),
                style: TextButton.styleFrom(foregroundColor: AppColors.error),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildElderCareTab() {
    if (_isLoadingElderCare) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFF7C3AED)),
      );
    }
    if (_elderCareSubs.isEmpty) {
      return _emptyState(
        icon: LucideIcons.shield,
        title: 'Sin servicios Elder Care',
        subtitle:
            'Activa cuidados para adultos mayores desde la sección Elder Care.',
        color: const Color(0xFF7C3AED),
      );
    }
    return RefreshIndicator(
      onRefresh: _loadAll,
      color: const Color(0xFF7C3AED),
      child: ListView.separated(
        padding: const EdgeInsets.all(20),
        physics: const AlwaysScrollableScrollPhysics(),
        itemCount: _elderCareSubs.length,
        separatorBuilder: (_, _) => const SizedBox(height: 12),
        itemBuilder: (_, i) => _elderCareCard(_elderCareSubs[i]),
      ),
    );
  }

  Widget _elderCareCard(Map<String, dynamic> sub) {
    final status = sub['status'] ?? 'UNKNOWN';
    final isActive = status == 'ACTIVE';
    const purple = Color(0xFF7C3AED);

    const serviceLabels = {
      'NURSE': 'Enfermera',
      'CAREGIVER': 'Cuidador/a',
      'PHYSIOTHERAPY': 'Fisioterapia',
      'GERIATRIC_SPECIALIST': 'Geriatría',
    };

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isActive
              ? purple.withValues(alpha: 0.25)
              : const Color(0xFFE2E8F0),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                serviceLabels[sub['serviceType']] ?? sub['serviceType'] ?? '—',
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                  color: AppColors.textPrimary,
                ),
              ),
              _statusBadge(isActive, activeColor: purple),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(
                LucideIcons.building2,
                size: 14,
                color: AppColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  sub['merchantName'] ?? '—',
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
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
                const SizedBox(width: 6),
                Text(
                  'Próximo cobro: ${_fmtDate(sub['nextBillingDate'])}',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ],
          if (isActive) ...[
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: _isCancelling
                    ? null
                    : () => _cancelElderCare(sub['id']),
                icon: const Icon(LucideIcons.x, size: 13),
                label: Text(
                  'Cancelar',
                  style: GoogleFonts.outfit(fontSize: 12),
                ),
                style: TextButton.styleFrom(foregroundColor: AppColors.error),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _statusBadge(bool isActive, {Color? activeColor}) {
    final color = isActive ? (activeColor ?? AppColors.success) : Colors.grey;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        isActive ? 'Activa' : 'Cancelada',
        style: GoogleFonts.outfit(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  Widget _emptyState({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 48, color: color),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _fmtDate(String? iso) {
    if (iso == null) return '—';
    try {
      final dt = DateTime.parse(iso).toLocal();
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return '—';
    }
  }
}
