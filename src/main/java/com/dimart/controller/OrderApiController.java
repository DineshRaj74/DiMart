package com.dimart.controller;

import com.dimart.model.Order;
import com.dimart.model.OrderRequest;
import com.dimart.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * Plain REST API — no login required. OrderRequest already carries
 * the customer's email, so that is used to identify who the order
 * belongs to.
 */
@RestController
@RequestMapping("/api/orders")
public class OrderApiController {

    private final OrderService orderService;

    public OrderApiController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> placeOrder(@Valid @RequestBody OrderRequest request) {
        return orderService.placeOrder(request.getEmail(), request);
    }

    @GetMapping
    public List<Order> myOrders(@RequestParam String email) {
        return orderService.getOrdersForUser(email);
    }
}
