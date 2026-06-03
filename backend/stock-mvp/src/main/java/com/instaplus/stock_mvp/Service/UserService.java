package com.instaplus.stock_mvp.Service;

import com.instaplus.stock_mvp.Model.User;
import com.instaplus.stock_mvp.Repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public User login(String username, String password) {
        return repo.findAllByUsername(username).stream().map(u -> {
            String stored = u.getPassword();
            if (stored == null) return null;
            if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
                return encoder.matches(password, stored) ? u : null;
            }
            if (stored.equals(password)) {
                u.setPassword(encoder.encode(password));
                repo.save(u);
                return u;
            }
            return null;
        }).filter(java.util.Objects::nonNull).findFirst().orElse(null);
    }

    public User save(User user) {
        // encode password before saving
        user.setPassword(encoder.encode(user.getPassword()));
        return repo.save(user);
    }

    public java.util.List<User> findAll() {
        return repo.findAll();
    }

    public java.util.Optional<User> findById(Long id) {
        return repo.findById(id);
    }

    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    public User update(Long id, User updated) {
        return repo.findById(id).map(u -> {
            u.setUsername(updated.getUsername());
            if (updated.getPassword() != null && !updated.getPassword().isEmpty()) {
                u.setPassword(encoder.encode(updated.getPassword()));
            }
            u.setRole(updated.getRole());
            return repo.save(u);
        }).orElse(null);
    }
}