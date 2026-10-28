package com.tajfolio.auth.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Role {
    CANDIDATE,
    RECRUITER,
    ADMIN;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static Role fromValue(String value) {
        try {
            return Role.valueOf(value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
