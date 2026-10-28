package com.tajfolio.auth.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserStatus {
    ACTIVE,
    RECRUITER_PENDING,
    ADMIN_PENDING,
    SUSPENDED;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static UserStatus fromValue(String value) {
        try {
            return UserStatus.valueOf(value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
