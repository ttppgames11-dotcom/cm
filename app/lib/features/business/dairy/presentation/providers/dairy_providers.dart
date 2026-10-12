import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import '../../domain/models/dairy_item.dart';
import '../../domain/models/dairy_product.dart';
import '../../domain/repositories/dairy_repository.dart';
import '../../data/dairy_repository_impl.dart';

final dairyRepositoryProvider = Provider<DairyRepository>((ref) {
  final api = ref.watch(apiClientProvider);
  return DairyRepositoryImpl(api);
});

/// Raw fetch provider for all dairy records (centres and brands)
final dairyItemsProvider = FutureProvider.autoDispose<List<DairyItem>>((ref) async {
  final repo = ref.watch(dairyRepositoryProvider);
  return repo.getDairyItems();
});

/// Raw fetch provider for all dairy products
final dairyProductsProvider = FutureProvider.autoDispose<List<DairyProductItem>>((ref) async {
  final repo = ref.watch(dairyRepositoryProvider);
  return repo.getProducts();
});

/// Search query for collection centres (matches name, village, taluka)
final dairySearchQueryProvider = StateProvider<String>((ref) => '');

/// Selected district filter for collection centres
final dairyDistrictFilterProvider = StateProvider<String?>((ref) => null);

/// Selected category filter for products
final dairyCategoryFilterProvider = StateProvider<String?>((ref) => null);

/// Distinct list of districts derived dynamically from collection centres
final allDairyDistrictsProvider = Provider<List<String>>((ref) {
  final asyncItems = ref.watch(dairyItemsProvider);
  return asyncItems.when(
    data: (items) {
      final Set<String> districts = {};
      for (final item in items) {
        if (item.isCentre && item.district != null && item.district!.trim().isNotEmpty) {
          final clean = item.district!.replaceAll('जि.', '').trim();
          if (clean.isNotEmpty) districts.add(clean);
        }
      }
      return districts.toList()..sort();
    },
    loading: () => [],
    error: (_, __) => [],
  );
});

/// Brand organizations for the horizontal top row in Products Tab
final dairyBrandsProvider = Provider<List<DairyItem>>((ref) {
  final asyncItems = ref.watch(dairyItemsProvider);
  return asyncItems.when(
    data: (items) => items.where((i) => i.isBrand).toList(),
    loading: () => [],
    error: (_, __) => [],
  );
});

/// Filtered list of collection centres based on search query and district filter
final filteredCollectionCentresProvider = Provider<List<DairyItem>>((ref) {
  final asyncItems = ref.watch(dairyItemsProvider);
  final query = ref.watch(dairySearchQueryProvider).trim().toLowerCase();
  final selectedDistrict = ref.watch(dairyDistrictFilterProvider);

  return asyncItems.when(
    data: (items) {
      return items.where((item) {
        if (!item.isCentre) return false;

        // 1. Search Query filter (matches name, village, taluka)
        if (query.isNotEmpty) {
          final nameMatch = (item.dairyName ?? '').toLowerCase().contains(query);
          final villageMatch = (item.village ?? '').toLowerCase().contains(query);
          final talukaMatch = (item.taluka ?? '').toLowerCase().contains(query);
          final headMatch = (item.centerHead ?? '').toLowerCase().contains(query);
          if (!nameMatch && !villageMatch && !talukaMatch && !headMatch) {
            return false;
          }
        }

        // 2. District filter
        if (selectedDistrict != null &&
            selectedDistrict.isNotEmpty &&
            selectedDistrict != 'सर्व') {
          final distStr = (item.district ?? '').toLowerCase();
          if (!distStr.contains(selectedDistrict.toLowerCase())) {
            return false;
          }
        }

        return true;
      }).toList();
    },
    loading: () => [],
    error: (_, __) => [],
  );
});

/// Filtered list of products based on category filter chip
final filteredDairyProductsProvider = Provider<List<DairyProductItem>>((ref) {
  final asyncProducts = ref.watch(dairyProductsProvider);
  final selectedCategory = ref.watch(dairyCategoryFilterProvider);

  return asyncProducts.when(
    data: (products) {
      if (selectedCategory == null ||
          selectedCategory.isEmpty ||
          selectedCategory == 'सर्व') {
        return products;
      }
      return products
          .where((p) => p.category.toLowerCase() == selectedCategory.toLowerCase())
          .toList();
    },
    loading: () => [],
    error: (_, __) => [],
  );
});

/// In-memory draft for Farmer Registration
class FarmerRegistrationDraft {
  final String farmerName;
  final String phone;
  final String village;
  final int cattleCount;
  final String milkType;
  final double expectedDailyLitres;

  const FarmerRegistrationDraft({
    this.farmerName = '',
    this.phone = '',
    this.village = '',
    this.cattleCount = 2,
    this.milkType = 'cow',
    this.expectedDailyLitres = 20.0,
  });

  FarmerRegistrationDraft copyWith({
    String? farmerName,
    String? phone,
    String? village,
    int? cattleCount,
    String? milkType,
    double? expectedDailyLitres,
  }) {
    return FarmerRegistrationDraft(
      farmerName: farmerName ?? this.farmerName,
      phone: phone ?? this.phone,
      village: village ?? this.village,
      cattleCount: cattleCount ?? this.cattleCount,
      milkType: milkType ?? this.milkType,
      expectedDailyLitres: expectedDailyLitres ?? this.expectedDailyLitres,
    );
  }
}

final farmerRegistrationDraftProvider = StateProvider<FarmerRegistrationDraft>((ref) {
  try {
    final auth = ref.watch(authControllerProvider);
    final profile = auth.state.profile;
    return FarmerRegistrationDraft(
      farmerName: profile?.name ?? '',
      village: profile?.city ?? '',
    );
  } catch (_) {
    return const FarmerRegistrationDraft();
  }
});

/// In-memory draft for Product Order/Enquiry
class ProductEnquiryDraft {
  final String name;
  final String phone;
  final String quantity;
  final String deliveryCity;
  final String message;

  const ProductEnquiryDraft({
    this.name = '',
    this.phone = '',
    this.quantity = '',
    this.deliveryCity = '',
    this.message = '',
  });

  ProductEnquiryDraft copyWith({
    String? name,
    String? phone,
    String? quantity,
    String? deliveryCity,
    String? message,
  }) {
    return ProductEnquiryDraft(
      name: name ?? this.name,
      phone: phone ?? this.phone,
      quantity: quantity ?? this.quantity,
      deliveryCity: deliveryCity ?? this.deliveryCity,
      message: message ?? this.message,
    );
  }
}

final dairyProductEnquiryDraftProvider = StateProvider<ProductEnquiryDraft>((ref) {
  try {
    final auth = ref.watch(authControllerProvider);
    final profile = auth.state.profile;
    return ProductEnquiryDraft(
      name: profile?.name ?? '',
      deliveryCity: profile?.city ?? '',
    );
  } catch (_) {
    return const ProductEnquiryDraft();
  }
});
