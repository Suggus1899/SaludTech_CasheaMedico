import 'package:flutter/material.dart';

abstract class Responsive {
  static const double _tabletBreakpoint = 600.0;
  static const double _desktopBreakpoint = 900.0;
  static const double maxContentWidth = 480.0;
  static const double maxContentWidthWide = 640.0;

  static double screenWidth(BuildContext context) =>
      MediaQuery.of(context).size.width;

  static double screenHeight(BuildContext context) =>
      MediaQuery.of(context).size.height;

  static bool isTablet(BuildContext context) =>
      screenWidth(context) >= _tabletBreakpoint;

  static bool isDesktop(BuildContext context) =>
      screenWidth(context) >= _desktopBreakpoint;

  /// Horizontal padding: 48 on desktop, 32 on tablet, 24 on mobile.
  static double horizontalPadding(BuildContext context) {
    final w = screenWidth(context);
    if (w >= _desktopBreakpoint) return 48.0;
    if (w >= _tabletBreakpoint) return 32.0;
    return 24.0;
  }

  /// Wraps [child] in a centred ConstrainedBox for tablet/desktop forms.
  static Widget constrained(
    BuildContext context,
    Widget child, {
    double maxWidth = maxContentWidth,
  }) {
    if (!isTablet(context)) return child;
    return Center(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxWidth),
        child: child,
      ),
    );
  }

  /// Returns 1 on mobile, 2 on tablet.
  static int gridCrossAxisCount(BuildContext context, {int tabletCount = 2}) =>
      isTablet(context) ? tabletCount : 1;

  /// Font scale factor: 1.0 on mobile, 1.1 on tablet.
  static double fontScale(BuildContext context) =>
      isTablet(context) ? 1.1 : 1.0;
}
