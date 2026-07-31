package com.instaplus.stock_mvp.Controller;

import com.instaplus.stock_mvp.Model.User;
import com.instaplus.stock_mvp.Service.UserService;
import com.instaplus.stock_mvp.Model.LoginResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService service;

    public AuthController(UserService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody User user) {
        return service.login(user.getUsername(), user.getPassword());
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("STORE_KEEPER");
        }
        return service.save(user);
    }
}