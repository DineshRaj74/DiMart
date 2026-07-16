package com.dimart.repository;

import com.dimart.model.CartItem;
import com.dimart.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndProductIdAndSelectedSizeAndSelectedColor(
            User user, Long productId, String selectedSize, String selectedColor);
    void deleteByUser(User user);
}
