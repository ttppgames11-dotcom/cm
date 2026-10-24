package com.connectmaratha.api.mail.service;

/** Emails the auth flows send (Node: backend/utils/mailer.js). */
public interface MailService {

    /** The 6-digit password reset code. Sent before the reply, like Node. */
    void sendPasswordResetOtp(String to, String name, String otp);

    /** Welcome email after registration. Sent in the background, like Node. */
    void sendWelcome(String to, String name, String memberId);
}
