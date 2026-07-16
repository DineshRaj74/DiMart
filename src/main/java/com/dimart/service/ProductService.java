package com.dimart.service;

import com.dimart.model.Product;
import com.dimart.repository.ProductCatalogRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductCatalogRepository repository;

    public ProductService(ProductCatalogRepository repository) {
        this.repository = repository;
    }

    public List<Product> findProducts(String query, String category, Double minPrice, Double maxPrice) {
        // Normalize blanks to null so the JPQL IS NULL checks work correctly
        String q  = (query    == null || query.isBlank())    ? null : query.trim();
        String c  = (category == null || category.isBlank()) ? null : category.trim();
        return repository.search(q, c, minPrice, maxPrice);
    }

    public Product getProduct(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
    }

    @Transactional
    public Product saveProduct(Product product) {
        return repository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Product not found: " + id);
        }
        repository.deleteById(id);
    }
}
