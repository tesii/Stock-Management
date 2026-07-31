package com.instaplus.stock_mvp.Service;

import com.instaplus.stock_mvp.Model.User;
import com.instaplus.stock_mvp.Repository.UserRepository;
import com.instaplus.stock_mvp.Model.LoginResponse;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service
public class UserService {

    private final UserRepository repo;
    private final AuditService auditService;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();


    public UserService(
            UserRepository repo,
            AuditService auditService
    ) {
        this.repo = repo;
        this.auditService = auditService;
    }



    // ================= LOGIN =================

    public LoginResponse login(String username, String password) {


        Optional<User> optionalUser = repo.findByUsername(username);


        if (optionalUser.isEmpty()) {

            auditService.log(
                    username,
                    "UNKNOWN",
                    "FAILED_LOGIN",
                    "User",
                    null,
                    "Failed login attempt"
            );

            return new LoginResponse(
                    false,
                    "Invalid username or password",
                    null
            );
        }



        User user = optionalUser.get();

        String stored = user.getPassword();



        if (stored == null) {

            return new LoginResponse(
                    false,
                    "Invalid username or password",
                    null
            );
        }




        if (stored.startsWith("$2a$")
                || stored.startsWith("$2b$")
                || stored.startsWith("$2y$")) {


            if (encoder.matches(password, stored)) {


                auditService.log(
                        user.getUsername(),
                        user.getRole(),
                        "LOGIN",
                        "User",
                        user.getId(),
                        "User logged in successfully"
                );


                return new LoginResponse(
                        true,
                        "Login successful",
                        user
                );


            } else {


                auditService.log(
                        user.getUsername(),
                        user.getRole(),
                        "FAILED_LOGIN",
                        "User",
                        user.getId(),
                        "Wrong password attempt"
                );


                return new LoginResponse(
                        false,
                        "Invalid username or password",
                        null
                );
            }
        }




        // Old plain text password migration

        if (stored.equals(password)) {


            user.setPassword(
                    encoder.encode(password)
            );


            repo.save(user);



            auditService.log(
                    user.getUsername(),
                    user.getRole(),
                    "LOGIN",
                    "User",
                    user.getId(),
                    "Login successful after password migration"
            );


            return new LoginResponse(
                    true,
                    "Login successful",
                    user
            );

        }



        return new LoginResponse(
                false,
                "Invalid username or password",
                null
        );

    }





    // ================= CREATE USER =================

    public User save(User user) {


        user.setPassword(
                encoder.encode(user.getPassword())
        );


        User saved = repo.save(user);



        auditService.log(
                saved.getUsername(),
                saved.getRole(),
                "CREATE_USER",
                "User",
                saved.getId(),
                "Created user: " + saved.getUsername()
        );


        return saved;
    }







    // ================= GET USERS =================

    public List<User> findAll() {

        return repo.findAll();

    }





    public Optional<User> findById(Long id) {

        return repo.findById(id);

    }






    // ================= DELETE USER =================

    public void deleteById(Long id) {


        User user = repo.findById(id)
                .orElse(null);



        if(user != null) {


            repo.deleteById(id);



            auditService.log(
                    user.getUsername(),
                    user.getRole(),
                    "DELETE_USER",
                    "User",
                    id,
                    "Deleted user: " + user.getUsername()
            );

        }

    }








    // ================= UPDATE USER =================

    public User update(Long id, User updated) {


        return repo.findById(id)
                .map(u -> {


                    u.setUsername(updated.getUsername());


                    if(updated.getPassword() != null 
                            && !updated.getPassword().isEmpty()) {

                        u.setPassword(
                                encoder.encode(updated.getPassword())
                        );

                    }


                    u.setRole(updated.getRole());


                    User saved = repo.save(u);



                    auditService.log(
                            saved.getUsername(),
                            saved.getRole(),
                            "UPDATE_USER",
                            "User",
                            saved.getId(),
                            "Updated user: " + saved.getUsername()
                    );



                    return saved;


                })
                .orElse(null);

    }

}