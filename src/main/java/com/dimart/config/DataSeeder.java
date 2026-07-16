package com.dimart.config;

import com.dimart.model.Product;
import com.dimart.repository.ProductCatalogRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds the products table from products.json the first time the app starts
 * against an empty database. Safe to run every startup — it skips seeding
 * if products already exist.
 */
@Component
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final ProductCatalogRepository productRepo;
    private final ObjectMapper objectMapper;

    public DataSeeder(ProductCatalogRepository productRepo, ObjectMapper objectMapper) {
        this.productRepo = productRepo;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    @Transactional
    public void seed() {
        if (productRepo.count() > 0) {
            log.info("Products table already populated — skipping seed.");
            return;
        }

        try {
            ClassPathResource resource = new ClassPathResource("static/data/products.json");
            List<Product> products = objectMapper.readValue(
                    resource.getInputStream(),
                    new TypeReference<List<Product>>() {}
            );

            // Clear IDs so MySQL auto-increment assigns them cleanly
            products.forEach(p -> p.setId(null));
            productRepo.saveAll(products);
            log.info("Seeded {} products from products.json into MySQL.", products.size());
        } catch (IOException ex) {
            throw new RuntimeException("Failed to seed products from JSON", ex);
        }
    }
}
