import 'package:flutter/material.dart';

/// Paleta oficial do EconoWay.
/// Conceito visual: tecnologia + economia + sustentabilidade.
class AppColors {
  static const Color primary = Color(
    0xFF0B5345,
  ); // Verde Adam Banks (Deep Forest)
  static const Color secondary = Color(0xFF2ECC71); // Verde Menta (Mint Eco)
  static const Color backgroundDark = Color(0xFF111827); // Slate Black
  static const Color backgroundLight = Color(0xFFF9FAFB); // Off-White
}

class AppTheme {
  static ThemeData get light => ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: AppColors.backgroundLight,
    colorScheme: ColorScheme.light(
      primary: AppColors.primary,
      secondary: AppColors.secondary,
      surface: AppColors.backgroundLight,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.primary,
      foregroundColor: Colors.white,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    ),
  );

  static ThemeData get dark => ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: AppColors.backgroundDark,
    colorScheme: ColorScheme.dark(
      primary: AppColors.secondary,
      secondary: AppColors.primary,
      surface: AppColors.backgroundDark,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.backgroundDark,
      foregroundColor: AppColors.secondary,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.secondary,
        foregroundColor: AppColors.backgroundDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    ),
  );
}
