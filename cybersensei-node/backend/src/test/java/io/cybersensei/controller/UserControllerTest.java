package io.cybersensei.controller;

import io.cybersensei.api.controller.UserController;
import io.cybersensei.api.dto.UserDto;
import io.cybersensei.domain.entity.User;
import io.cybersensei.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller unit tests
 */
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    @WithMockUser(username = "test@example.com", roles = "EMPLOYEE")
    void shouldGetCurrentUser() throws Exception {
        // Given
        UserDto userDto = UserDto.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .role(User.UserRole.EMPLOYEE)
                .active(true)
                .build();

        when(userService.getCurrentUser()).thenReturn(userDto);

        // When & Then
        mockMvc.perform(get("/api/user/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void shouldReturn401WhenNotAuthenticated() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/user/me"))
                .andExpect(status().isUnauthorized());
    }
}


