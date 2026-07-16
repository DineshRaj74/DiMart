package com.dimart.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 160)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 90)
    private String category;

    @Positive
    @Column(nullable = false)
    private double price;

    @Min(0)
    @Column(name = "compare_at_price")
    private double compareAtPrice;

    @Min(0)
    @Column(name = "discount_percent")
    private int discount;

    @Min(0)
    @Column
    private double rating;

    @Column(length = 40)
    private String badge;

    @Column(length = 500)
    private String image;

    @Column(columnDefinition = "TEXT")
    private String description;

    public Product() {}

    public Product(Long id, String name, String category, double price, double compareAtPrice,
                   int discount, double rating, String badge, String image, String description) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.compareAtPrice = compareAtPrice;
        this.discount = discount;
        this.rating = rating;
        this.badge = badge;
        this.image = image;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public double getCompareAtPrice() { return compareAtPrice; }
    public void setCompareAtPrice(double compareAtPrice) { this.compareAtPrice = compareAtPrice; }
    public int getDiscount() { return discount; }
    public void setDiscount(int discount) { this.discount = discount; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}