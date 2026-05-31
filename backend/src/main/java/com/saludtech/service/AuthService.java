package com.saludtech.service;

import com.saludtech.dto.AuthResponse;
import com.saludtech.dto.LoginRequest;
import com.saludtech.dto.OtpRequest;
import com.saludtech.dto.RegisterRequest;
import com.saludtech.dto.UserResponse;
import com.saludtech.exception.BusinessLogicException;
import com.saludtech.model.CreditLine;
import com.saludtech.model.User;
import com.saludtech.model.enums.CreditLineType;
import com.saludtech.repository.CreditLineRepository;
import com.saludtech.repository.UserRepository;
import com.saludtech.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CreditLineRepository creditLineRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final OtpService otpService;

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BusinessLogicException("User not found"));

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BusinessLogicException("Error: Email is already in use!");
        }

        if (userRepository.existsByNationalId(signUpRequest.getIdentityDocument())) {
            throw new BusinessLogicException("Error: National ID is already in use!");
        }

        // Create new user's account
        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setPasswordHash(encoder.encode(signUpRequest.getPassword()));
        user.setFullName(signUpRequest.getFirstName() + " " + signUpRequest.getLastName());
        user.setNationalId(signUpRequest.getIdentityDocument());
        user.setPhone(signUpRequest.getPhone());
        user.setLevel((short) 1); // Start at level 1

        User savedUser = userRepository.save(user);

        // Assign ESPECIALIDAD_PRINCIPAL credit line (base $50 for Level 1)
        BigDecimal principalLimit = new BigDecimal("50.00");
        CreditLine cl = new CreditLine();
        cl.setUser(savedUser);
        cl.setType(CreditLineType.ESPECIALIDAD_PRINCIPAL);
        cl.setLimitUsd(principalLimit);
        cl.setUsedUsd(BigDecimal.ZERO);
        creditLineRepository.save(cl);

        // Assign SALUD_COTIDIANA credit line (Línea Salud Diaria = 1/3 of principal)
        CreditLine dailyCl = new CreditLine();
        dailyCl.setUser(savedUser);
        dailyCl.setType(CreditLineType.SALUD_COTIDIANA);
        dailyCl.setLimitUsd(principalLimit.divide(new BigDecimal("3"), 2, java.math.RoundingMode.FLOOR));
        dailyCl.setUsedUsd(BigDecimal.ZERO);
        creditLineRepository.save(dailyCl);

        // Assign MAYOR_CUIDADO credit line (Empty initially until approved)
        CreditLine mayorCl = new CreditLine();
        mayorCl.setUser(savedUser);
        mayorCl.setType(CreditLineType.MAYOR_CUIDADO);
        mayorCl.setLimitUsd(BigDecimal.ZERO);
        mayorCl.setUsedUsd(BigDecimal.ZERO);
        creditLineRepository.save(mayorCl);

        String otpCode = otpService.generateAndStore(savedUser.getPhone());

        return AuthResponse.builder()
                .user(mapToUserResponse(savedUser))
                .otpCode(otpCode)
                .phoneVerified(false)
                .build();
    }

    @Transactional
    public AuthResponse verifyOtp(OtpRequest request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new BusinessLogicException("User not found for phone: " + request.getPhone()));

        if (!otpService.validate(request.getPhone(), request.getCode())) {
            throw new BusinessLogicException("Invalid or expired OTP code");
        }

        user.setPhoneVerified(true);
        userRepository.save(user);

        String jwt = jwtUtils.generateJwtToken(user.getEmail());

        return AuthResponse.builder()
                .token(jwt)
                .user(mapToUserResponse(user))
                .phoneVerified(true)
                .build();
    }

    public AuthResponse resendOtp(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new BusinessLogicException("User not found for phone: " + phone));

        String otpCode = otpService.generateAndStore(user.getPhone());

        return AuthResponse.builder()
                .user(mapToUserResponse(user))
                .otpCode(otpCode)
                .phoneVerified(false)
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());

        String fullName = user.getFullName();
        if (fullName != null && fullName.contains(" ")) {
            response.setFirstName(fullName.substring(0, fullName.indexOf(" ")));
            response.setLastName(fullName.substring(fullName.indexOf(" ") + 1));
        } else {
            response.setFirstName(fullName);
            response.setLastName("");
        }

        response.setLevel(user.getLevel());
        return response;
    }
}
