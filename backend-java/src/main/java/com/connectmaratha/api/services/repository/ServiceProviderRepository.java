package com.connectmaratha.api.services.repository;

import com.connectmaratha.api.services.entity.ServiceProvider;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, String> {

    @Query(nativeQuery = true, value = "SELECT * FROM services WHERE status = 'active' ORDER BY created_at DESC")
    List<ServiceProvider> findActive();

    @Query(nativeQuery = true, value = "SELECT * FROM services ORDER BY created_at DESC")
    List<ServiceProvider> findAllNewest();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO services (id, name, category, location, phone, experience, pricing, description, created_by)
        VALUES (:id, :name, :category, :location, :phone, :experience, :pricing, :description, :createdBy)""")
    void insertProvider(@Param("id") String id, @Param("name") String name, @Param("category") String category,
                        @Param("location") String location, @Param("phone") String phone,
                        @Param("experience") String experience, @Param("pricing") String pricing,
                        @Param("description") String description, @Param("createdBy") String createdBy);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        UPDATE services SET name = :name, category = :category, location = :location, phone = :phone,
          experience = :experience, pricing = :pricing, description = :description, status = :status,
          updated_at = :updatedAt WHERE id = :id""")
    void updateProvider(@Param("id") String id, @Param("name") String name, @Param("category") String category,
                        @Param("location") String location, @Param("phone") String phone,
                        @Param("experience") String experience, @Param("pricing") String pricing,
                        @Param("description") String description, @Param("status") String status,
                        @Param("updatedAt") String updatedAt);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = "DELETE FROM services WHERE id = :id")
    void deleteProvider(@Param("id") String id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO service_bookings (id, service_id, service_category, professional_name, customer_id,
          customer_name, phone, address, requested_date, notes)
        VALUES (:id, :serviceId, :category, :professional, :customerId, :customerName, :phone, :address, :requestedDate, :notes)""")
    void insertBooking(@Param("id") String id, @Param("serviceId") String serviceId, @Param("category") String category,
                       @Param("professional") String professional, @Param("customerId") String customerId,
                       @Param("customerName") String customerName, @Param("phone") String phone,
                       @Param("address") String address, @Param("requestedDate") String requestedDate,
                       @Param("notes") String notes);
}
