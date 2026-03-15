package io.cybersensei.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.cybersensei.api.dto.AuthRequest;
import io.cybersensei.api.dto.AuthResponse;
import io.cybersensei.api.dto.UserDto;
import io.cybersensei.domain.entity.User;
import io.cybersensei.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    // ---- POST /api/auth/login - valid credentials ----

    @Test
    void login_validCredentials_shouldReturnTokenAndUser() throws Exception {
        AuthRequest request = AuthRequest.builder()
                .email("admin@cybersensei.io")
                .password("securePassword123")
                .build();

        UserDto userDto = UserDto.builder()
                .id(1L)
                .name("Admin")
                .email("admin@cybersensei.io")
                .role(User.UserRole.ADMIN)
                .active(true)
                .build();

        AuthResponse response = AuthResponse.builder()
                .token("jwt-access-token")
                .refreshToken("jwt-refresh-token")
                .user(userDto)
                .build();

        when(userService.authenticate(any(AuthRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-access-token"))
                .andExpect(jsonPath("$.refreshToken").value("jwt-refresh-token"))
                .andExpect(jsonPath("$.user.id").value(1))
                .andExpect(jsonPath("$.user.email").value("admin@cybersensei.io"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"));
    }

    // ---- POST /api/auth/login - invalid credentials ----

    @Test
    void login_invalidCredentials_shouldReturnError() throws Exception {
        AuthRequest request = AuthRequest.builder()
                .email("wrong@test.com")
                .password("wrongPassword")
                .build();

        when(userService.authenticate(any(AuthRequest.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    // ---- POST /api/auth/login - missing fields (validation) ----

    @Test
    void login_missingEmail_shouldReturn400() throws Exception {
        AuthRequest request = AuthRequest.builder()
                .password("somePassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_invalidEmailFormat_shouldReturn400() throws Exception {
        String json = """
                {"email": "not-an-email", "password": "somePassword"}
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }
}
