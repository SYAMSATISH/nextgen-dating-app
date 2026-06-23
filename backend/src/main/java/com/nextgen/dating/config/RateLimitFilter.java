import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // key = clientIP + endpoint -> Bucket
    private static final Map<String, Bucket> bucketCache = new ConcurrentHashMap<>();

    // Different limits per endpoint
    private Bucket resolveBucket(String key, String path) {
        return bucketCache.computeIfAbsent(key, k -> createBucketForPath(path));
    }

    private Bucket createBucketForPath(String path) {
        Bandwidth limit;

        if (path.contains("/api/login") || path.contains("/api/signin")) {
            limit = Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1))); // 5/min
        } else if (path.contains("/api/otp")) {
            limit = Bandwidth.classic(3, Refill.greedy(3, Duration.ofMinutes(1))); // 3/min
        } else if (path.contains("/api/signup") || path.contains("/api/register")) {
            limit = Bandwidth.classic(5, Refill.greedy(5, Duration.ofHours(1))); // 5/hour
        } else if (path.contains("/api/icebreakers") || path.contains("/api/smart-reply")) {
            limit = Bandwidth.classic(20, Refill.greedy(20, Duration.ofMinutes(1))); // 20/min (AI calls)
        } else {
            limit = Bandwidth.classic(100, Refill.greedy(100, Duration.ofMinutes(1))); // 100/min general
        }

        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (!path.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIP = getClientIP(request);
        String userId = request.getHeader("X-User-Id");
        String key = (userId != null && !userId.isEmpty() ? userId : clientIP) + ":" + path;

        Bucket bucket = resolveBucket(key, path);

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429); // Too Many Requests
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"allowed\": false, \"message\": \"Too many requests. Please slow down and try again shortly.\"}"
            );
        }
    }
}
