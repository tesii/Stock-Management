package com.instaplus.stock_mvp;

import com.instaplus.stock_mvp.Model.LoginResponse;
import com.instaplus.stock_mvp.Model.User;
import com.instaplus.stock_mvp.Repository.UserRepository;
import com.instaplus.stock_mvp.Service.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository repo;

    @InjectMocks
    private UserService service;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UserServiceTest() {
        MockitoAnnotations.openMocks(this);
    }

    // 1. LOGIN SUCCESS (BCrypt password)
    @Test
    void testLoginSuccess() {

        User user = new User();
        user.setUsername("admin");
        user.setPassword(encoder.encode("1234"));
        user.setRole("ADMIN");

        when(repo.findByUsername("admin")).thenReturn(Optional.of(user));

        LoginResponse response = service.login("admin", "1234");

        assertTrue(response.isSuccess());
        assertEquals("Login successful", response.getMessage());

        System.out.println("✅ LOGIN SUCCESS TEST PASSED");
    }

    // 2. LOGIN FAIL (wrong password)
    @Test
    void testLoginFailWrongPassword() {

        User user = new User();
        user.setUsername("admin");
        user.setPassword(encoder.encode("1234"));

        when(repo.findByUsername("admin")).thenReturn(Optional.of(user));

        LoginResponse response = service.login("admin", "wrong");

        assertFalse(response.isSuccess());
        assertEquals("Invalid username or password", response.getMessage());

        System.out.println("❌ LOGIN FAIL TEST PASSED (wrong password handled)");
    }

    // 3. LOGIN FAIL (user not found)
    @Test
    void testLoginUserNotFound() {

        when(repo.findByUsername("ghost")).thenReturn(Optional.empty());

        LoginResponse response = service.login("ghost", "1234");

        assertFalse(response.isSuccess());
        assertEquals("Invalid username or password", response.getMessage());

        System.out.println("❌ LOGIN FAIL TEST PASSED (user not found)");
    }

    // 4. REGISTER USER
    @Test
    void testSaveUser() {

        User user = new User();
        user.setUsername("john");
        user.setPassword("1234");

        when(repo.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User result = service.save(user);

        assertNotNull(result);
        assertNotEquals("1234", result.getPassword()); // must be encoded

        System.out.println("✅ REGISTER TEST PASSED");
        System.out.println("✔ User created: " + result.getUsername());
    }

    // 5. UPDATE USER
    @Test
    void testUpdateUser() {

        User existing = new User();
        existing.setUsername("old");
        existing.setPassword(encoder.encode("1234"));
        existing.setRole("STORE_KEEPER");

        User updated = new User();
        updated.setUsername("new");
        updated.setPassword("9999");
        updated.setRole("ADMIN");

        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User result = service.update(1L, updated);

        assertEquals("new", result.getUsername());
        assertEquals("ADMIN", result.getRole());

        System.out.println("✅ UPDATE USER TEST PASSED");
    }
}