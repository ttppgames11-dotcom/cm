import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../widgets/home/home_models.dart';
import 'home_provider.dart';

/// Provider for all upcoming events.
final eventsProvider = FutureProvider<List<UpcomingEventData>>((ref) async {
  final repository = ref.watch(homeRepositoryProvider);
  return repository.getAllUpcomingEvents();
});

/// Provider for the primary featured event.
final featuredEventProvider = FutureProvider<UpcomingEventData>((ref) async {
  final repository = ref.watch(homeRepositoryProvider);
  return repository.getUpcomingEvent();
});
