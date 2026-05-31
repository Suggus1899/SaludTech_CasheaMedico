import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../core/theme.dart';
import '../core/responsive.dart';
import '../services/api_service.dart';

class InstallmentsScreen extends StatefulWidget {
  const InstallmentsScreen({super.key});

  @override
  State<InstallmentsScreen> createState() => _InstallmentsScreenState();
}

class _InstallmentsScreenState extends State<InstallmentsScreen>
    with SingleTickerProviderStateMixin {
  final ApiService _api = ApiService();
  late TabController _tabController;
  List<dynamic> _installments = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadInstallments();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadInstallments() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final data = await _api.getMyInstallments();
      setState(() {
        _installments = data ?? [];
      });
    } catch (e) {
      setState(() => _error = 'No se pudieron cargar las cuotas.');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  List<dynamic> get _pending =>
      _installments.where((i) => i['status'] == 'PENDING').toList();
  List<dynamic> get _overdue =>
      _installments.where((i) => i['status'] == 'OVERDUE').toList();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
        title: Text(
          'Mis Cuotas',
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 20),
            onPressed: _loadInstallments,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w600),
          tabs: [
            Tab(text: 'Pendientes (${_pending.length})'),
            Tab(text: 'En mora (${_overdue.length})'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : _error != null
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    LucideIcons.wifiOff,
                    size: 48,
                    color: AppColors.textMuted,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _error!,
                    style: GoogleFonts.outfit(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loadInstallments,
                    child: const Text('Reintentar'),
                  ),
                ],
              ),
            )
          : TabBarView(
              controller: _tabController,
              children: [
                _buildInstallmentList(
                  _pending,
                  emptyMsg: 'Sin cuotas pendientes',
                ),
                _buildInstallmentList(
                  _overdue,
                  isOverdue: true,
                  emptyMsg: 'Sin cuotas en mora',
                ),
              ],
            ),
    );
  }

  Widget _buildInstallmentList(
    List<dynamic> items, {
    bool isOverdue = false,
    required String emptyMsg,
  }) {
    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isOverdue ? LucideIcons.checkCircle2 : LucideIcons.calendarCheck,
              size: 56,
              color: isOverdue ? AppColors.primary : AppColors.textMuted,
            ),
            const SizedBox(height: 16),
            Text(
              emptyMsg,
              style: GoogleFonts.outfit(
                fontSize: 16,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _loadInstallments,
      child: ListView.separated(
        padding: EdgeInsets.symmetric(
          horizontal: Responsive.horizontalPadding(context),
          vertical: 20,
        ),
        itemCount: items.length,
        separatorBuilder: (_, index) => const SizedBox(height: 12),
        itemBuilder: (_, i) {
          final inst = items[i];
          final amount = (inst['amount'] ?? 0.0).toDouble();
          final fee = (inst['reactivationFee'] ?? 0.0).toDouble();
          final dueDate = inst['dueDate'] ?? '';
          final num = inst['installmentNum'] ?? 0;
          final total = amount + fee;

          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isOverdue ? Colors.red.shade200 : AppColors.border,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: isOverdue
                        ? Colors.red.shade50
                        : AppColors.primary.withValues(alpha: 0.08),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isOverdue ? LucideIcons.alertTriangle : LucideIcons.clock,
                    color: isOverdue ? Colors.red : AppColors.primary,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Cuota #$num',
                        style: GoogleFonts.outfit(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        'Vence: $dueDate',
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      if (fee > 0)
                        Text(
                          'Recargo reactivación: \$${fee.toStringAsFixed(2)}',
                          style: GoogleFonts.outfit(
                            fontSize: 11,
                            color: Colors.red.shade600,
                          ),
                        ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '\$${total.toStringAsFixed(2)}',
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 17,
                        color: isOverdue ? Colors.red : AppColors.textPrimary,
                      ),
                    ),
                    if (fee > 0)
                      Text(
                        'base \$${amount.toStringAsFixed(2)}',
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          color: AppColors.textMuted,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
