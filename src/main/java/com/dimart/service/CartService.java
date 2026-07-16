package com.dimart.service;

import com.dimart.model.CartItem;
import com.dimart.model.CartItemRequest;
import com.dimart.model.CartLine;
import com.dimart.model.Product;
import com.dimart.model.User;
import com.dimart.repository.CartItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final UserService userService;

    public CartService(CartItemRepository cartItemRepository,
                       ProductService productService,
                       UserService userService) {
        this.cartItemRepository = cartItemRepository;
        this.productService = productService;
        this.userService = userService;
    }

    public List<CartLine> getCart(String email) {
        User user = userService.getOrCreateByEmail(email, null);
        return cartItemRepository.findByUser(user).stream()
                .map(item -> new CartLine(
                        item.getProduct(),
                        item.getQuantity(),
                        item.getSelectedSize(),
                        item.getSelectedColor()))
                .toList();
    }

    @Transactional
    public List<CartLine> addItem(String email, CartItemRequest request) {
        User user = userService.getOrCreateByEmail(email, null);
        Product product = productService.getProduct(request.getProductId());

        String size  = request.getSelectedSize();
        String color = request.getSelectedColor();

        Optional<CartItem> existing = cartItemRepository
                .findByUserAndProductIdAndSelectedSizeAndSelectedColor(
                        user, product.getId(), size, color);

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem item = new CartItem();
            item.setUser(user);
            item.setProduct(product);
            item.setQuantity(request.getQuantity());
            item.setSelectedSize(size);
            item.setSelectedColor(color);
            cartItemRepository.save(item);
        }

        return getCart(email);
    }

    @Transactional
    public List<CartLine> updateItem(String email, Long productId, int quantity) {
        if (quantity < 1) throw new IllegalArgumentException("Quantity must be at least 1");
        User user = userService.getOrCreateByEmail(email, null);
        CartItem item = cartItemRepository.findByUser(user).stream()
                .filter(c -> c.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + productId));
        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return getCart(email);
    }

    @Transactional
    public List<CartLine> removeItem(String email, Long productId) {
        User user = userService.getOrCreateByEmail(email, null);
        cartItemRepository.findByUser(user).stream()
                .filter(c -> c.getProduct().getId().equals(productId))
                .findFirst()
                .ifPresent(cartItemRepository::delete);
        return getCart(email);
    }

    @Transactional
    public void clear(String email) {
        User user = userService.getOrCreateByEmail(email, null);
        cartItemRepository.deleteByUser(user);
    }
}
