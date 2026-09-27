package com.example.demo.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    /**
     * Returns the id of the currently authenticated user.
     * Every controller endpoint that touches transaction/statistics data should scope
     * its queries by this id instead of trusting any id supplied by the client.
     */
    public static Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("No authenticated user in the current request");
        }

        return principal.getId();
    }
}
