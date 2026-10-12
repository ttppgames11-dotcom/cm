import '../models/builder_project.dart';

abstract class BuildersRepository {
  /// Fetches all builder project records.
  Future<List<BuilderProject>> getProjects();

  /// Fetches a single builder project by ID.
  Future<BuilderProject> getProjectById(String id);

  /// Submits an enquiry for a specific builder project.
  Future<Map<String, dynamic>> submitEnquiry(
    String projectId, {
    required String name,
    required String phone,
    String? budget,
    String? preferredCity,
    String? message,
  });
}
