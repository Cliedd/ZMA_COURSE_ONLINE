package com.ztf.zma.payment.api;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.ztf.zma.payment.domain.PaymentProvider;
import jakarta.validation.constraints.NotBlank;

public class CheckoutRequest {

    @NotBlank(message = "must not be blank")
    private String courseId;

    private String promoCode;

    /**
     * Which gateway to route this checkout through. Optional at the DTO
     * level — free courses (amount <= 0) never touch a gateway, so the
     * frontend isn't forced to collect a provider selection it doesn't need.
     * PaymentService rejects a null provider for any course that turns out
     * to actually cost something.
     */
    private PaymentProvider provider;

    public CheckoutRequest() {}

    @JsonCreator
    public CheckoutRequest(@JsonProperty("courseId") String courseId,
                          @JsonProperty("promoCode") String promoCode,
                          @JsonProperty("provider") PaymentProvider provider) {
        this.courseId = courseId;
        this.promoCode = promoCode;
        this.provider = provider;
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

    public PaymentProvider provider() {
        return provider;
    }

    public PaymentProvider getProvider() {
        return provider;
    }

    public void setProvider(PaymentProvider provider) {
        this.provider = provider;
    }
}
