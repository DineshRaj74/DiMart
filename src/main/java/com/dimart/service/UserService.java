package com.dimart.service;

import com.dimart.model.User;
import com.dimart.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Plain lookup/creation for the customer tied to a cart or order.
 * There is no login, no password, no roles here — just a REST API.
 * A user record is created automatically the first time an email
 * is used to add to a cart or place an order.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User getOrCreateByEmail(String email, String name) {
        String normalizedEmail = email.toLowerCase().trim();
        return userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> {
                    User user = new User();
                    user.setEmail(normalizedEmail);
                    user.setName((name != null && !name.isBlank()) ? name : normalizedEmail);
                    return userRepository.save(user);
                });
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }
}
