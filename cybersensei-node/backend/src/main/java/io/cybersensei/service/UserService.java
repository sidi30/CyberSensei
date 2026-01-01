package io.cybersensei.service;

import io.cybersensei.api.dto.AuthRequest;
import io.cybersensei.api.dto.AuthResponse;
import io.cybersensei.api.dto.TeamsTokenExchangeRequest;
import io.cybersensei.api.dto.TeamsTokenExchangeResponse;
import io.cybersensei.api.dto.UserDto;
import io.cybersensei.api.mapper.UserMapper;
import io.cybersensei.domain.entity.User;
import io.cybersensei.domain.repository.UserRepository;
import io.cybersensei.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * User Management Service
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // MODE BYPASS : Si pas d'authentification ou authentification anonyme, retourner un utilisateur par défaut
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            // Essayer de récupérer le premier utilisateur de la base
            User defaultUser = userRepository.findAll().stream()
                    .findFirst()
                    .orElse(User.builder()
                            .id(1L)
                            .email("admin@cybersensei.io")
                            .name("Admin Bypass")
                            .role(User.UserRole.ADMIN)
                            .department("IT")
                            .active(true)
                            .build());
            return userMapper.toDto(defaultUser);
        }
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return userMapper.toDto(user);
    }

    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(userMapper.toDto(user))
                .build();
    }

    @Transactional
    public UserDto createUser(String email, String name, String password, User.UserRole role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User already exists with email: " + email);
        }

        User user = User.builder()
                .email(email)
                .name(name)
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .active(true)
                .build();

        user = userRepository.save(user);
        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto createOrUpdateFromMsTeams(String msTeamsId, String email, String name) {
        User user = userRepository.findByMsTeamsId(msTeamsId)
                .orElseGet(() -> userRepository.findByEmail(email)
                        .orElse(User.builder()
                                .msTeamsId(msTeamsId)
                                .email(email)
                                .name(name)
                                .role(User.UserRole.EMPLOYEE)
                                .active(true)
                                .build()));

        user.setMsTeamsId(msTeamsId);
        user.setEmail(email);
        user.setName(name);
        
        user = userRepository.save(user);
        return userMapper.toDto(user);
    }

    @Transactional
    public TeamsTokenExchangeResponse exchangeTeamsToken(TeamsTokenExchangeRequest request) {
        // Find or create user from Teams data
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(User.builder()
                        .email(request.getEmail())
                        .name(request.getDisplayName())
                        .department(request.getDepartment())
                        .role(User.UserRole.EMPLOYEE)
                        .active(true)
                        .build());

        // Update user info from Teams
        user.setName(request.getDisplayName());
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }
        
        user = userRepository.save(user);

        // Generate JWT token for the user
        String token = tokenProvider.generateToken(user.getId(), user.getEmail());

        return TeamsTokenExchangeResponse.builder()
                .token(token)
                .userId(user.getId())
                .role(user.getRole().name())
                .build();
    }
}


