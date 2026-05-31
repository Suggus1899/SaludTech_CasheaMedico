import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../core/theme.dart';
import '../core/responsive.dart';
import '../models/user_response.dart';
import '../services/api_service.dart';
import 'qr_scanner_screen.dart';
import 'installments_screen.dart';
import 'subscriptions_screen.dart';
import 'triage_screen.dart';
import 'gamification_screen.dart';
import 'elder_care_screen.dart';

class HomeScreen extends StatefulWidget {
  final UserResponse user;

  const HomeScreen({super.key, required this.user});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  List<Map<String, dynamic>> _creditLines = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCreditLines();
  }

  Future<void> _loadCreditLines() async {
    final lines = await ApiService().getCreditLines();
    if (mounted) {
      setState(() {
        _creditLines = lines ?? [];
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hola, ${widget.user.firstName} 👋',
              style: GoogleFonts.outfit(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            Text(
              'Bienvenido de vuelta',
              style: GoogleFonts.outfit(
                color: AppColors.textSecondary,
                fontSize: 12,
              ),
            ),
          ],
        ),
        actions: [
          Tooltip(
            message: 'Notificaciones',
            child: Stack(
              children: [
                IconButton(
                  icon: const Icon(
                    LucideIcons.bell,
                    color: AppColors.textSecondary,
                  ),
                  onPressed: () {},
                  tooltip: 'Notificaciones',
                ),
                Positioned(
                  right: 10,
                  top: 10,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.error,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.fromLTRB(
          Responsive.horizontalPadding(context),
          20,
          Responsive.horizontalPadding(context),
          32,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              )
            else if (_creditLines.isEmpty)
              const Center(child: Text("No hay líneas de crédito disponibles"))
            else
              _buildCreditLinesPageView(),

            const SizedBox(height: 28),

            // ── Acciones rápidas ──────────────────────────────────────────
            Text(
              'Acciones Rápidas',
              style: GoogleFonts.outfit(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                _buildActionButton(
                  context: context,
                  icon: LucideIcons.stethoscope,
                  label: 'Triaje',
                  color: AppColors.primary,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const TriageScreen()),
                  ),
                ),
                const SizedBox(width: 12),
                _buildActionButton(
                  context: context,
                  icon: LucideIcons.qrCode,
                  label: 'Pagar',
                  color: const Color(0xFF6366F1),
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const QrScannerScreen()),
                  ),
                ),
                const SizedBox(width: 12),
                _buildActionButton(
                  context: context,
                  icon: LucideIcons.pill,
                  label: 'Medicinas',
                  color: AppColors.success,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const SubscriptionsScreen(),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                _buildActionButton(
                  context: context,
                  icon: LucideIcons.shield,
                  label: 'Cuidado\nMayor',
                  color: const Color(0xFF7C3AED),
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ElderCareScreen()),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Second row of quick actions
            Row(
              children: [
                _buildActionButton(
                  context: context,
                  icon: LucideIcons.calendarDays,
                  label: 'Cuotas',
                  color: const Color(0xFF0EA5E9),
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const InstallmentsScreen(),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 28),

            // ── Próximos pagos ────────────────────────────────────────────
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Próximos Pagos',
                  style: GoogleFonts.outfit(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                TextButton(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const InstallmentsScreen(),
                    ),
                  ),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    padding: EdgeInsets.zero,
                  ),
                  child: Text(
                    'Ver todas',
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primaryDark,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildPaymentCard(
              storeName: 'Farmatodo',
              installment: '1 de 3',
              dueLabel: 'Vence en 2 días',
              amount: '\$15.00',
              isUrgent: true,
            ),
            const SizedBox(height: 10),
            _buildPaymentCard(
              storeName: 'Clínica Ávila',
              installment: '2 de 6',
              dueLabel: 'Vence el 15 jun',
              amount: '\$350.00',
              isUrgent: false,
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (i) => setState(() => _selectedIndex = i),
        selectedItemColor: AppColors.primaryDark,
        unselectedItemColor: AppColors.textSecondary,
        backgroundColor: Colors.white,
        elevation: 8,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: GoogleFonts.outfit(
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: GoogleFonts.outfit(fontSize: 11),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.home),
            label: 'Inicio',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.qrCode),
            label: 'Comprar',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.calendarDays),
            label: 'Cuotas',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.user),
            label: 'Perfil',
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required BuildContext context,
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          splashColor: color.withValues(alpha: 0.12),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 18),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: color, size: 22),
                ),
                const SizedBox(height: 10),
                Text(
                  label,
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentCard({
    required String storeName,
    required String installment,
    required String dueLabel,
    required String amount,
    required bool isUrgent,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isUrgent
              ? AppColors.error.withValues(alpha: 0.3)
              : const Color(0xFFE2E8F0),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isUrgent
                  ? AppColors.error.withValues(alpha: 0.1)
                  : AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isUrgent ? LucideIcons.alertCircle : LucideIcons.clock,
              color: isUrgent ? AppColors.error : AppColors.primaryDark,
              size: 20,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Cuota $installment · $storeName',
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  dueLabel,
                  style: GoogleFonts.outfit(
                    color: isUrgent ? AppColors.error : AppColors.textSecondary,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          Text(
            amount,
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  // PageView with dots to show all 3 credit lines horizontally
  final PageController _creditPageController = PageController();
  int _currentCreditPage = 0;

  Widget _buildCreditLinesPageView() {
    final isTablet = Responsive.isTablet(context);
    if (isTablet) {
      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.6,
        ),
        itemCount: _creditLines.length,
        itemBuilder: (_, i) => _buildCreditLineCard(_creditLines[i]),
      );
    }
    return Column(
      children: [
        SizedBox(
          height: 240,
          child: PageView.builder(
            controller: _creditPageController,
            itemCount: _creditLines.length,
            onPageChanged: (i) => setState(() => _currentCreditPage = i),
            itemBuilder: (_, i) => Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: _buildCreditLineCard(_creditLines[i]),
            ),
          ),
        ),
        if (_creditLines.length > 1) ...[
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_creditLines.length, (i) {
              final isActive = i == _currentCreditPage;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: isActive ? 20 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: isActive ? AppColors.primary : const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(3),
                ),
              );
            }),
          ),
        ],
      ],
    );
  }

  Widget _buildCreditLineCard(Map<String, dynamic> line) {
    final type = line['type'] as String? ?? 'ESPECIALIDAD_PRINCIPAL';
    final limitAmount = (line['limitAmount'] as num?)?.toDouble() ?? 0.0;
    final available = (line['available'] as num?)?.toDouble() ?? 0.0;
    final used = limitAmount - available;
    final progress = limitAmount > 0 ? (used / limitAmount) : 0.0;

    String title = 'Línea de Salud';
    Color primaryColor = AppColors.primary;
    Color secondaryColor = AppColors.primaryDark;
    IconData lineIcon = LucideIcons.creditCard;

    switch (type) {
      case 'SALUD_COTIDIANA':
        title = 'Salud Cotidiana';
        primaryColor = const Color(0xFF34D399);
        secondaryColor = const Color(0xFF10B981);
        lineIcon = LucideIcons.pill;
        break;
      case 'MAYOR_CUIDADO':
        title = 'Mayor Cuidado';
        primaryColor = const Color(0xFFA78BFA);
        secondaryColor = const Color(0xFF7C3AED);
        lineIcon = LucideIcons.shield;
        break;
      default: // ESPECIALIDAD_PRINCIPAL
        title = 'Especialidad Principal';
        primaryColor = const Color(0xFF60A5FA);
        secondaryColor = const Color(0xFF2563EB);
        lineIcon = LucideIcons.stethoscope;
    }

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [primaryColor, secondaryColor],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: primaryColor.withValues(alpha: 0.35),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    lineIcon,
                    size: 16,
                    color: Colors.black.withValues(alpha: 0.6),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    title,
                    style: GoogleFonts.outfit(
                      color: Colors.black.withValues(alpha: 0.75),
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => GamificationScreen(user: widget.user),
                    ),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        LucideIcons.award,
                        color: Colors.black87,
                        size: 14,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Nivel ${widget.user.level}',
                        style: GoogleFonts.outfit(
                          color: Colors.black.withValues(alpha: 0.85),
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            '\$${available.toStringAsFixed(2)}',
            style: GoogleFonts.outfit(
              color: Colors.black,
              fontSize: 42,
              fontWeight: FontWeight.bold,
              height: 1,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Disponible para financiar',
            style: GoogleFonts.outfit(
              color: Colors.black.withValues(alpha: 0.65),
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 20),
          // Progress bar
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Utilizado',
                    style: GoogleFonts.outfit(
                      color: Colors.black.withValues(alpha: 0.65),
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    '\$${used.toStringAsFixed(2)} / \$${limitAmount.toStringAsFixed(2)}',
                    style: GoogleFonts.outfit(
                      color: Colors.black.withValues(alpha: 0.85),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: progress,
                  backgroundColor: Colors.black.withValues(alpha: 0.15),
                  valueColor: const AlwaysStoppedAnimation<Color>(
                    Colors.black54,
                  ),
                  minHeight: 5,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
