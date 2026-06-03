package com.instaplus.stock_mvp.Controller;

import com.instaplus.stock_mvp.Model.User;
import com.instaplus.stock_mvp.Service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    public List<User> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> get(@PathVariable Long id) {
        return service.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public User create(@RequestBody User user) {
        return service.save(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id, @RequestBody User user) {
        User u = service.update(id, user);
        if (u == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(u);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
