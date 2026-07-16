package com.dimart.service;

import com.dimart.model.*;
import com.dimart.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    private final ProductService productService;
    private final CartService cartService;
    private final OrderRepository orderRepository;
    private final UserService userService;

    public OrderService(ProductService productService,
                        CartService cartService,
                        OrderRepository orderRepository,
                        UserService userService) {
        this.productService = productService;
        this.cartService = cartService;
        this.orderRepository = orderRepository;
        this.userService = userService;
    }

    @Transactional
    public Map<String, Object> placeOrder(String email, OrderRequest request) {
        User user = userService.getOrCreateByEmail(email, request.getCustomerName());

        double subtotal = 0;
        int itemCount = 0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItemRequest item : request.getItems()) {
            Product product = productService.getProduct(item.getProductId());
            double lineTotal = product.getPrice() * item.getQuantity();
            subtotal += lineTotal;
            itemCount += item.getQuantity();

            OrderItem oi = new OrderItem();
            oi.setProduct(product);
            oi.setQuantity(item.getQuantity());
            oi.setPriceAtPurchase(product.getPrice());
            oi.setSelectedSize(item.getSelectedSize());
            oi.setSelectedColor(item.getSelectedColor());
            orderItems.add(oi);
        }

        double shipping = subtotal >= 3999 ? 0 : 149;
        double tax = Math.round(subtotal * 0.05);
        double total = subtotal + shipping + tax;

        Order order = new Order();
        order.setOrderNumber("DIM-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        order.setUser(user);
        order.setCustomerName(request.getCustomerName());
        order.setEmail(request.getEmail());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setCity(request.getCity());
        order.setState(request.getState());
        order.setPincode(request.getPincode());
        order.setSubtotal(subtotal);
        order.setShipping(shipping);
        order.setTax(tax);
        order.setTotal(total);
        order.setStatus("PLACED");

        orderItems.forEach(oi -> oi.setOrder(order));
        order.setItems(orderItems);

        orderRepository.save(order);
        cartService.clear(email);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("orderNumber", order.getOrderNumber());
        response.put("customerName", order.getCustomerName());
        response.put("itemCount", itemCount);
        response.put("subtotal", subtotal);
        response.put("shipping", shipping);
        response.put("tax", tax);
        response.put("total", total);
        response.put("status", "PLACED");
        return response;
    }

    public List<Order> getOrdersForUser(String email) {
        User user = userService.findByEmail(email);
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }
}
