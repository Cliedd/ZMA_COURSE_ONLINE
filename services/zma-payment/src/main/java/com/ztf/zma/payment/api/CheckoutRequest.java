package com.ztf.zma.payment.api;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class CheckoutRequest {

    @NotBlank(message = "must not be blank")
    private String courseId;

    private String promoCode;

    public CheckoutRequest() {}

    @JsonCreator
    public CheckoutRequest(@JsonProperty("courseId") String courseId,
                          @JsonProperty("promoCode") String promoCode) {
        this.courseId = courseId;
        this.promoCode = promoCode;
    }

    public String courseId() {
        return courseId;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String promoCode() {
        return promoCode;
    }

    public String getPromoCode() {
        return promoCode;
    }

    public void setPromoCode(String promoCode) {
        this.promoCode = promoCode;
    }
}
