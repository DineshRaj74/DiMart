package com.dimart.controller;

import com.dimart.model.CartItemRequest;
import com.dimart.model.CartLine;
import com.dimart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Plain REST API — no login, no sessions. The caller identifies the
 * cart owner by passing their email as a request parameter.
 */
@RestController
@RequestMapping("/api/cart")
public class CartApiController {

    private final CartService cartService;

    public CartApiController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public List<CartLine> cart(@RequestParam String email) {
        return cartService.getCart(email);
    }

    @PostMapping
    public List<CartLine> add(@RequestParam String email,
                               @Valid @RequestBody CartItemRequest request) {
        return cartService.addItem(email, request);
    }

    @PutMapping("/{productId}")
    public List<CartLine> update(@RequestParam String email,
                                  @PathVariable Long productId,
                                  @RequestParam int quantity) {
        return cartService.updateItem(email, productId, quantity);
    }

    @DeleteMapping("/{productId}")
    public List<CartLine> remove(@RequestParam String email,
                                  @PathVariable Long productId) {
        return cartService.removeItem(email, productId);
    }
}
