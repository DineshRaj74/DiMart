package com.dimart.repository;

import com.dimart.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductCatalogRepository extends JpaRepository<Product, Long> {

    /**
     * Filter by name/category keyword, category slug, and price range.
     * All params are optional — pass null to skip that filter.
     */
    @Query("""
        SELECT p FROM Product p
        WHERE (:query IS NULL OR :query = ''
               OR LOWER(p.name)     LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')))
          AND (:category IS NULL OR :category = ''
               OR LOWER(p.category) = LOWER(:category))
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        ORDER BY p.id ASC
        """)
    List<Product> search(
            @Param("query")    String query,
            @Param("category") String category,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice
    );
}
