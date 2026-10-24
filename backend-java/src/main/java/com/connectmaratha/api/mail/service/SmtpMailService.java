package com.connectmaratha.api.mail.service;

import jakarta.mail.internet.MimeMessage;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

/**
 * Sends the same emails as the Node mailer (templates copied into
 * resources/mail). Uses SMTP when SMTP_HOST/USER/PASS are set; otherwise, like
 * Node, it only logs. Unlike Node, a reset code is never written to the log in
 * production.
 */
@Service
public class SmtpMailService implements MailService {

    private static final Logger log = LoggerFactory.getLogger(SmtpMailService.class);
    private static final String PLACEHOLDER_PASSWORD = "REPLACE_WITH_YOUR_HOSTINGER_PASSWORD";

    private final JavaMailSenderImpl sender;
    private final String from;
    private final boolean production;
    private final ExecutorService background = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "welcome-mail");
        t.setDaemon(true);
        return t;
    });

    public SmtpMailService(@Value("${app.mail.host:}") String host,
                           @Value("${app.mail.port:465}") int port,
                           @Value("${app.mail.user:}") String user,
                           @Value("${app.mail.pass:}") String pass,
                           @Value("${app.mail.from}") String from,
                           @Value("${app.production:false}") boolean production) {
        this.from = from;
        this.production = production;
        if (!host.isBlank() && !user.isBlank() && !pass.isBlank() && !PLACEHOLDER_PASSWORD.equals(pass)) {
            JavaMailSenderImpl s = new JavaMailSenderImpl();
            s.setHost(host);
            s.setPort(port);
            s.setUsername(user);
            s.setPassword(pass);
            s.setDefaultEncoding(StandardCharsets.UTF_8.name());
            Properties p = s.getJavaMailProperties();
            p.put("mail.smtp.auth", "true");
            // nodemailer: secure = (port === 465); other ports upgrade with STARTTLS.
            if (port == 465) p.put("mail.smtp.ssl.enable", "true");
            else p.put("mail.smtp.starttls.enable", "true");
            p.put("mail.smtp.connectiontimeout", "10000");
            p.put("mail.smtp.timeout", "15000");
            this.sender = s;
        } else {
            this.sender = null;
        }
    }

    @Override
    public void sendPasswordResetOtp(String to, String name, String otp) {
        String displayName = name == null || name.isBlank() ? "सदस्य" : name;
        boolean sent = send(to, "noreply@connectmaratha.com", "🔐 [Connect Maratha] पासवर्ड रीसेट सुरक्षा OTP",
            fill("password-reset-otp.txt", displayName, otp, null, false),
            fill("password-reset-otp.html", displayName, otp, null, true));
        if (sent) return;
        if (production) {
            log.warn("[MAILER] Password reset email to {} was not delivered (SMTP not configured or failed)", to);
        } else {
            log.info("[MAILER] (dev) Password reset OTP for {}: {}", to, otp);
        }
    }

    @Override
    public void sendWelcome(String to, String name, String memberId) {
        String displayName = name == null || name.isBlank() ? "सदस्य" : name;
        background.submit(() -> {
            boolean sent = send(to, "info@connectmaratha.com", "🚩 [Connect Maratha] कनेक्ट मराठा परिवारात आपले सहर्ष स्वागत!",
                fill("welcome.txt", displayName, null, memberId, false),
                fill("welcome.html", displayName, null, memberId, true));
            if (!sent) log.info("[MAILER] Welcome email (not sent): to={} id={}", to, memberId);
        });
    }

    /** True when SMTP accepted the message. */
    private boolean send(String to, String replyTo, String subject, String text, String html) {
        if (sender == null) return false;
        try {
            MimeMessage msg = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, StandardCharsets.UTF_8.name());
            helper.setFrom(from);
            helper.setTo(to);
            helper.setReplyTo(replyTo);
            helper.setSubject(subject);
            helper.setText(text, html);
            sender.send(msg);
            log.info("[MAILER] '{}' sent to {}", subject, to);
            return true;
        } catch (Exception e) {
            log.error("[MAILER] Failed to send '{}' to {}: {}", subject, to, e.getMessage());
            return false;
        }
    }

    private static final Pattern MEMBER_ID_WITH_DEFAULT = Pattern.compile("\\{\\{memberId\\|([^}]*)}}");

    /** Fills {{name}}, {{otp}}, {{memberId}} and {{memberId|fallback}}; HTML-escapes in HTML templates. */
    static String fill(String template, String name, String otp, String memberId, boolean html) {
        String text = load(template);
        String safeName = html ? HtmlUtils.htmlEscape(name) : name;
        String safeId = memberId == null ? null : (html ? HtmlUtils.htmlEscape(memberId) : memberId);
        Matcher m = MEMBER_ID_WITH_DEFAULT.matcher(text);
        StringBuilder sb = new StringBuilder();
        while (m.find()) {
            String value = safeId == null || safeId.isEmpty() ? m.group(1) : safeId;
            m.appendReplacement(sb, Matcher.quoteReplacement(value));
        }
        m.appendTail(sb);
        return sb.toString()
            .replace("{{name}}", safeName)
            .replace("{{otp}}", otp == null ? "" : otp)
            .replace("{{memberId}}", safeId == null ? "" : safeId);
    }

    private static String load(String template) {
        try {
            return new ClassPathResource("mail/" + template).getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
