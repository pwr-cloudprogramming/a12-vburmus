package com.burmus.user.service;

import com.burmus.result.model.User;
import com.burmus.user.repository.UserRepository;
import com.burmus.utils.AwsUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User getUserByEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            return userRepository.getByEmail(email);
        }
        throw new NoSuchElementException();
    }

    public User create(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return userRepository.getByEmail(user.getEmail());
        }
        return userRepository.save(user);
    }

    public String loadImage(MultipartFile image, String email) {

        email = email.replaceAll("@", "_")
                     .replaceAll("\\.", "_");

        return AwsUtils.loadImage(image, "users/", email);
    }
    public List<User> getAllUsers() {
        var x = userRepository.findAll();
        return x;
    }
}
